import { afterEach, describe, expect, it, vi } from "vitest";
import { SignJWT, exportJWK, generateKeyPair } from "jose";
import { z } from "zod";
import {
  authenticateHostedRequest,
  beginAiRequest,
  getAiRouteConfig,
  readBoundedJson,
  type HostedAiRouteConfig,
} from "./route-protection";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
});

function hostedEnv() {
  process.env.AI_ROUTE_MODE = "hosted";
  process.env.AI_AUTH_JWKS_URL = "https://login.example.com/.well-known/jwks.json";
  process.env.AI_AUTH_ISSUER = "https://login.example.com/";
  process.env.AI_AUTH_AUDIENCE = "koe";
  process.env.AI_PUBLIC_ORIGIN = "https://koe.example.com";
  process.env.AI_LIMIT_SUBJECT_SECRET = "s".repeat(32);
  process.env.DATABASE_URL = "postgresql://example.invalid/koe";
}

describe("AI route configuration", () => {
  it("fails closed when production mode is not explicit", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.AI_ROUTE_MODE;
    expect(() => getAiRouteConfig()).toThrow(/AI_ROUTE_MODE/);
  });

  it("requires an explicit production opt-in for local mode", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.AI_ROUTE_MODE = "local";
    expect(() => getAiRouteConfig()).toThrow(/AI_ALLOW_LOCAL_PRODUCTION/);
  });

  it("requires every hosted auth and persistent-store setting", () => {
    hostedEnv();
    delete process.env.DATABASE_URL;
    expect(() => getAiRouteConfig()).toThrow(/DATABASE_URL/);
  });

  it("rejects unsafe hosted endpoint configuration", () => {
    hostedEnv();
    process.env.AI_AUTH_JWKS_URL = "https://user:pass@login.example.com/keys?leak=yes";
    expect(() => getAiRouteConfig()).toThrow(/AI_AUTH_JWKS_URL/);
  });
});

describe("bounded request bodies", () => {
  it("counts streamed bytes when Content-Length is absent", async () => {
    const encoder = new TextEncoder();
    const request = new Request("http://localhost/api/grammar", {
      method: "POST",
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('{"text":"'));
          controller.enqueue(encoder.encode("x".repeat(80)));
          controller.enqueue(encoder.encode('","language":"ja"}'));
          controller.close();
        },
      }),
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    await expect(readBoundedJson(request, 64, new AbortController().signal))
      .rejects.toMatchObject({ status: 413 });
  });

  it("does not trust a smaller Content-Length", async () => {
    const request = new Request("http://localhost/api/grade", {
      method: "POST",
      headers: { "Content-Length": "2" },
      body: JSON.stringify({ text: "x".repeat(100), language: "ja" }),
    });
    await expect(readBoundedJson(request, 64, new AbortController().signal))
      .rejects.toMatchObject({ status: 413 });
  });
});

describe("hosted authentication", () => {
  async function fixture() {
    const { publicKey, privateKey } = await generateKeyPair("RS256");
    const jwk = await exportJWK(publicKey);
    const token = await new SignJWT({ scope: "ai:invoke" })
      .setProtectedHeader({ alg: "RS256", kid: "test" })
      .setSubject("user-123")
      .setIssuer("https://login.example.com/")
      .setAudience("koe")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(privateKey);
    const config: HostedAiRouteConfig = {
      mode: "hosted",
      jwksUrl: new URL("https://login.example.com/.well-known/jwks.json"),
      issuer: "https://login.example.com/",
      audience: "koe",
      publicOrigin: "https://koe.example.com",
      cookieName: "koe_session",
      subjectSecret: "s".repeat(32),
      databaseUrl: "postgresql://example.invalid/koe",
    };
    const fetcher = vi.fn(async () => Response.json({
      keys: [{ ...jwk, kid: "test", alg: "RS256", use: "sig" }],
    }));
    return { token, config, fetcher };
  }

  it("accepts a scoped bearer JWT and ignores identity headers", async () => {
    const { token, config, fetcher } = await fixture();
    const request = new Request("https://koe.example.com/api/chat", {
      method: "POST",
      headers: { authorization: "Bearer " + token, "x-user-id": "attacker" },
    });
    await expect(
      authenticateHostedRequest(request, config, AbortSignal.timeout(1000), fetcher),
    ).resolves.toMatchObject({ subject: "user-123" });
  });

  it("requires exact Origin for cookie authentication", async () => {
    const { token, config, fetcher } = await fixture();
    const request = new Request("https://koe.example.com/api/chat", {
      method: "POST",
      headers: { cookie: "koe_session=" + token, origin: "https://evil.example" },
    });
    await expect(
      authenticateHostedRequest(request, config, AbortSignal.timeout(1000), fetcher),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("rejects oversized bearer tokens before fetching JWKS", async () => {
    const { config, fetcher } = await fixture();
    const request = new Request("https://koe.example.com/api/chat", {
      method: "POST",
      headers: { authorization: "Bearer " + "x".repeat(9000) },
    });
    await expect(
      authenticateHostedRequest(request, config, AbortSignal.timeout(1000), fetcher),
    ).rejects.toMatchObject({ status: 401 });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
describe("lease lifecycle", () => {
  it("releases capacity when the client cancels a response stream", async () => {
    const release = vi.fn(async () => undefined);
    const access = await beginAiRequest(
      new Request("https://koe.example.com/api/grade", {
        method: "POST",
        body: JSON.stringify({ ok: true }),
      }),
      z.object({ ok: z.boolean() }),
      {
        config: {
          mode: "hosted",
          jwksUrl: new URL("https://login.example.com/keys"),
          issuer: "https://login.example.com/",
          audience: "koe",
          publicOrigin: "https://koe.example.com",
          cookieName: "koe_session",
          subjectSecret: "s".repeat(32),
          databaseUrl: "postgresql://example.invalid/koe",
        },
        authenticate: vi.fn(async () => ({ subject: "user-1" })),
        store: {
          acquire: vi.fn(async (_subjectHash, leaseId) => ({
            allowed: true as const,
            lease: { subjectHash: "hashed", leaseId },
          })),
          release,
        },
      },
    );
    expect(access.ok).toBe(true);
    if (!access.ok) return;

    const response = access.wrap(new Response(new ReadableStream({
      pull() {
        // Keep the provider stream open until the client cancels it.
      },
    })));
    await response.body!.cancel("client left");
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("forces a hung response stream to fail at the deadline", async () => {
    const access = await beginAiRequest(
      new Request("http://localhost/api/content", {
        method: "POST",
        body: JSON.stringify({ ok: true }),
      }),
      z.object({ ok: z.boolean() }),
      { config: { mode: "local" }, deadlineMs: 10 },
    );
    expect(access.ok).toBe(true);
    if (!access.ok) return;

    const response = access.wrap(new Response(new ReadableStream({
      pull() {
        // Simulate a provider that ignores AbortSignal and never produces bytes.
      },
    })));
    const outcome = await Promise.race([
      response.text().then(
        () => "completed",
        () => "stream-failed",
      ),
      new Promise<string>((resolve) => setTimeout(() => resolve("hung"), 100)),
    ]);
    expect(outcome).toBe("stream-failed");
  });
  it("cleans up a lease granted after the request deadline", async () => {
    let grant!: (value: {
      allowed: true;
      lease: { subjectHash: string; leaseId: string };
    }) => void;
    const acquire = new Promise<{
      allowed: true;
      lease: { subjectHash: string; leaseId: string };
    }>((resolve) => {
      grant = resolve;
    });
    const release = vi.fn(async () => undefined);
    const resultPromise = beginAiRequest(
      new Request("https://koe.example.com/api/grade", {
        method: "POST",
        body: JSON.stringify({ ok: true }),
      }),
      z.object({ ok: z.boolean() }),
      {
        config: {
          mode: "hosted",
          jwksUrl: new URL("https://login.example.com/keys"),
          issuer: "https://login.example.com/",
          audience: "koe",
          publicOrigin: "https://koe.example.com",
          cookieName: "koe_session",
          subjectSecret: "s".repeat(32),
          databaseUrl: "postgresql://example.invalid/koe",
        },
        authenticate: vi.fn(async () => ({ subject: "user-1" })),
        store: { acquire: vi.fn(() => acquire), release },
        deadlineMs: 10,
      },
    );

    const result = await resultPromise;
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(504);

    grant({
      allowed: true,
      lease: { subjectHash: "hashed", leaseId: "late-lease" },
    });
    await vi.waitFor(() => expect(release).toHaveBeenCalledWith({
      subjectHash: "hashed",
      leaseId: "late-lease",
    }));
  });
});