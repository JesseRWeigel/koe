import { createHmac, randomUUID } from "node:crypto";
import {
  createRemoteJWKSet,
  customFetch,
  jwtVerify,
  type JWTPayload,
} from "jose";
import type { ZodType } from "zod";
import {
  createNeonQuotaStore,
  type AiQuotaLease,
  type AiQuotaStore,
} from "./quota-store";

const MAX_TOKEN_BYTES = 8 * 1024;
const DEFAULT_BODY_BYTES = 64 * 1024;
const DEFAULT_DEADLINE_MS = 30_000;
const DEFAULT_RELEASE_TIMEOUT_MS = 1_000;

export class AiRouteError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

export interface LocalAiRouteConfig {
  mode: "local";
}

export interface HostedAiRouteConfig {
  mode: "hosted";
  jwksUrl: URL;
  issuer: string;
  audience: string;
  publicOrigin: string;
  cookieName: string;
  subjectSecret: string;
  databaseUrl: string;
}

export type AiRouteConfig = LocalAiRouteConfig | HostedAiRouteConfig;
export type JwksFetcher = typeof fetch;

const jwksResolvers = new WeakMap<
  JwksFetcher,
  Map<string, ReturnType<typeof createRemoteJWKSet>>
>();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() !== value) {
    throw new Error(name + " must be configured without surrounding whitespace.");
  }
  return value;
}

function isLoopback(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname);
}

function configuredHttpsUrl(name: string, originOnly = false): URL {
  const value = requireEnv(name);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(name + " must be a valid HTTPS URL.");
  }
  const loopbackDev =
    process.env.NODE_ENV !== "production" &&
    url.protocol === "http:" &&
    isLoopback(url.hostname);
  if (
    (url.protocol !== "https:" && !loopbackDev) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (originOnly && url.pathname !== "/")
  ) {
    throw new Error(
      name + " must use HTTPS without credentials, a query, or a fragment.",
    );
  }
  return url;
}

export function getAiRouteConfig(): AiRouteConfig {
  const configuredMode = process.env.AI_ROUTE_MODE;
  const mode =
    configuredMode ??
    (process.env.NODE_ENV === "production" ? undefined : "local");
  if (mode !== "local" && mode !== "hosted") {
    throw new Error('AI_ROUTE_MODE must be explicitly set to "local" or "hosted".');
  }
  if (mode === "local") {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.AI_ALLOW_LOCAL_PRODUCTION !== "true"
    ) {
      throw new Error(
        "AI_ALLOW_LOCAL_PRODUCTION=true is required for local mode in production.",
      );
    }
    return { mode };
  }

  const subjectSecret = requireEnv("AI_LIMIT_SUBJECT_SECRET");
  if (subjectSecret.length < 32) {
    throw new Error("AI_LIMIT_SUBJECT_SECRET must contain at least 32 characters.");
  }
  const issuer = requireEnv("AI_AUTH_ISSUER");
  configuredHttpsUrl("AI_AUTH_ISSUER");
  const cookieName = process.env.AI_AUTH_COOKIE || "koe_session";
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(cookieName)) {
    throw new Error("AI_AUTH_COOKIE must be a simple cookie name.");
  }
  return {
    mode,
    jwksUrl: configuredHttpsUrl("AI_AUTH_JWKS_URL"),
    issuer,
    audience: requireEnv("AI_AUTH_AUDIENCE"),
    publicOrigin: configuredHttpsUrl("AI_PUBLIC_ORIGIN", true).origin,
    cookieName,
    subjectSecret,
    databaseUrl: requireEnv("DATABASE_URL"),
  };
}

function abortError(): AiRouteError {
  return new AiRouteError(504, "request_timeout", "The AI request timed out.");
}

async function raceWithSignal<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) {
    void promise.catch(() => undefined);
    throw abortError();
  }
  return await new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

function cancelReader(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  reason?: unknown,
): void {
  try {
    void reader.cancel(reason).catch(() => undefined);
  } catch {
    // The stream may already be errored or unlocked.
  }
}

function validateRequestBoundary(request: Request, config: AiRouteConfig): void {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (mediaType !== "application/json") {
    throw new AiRouteError(
      415,
      "unsupported_media_type",
      "Content-Type must be application/json.",
    );
  }
  if (config.mode !== "local") return;

  const url = new URL(request.url);
  if (!isLoopback(url.hostname)) {
    throw new AiRouteError(
      403,
      "local_only",
      "Local AI mode accepts loopback requests only.",
    );
  }
  const host = request.headers.get("host");
  if (host) {
    let hostName: string;
    try {
      hostName = new URL("http://" + host).hostname;
    } catch {
      throw new AiRouteError(403, "local_only", "Invalid local request host.");
    }
    if (!isLoopback(hostName)) {
      throw new AiRouteError(
        403,
        "local_only",
        "Local AI mode accepts loopback requests only.",
      );
    }
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) {
    throw new AiRouteError(403, "invalid_origin", "Request origin is not allowed.");
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw new AiRouteError(
      403,
      "invalid_origin",
      "Cross-site AI requests are not allowed.",
    );
  }
}

function getCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const entry of header.split(";")) {
    const separator = entry.indexOf("=");
    if (separator < 0) continue;
    if (entry.slice(0, separator).trim() === name) {
      return entry.slice(separator + 1).trim();
    }
  }
  return undefined;
}

function tokenSources(
  request: Request,
  config: HostedAiRouteConfig,
): { bearer?: string; cookie?: string } {
  const authorization = request.headers.get("authorization");
  let bearer: string | undefined;
  if (authorization) {
    const match = /^Bearer ([^\s]+)$/.exec(authorization);
    if (!match) {
      throw new AiRouteError(401, "invalid_auth", "Authentication failed.");
    }
    bearer = match[1];
  }
  const cookie = getCookie(request, config.cookieName);
  if (!bearer && !cookie) {
    throw new AiRouteError(401, "authentication_required", "Authentication required.");
  }
  if (cookie && request.headers.get("origin") !== config.publicOrigin) {
    throw new AiRouteError(403, "invalid_origin", "Request origin is not allowed.");
  }
  for (const token of [bearer, cookie]) {
    if (token && new TextEncoder().encode(token).byteLength > MAX_TOKEN_BYTES) {
      throw new AiRouteError(401, "invalid_auth", "Authentication failed.");
    }
  }
  return { bearer, cookie };
}

function hasAiScope(payload: JWTPayload): boolean {
  const scope = payload.scope;
  if (typeof scope === "string") {
    return scope.split(/\s+/).includes("ai:invoke");
  }
  return (
    Array.isArray(scope) &&
    scope.every((value) => typeof value === "string") &&
    scope.includes("ai:invoke")
  );
}

function getJwksResolver(
  config: HostedAiRouteConfig,
  fetcher: JwksFetcher,
): ReturnType<typeof createRemoteJWKSet> {
  let byUrl = jwksResolvers.get(fetcher);
  if (!byUrl) {
    byUrl = new Map();
    jwksResolvers.set(fetcher, byUrl);
  }
  const key = config.jwksUrl.href;
  let resolver = byUrl.get(key);
  if (!resolver) {
    resolver = createRemoteJWKSet(config.jwksUrl, {
      timeoutDuration: 5_000,
      cooldownDuration: 30_000,
      [customFetch]: fetcher,
    });
    byUrl.set(key, resolver);
  }
  return resolver;
}

async function verifiedSubject(
  token: string,
  config: HostedAiRouteConfig,
  signal: AbortSignal,
  fetcher: JwksFetcher,
): Promise<string> {
  try {
    const result = await raceWithSignal(
      jwtVerify(token, getJwksResolver(config, fetcher), {
        issuer: config.issuer,
        audience: config.audience,
        algorithms: ["RS256", "ES256"],
      }),
      signal,
    );
    if (
      typeof result.payload.exp !== "number" ||
      typeof result.payload.sub !== "string" ||
      result.payload.sub.length === 0 ||
      result.payload.sub.length > 256
    ) {
      throw new AiRouteError(401, "invalid_auth", "Authentication failed.");
    }
    if (!hasAiScope(result.payload)) {
      throw new AiRouteError(403, "forbidden", "AI access is not allowed.");
    }
    return result.payload.sub;
  } catch (error) {
    if (error instanceof AiRouteError) throw error;
    throw new AiRouteError(401, "invalid_auth", "Authentication failed.");
  }
}

export async function authenticateHostedRequest(
  request: Request,
  config: HostedAiRouteConfig,
  signal: AbortSignal,
  fetcher: JwksFetcher = fetch,
): Promise<{ subject: string }> {
  const { bearer, cookie } = tokenSources(request, config);
  const subjects = await Promise.all(
    [bearer, cookie]
      .filter((token): token is string => Boolean(token))
      .map((token) => verifiedSubject(token, config, signal, fetcher)),
  );
  if (subjects.length === 2 && subjects[0] !== subjects[1]) {
    throw new AiRouteError(401, "invalid_auth", "Authentication failed.");
  }
  return { subject: subjects[0] };
}

export async function readBoundedJson(
  request: Request,
  maxBytes = DEFAULT_BODY_BYTES,
  signal: AbortSignal,
): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (
    contentLength &&
    /^\d+$/.test(contentLength) &&
    Number(contentLength) > maxBytes
  ) {
    throw new AiRouteError(413, "body_too_large", "Request body is too large.");
  }
  if (!request.body) {
    throw new AiRouteError(400, "invalid_request", "A JSON request body is required.");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      if (signal.aborted) throw abortError();
      const read = await raceWithSignal(reader.read(), signal);
      if (read.done) break;
      bytes += read.value.byteLength;
      if (bytes > maxBytes) {
        cancelReader(reader);
        throw new AiRouteError(413, "body_too_large", "Request body is too large.");
      }
      chunks.push(read.value);
    }
  } finally {
    reader.releaseLock();
  }
  const combined = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(combined));
  } catch {
    throw new AiRouteError(400, "invalid_json", "Request body must be valid JSON.");
  }
}

export interface AiRequestAccess<T> {
  ok: true;
  input: T;
  signal: AbortSignal;
  finish(): Promise<void>;
  wrap(response: Response): Response;
}

export interface AiRequestDenied {
  ok: false;
  response: Response;
}

export type AiRequestResult<T> = AiRequestAccess<T> | AiRequestDenied;

export interface GuardDependencies {
  config?: AiRouteConfig;
  store?: AiQuotaStore;
  fetcher?: JwksFetcher;
  authenticate?: typeof authenticateHostedRequest;
  deadlineMs?: number;
  releaseTimeoutMs?: number;
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AiRouteError) {
    return Response.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }
  return Response.json(
    { error: "ai_unavailable", message: "The AI service is unavailable." },
    { status: 503 },
  );
}

function subjectHash(subject: string, secret: string): string {
  return createHmac("sha256", secret).update(subject).digest("hex");
}

function settleWithin(operation: Promise<unknown>, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    operation.then(
      () => {
        clearTimeout(timer);
        resolve();
      },
      () => {
        clearTimeout(timer);
        resolve();
      },
    );
  });
}

async function cleanupLateGrant(
  promise: Promise<Awaited<ReturnType<AiQuotaStore["acquire"]>>>,
  store: AiQuotaStore,
  releaseTimeoutMs: number,
): Promise<void> {
  try {
    const result = await promise;
    if (result.allowed) {
      await settleWithin(store.release(result.lease), releaseTimeoutMs);
    }
  } catch {
    // The lease expires even when the store remains unavailable.
  }
}

export async function beginAiRequest<T>(
  request: Request,
  schema: ZodType<T>,
  dependencies: GuardDependencies = {},
): Promise<AiRequestResult<T>> {
  const timeoutController = new AbortController();
  const deadlineMs = dependencies.deadlineMs ?? DEFAULT_DEADLINE_MS;
  const releaseTimeoutMs =
    dependencies.releaseTimeoutMs ?? DEFAULT_RELEASE_TIMEOUT_MS;
  const timeout = setTimeout(() => timeoutController.abort(), deadlineMs);
  const signal = AbortSignal.any([request.signal, timeoutController.signal]);
  let lease: AiQuotaLease | undefined;
  let store: AiQuotaStore | undefined;
  let finished: Promise<void> | undefined;

  const finish = (): Promise<void> => {
    if (!finished) {
      clearTimeout(timeout);
      finished =
        lease && store
          ? settleWithin(
              Promise.resolve().then(() => store!.release(lease!)),
              releaseTimeoutMs,
            )
          : Promise.resolve();
    }
    return finished;
  };

  try {
    const config = dependencies.config ?? getAiRouteConfig();
    validateRequestBoundary(request, config);
    let hash: string | undefined;
    if (config.mode === "hosted") {
      const authenticate =
        dependencies.authenticate ?? authenticateHostedRequest;
      const identity = await authenticate(
        request,
        config,
        signal,
        dependencies.fetcher,
      );
      hash = subjectHash(identity.subject, config.subjectSecret);
    }

    const raw = await readBoundedJson(request, DEFAULT_BODY_BYTES, signal);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      throw new AiRouteError(400, "invalid_request", "Request fields are invalid.");
    }

    if (config.mode === "hosted") {
      store = dependencies.store ?? createNeonQuotaStore(config.databaseUrl);
      const acquirePromise = store.acquire(hash!, randomUUID());
      let decision;
      try {
        decision = await raceWithSignal(acquirePromise, signal);
      } catch (error) {
        if (signal.aborted) {
          void cleanupLateGrant(acquirePromise, store, releaseTimeoutMs);
        }
        throw error;
      }
      if (!decision.allowed) {
        clearTimeout(timeout);
        return {
          ok: false,
          response: Response.json(
            {
              error: "budget_exhausted",
              message: "AI request capacity is temporarily unavailable.",
            },
            {
              status: 429,
              headers: { "Retry-After": String(decision.retryAfterSeconds) },
            },
          ),
        };
      }
      lease = decision.lease;
      if (signal.aborted) throw abortError();
    }

    signal.addEventListener("abort", () => void finish(), { once: true });
    if (signal.aborted) throw abortError();

    return {
      ok: true,
      input: parsed.data,
      signal,
      finish,
      wrap(response) {
        if (!response.body) {
          void finish();
          return response;
        }
        const reader = response.body.getReader();
        const body = new ReadableStream<Uint8Array>({
          async pull(controller) {
            try {
              const chunk = await raceWithSignal(reader.read(), signal);
              if (chunk.done) {
                await finish();
                controller.close();
              } else {
                controller.enqueue(chunk.value);
              }
            } catch (error) {
              cancelReader(reader);
              await finish();
              controller.error(
                error instanceof AiRouteError
                  ? error
                  : new Error("AI response stream failed."),
              );
            }
          },
          async cancel(reason) {
            timeoutController.abort();
            cancelReader(reader, reason);
            await finish();
          },
        });
        return new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      },
    };
  } catch (error) {
    await finish();
    return { ok: false, response: errorResponse(error) };
  }
}
