import { afterEach, describe, expect, it, vi } from "vitest";
import { SignJWT, exportJWK, generateKeyPair } from "jose";

vi.mock("ai", () => ({
  convertToModelMessages: vi.fn(async (messages) => messages),
  streamText: vi.fn(() => ({
    toTextStreamResponse: () => new Response("ok"),
    toUIMessageStreamResponse: () => new Response("ok"),
  })),
  generateText: vi.fn(async () => ({
    text: JSON.stringify({
      level: "N5",
      estimatedComprehension: 80,
      wordCount: 3,
      uniqueWords: 3,
      difficultWords: [],
    }),
  })),
}));

vi.mock("@/lib/ai", () => ({
  getModel: vi.fn(() => ({ modelId: "mock-model" })),
}));

import { generateText, streamText } from "ai";
import { getModel } from "@/lib/ai";
import { createPost as createChatPost } from "./chat/route";
import { createPost as createGrammarPost } from "./grammar/route";
import { createPost as createContentPost } from "./content/route";
import { createPost as createWritingPost } from "./writing/route";
import { createPost as createGradePost } from "./grade/route";

const hostedConfig = {
  mode: "hosted" as const,
  jwksUrl: new URL("https://login.example.com/keys"),
  issuer: "https://login.example.com/",
  audience: "koe",
  publicOrigin: "https://koe.example.com",
  cookieName: "koe_session",
  subjectSecret: "s".repeat(32),
  databaseUrl: "postgresql://example.invalid/koe",
};

const validBodies = {
  chat: {
    id: "conversation-1",
    trigger: "submit-message",
    messageId: "user-2",
    metadata: { clientOnly: true },
    language: "japanese",
    level: "N5",
    scenario: "free",
    messages: [
      {
        id: "user-1",
        role: "user",
        parts: [{ type: "text", text: "hello" }],
      },
      {
        id: "assistant-1",
        role: "assistant",
        parts: [
          { type: "step-start" },
          { type: "text", text: "こんにちは" },
        ],
      },
      {
        id: "user-2",
        role: "user",
        parts: [{ type: "text", text: "元気ですか" }],
      },
    ],
  },
  grammar: { text: "hola", language: "es" },
  content: { topic: "travel", language: "es", level: "A1" },
  writing: { text: "hola", language: "es", level: "A1" },
  grade: { text: "hola", language: "es" },
};

const routes = [
  { name: "chat", create: createChatPost, body: validBodies.chat, tokens: 1024, call: streamText },
  { name: "grammar", create: createGrammarPost, body: validBodies.grammar, tokens: 768, call: streamText },
  { name: "content", create: createContentPost, body: validBodies.content, tokens: 1024, call: streamText },
  { name: "writing", create: createWritingPost, body: validBodies.writing, tokens: 768, call: streamText },
  { name: "grade", create: createGradePost, body: validBodies.grade, tokens: 512, call: generateText },
] as const;

function request(name: string, body: unknown, headers?: HeadersInit): Request {
  return new Request("http://localhost/api/" + name, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe.each(routes)("$name route protection", ({ name, create, body, tokens, call }) => {
  it("rejects unauthenticated hosted requests before provider lookup", async () => {
    const acquire = vi.fn();
    const response = await create({
      config: hostedConfig,
      store: { acquire, release: vi.fn() },
    })(request(name, body));
    expect(response.status).toBe(401);
    expect(acquire).not.toHaveBeenCalled();
    expect(getModel).not.toHaveBeenCalled();
    expect(call).not.toHaveBeenCalled();
  });

  it("rejects malformed schemas before provider lookup", async () => {
    const response = await create({ config: { mode: "local" } })(
      request(name, { wrong: true }),
    );
    expect(response.status).toBe(400);
    expect(getModel).not.toHaveBeenCalled();
    expect(call).not.toHaveBeenCalled();
  });

  it("rejects actual streamed bytes over the cap without trusting Content-Length", async () => {
    const encoder = new TextEncoder();
    const response = await create({ config: { mode: "local" } })(
      new Request("http://localhost/api/" + name, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": "2",
        },
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode('{"text":"'));
            controller.enqueue(encoder.encode("x".repeat(65 * 1024)));
            controller.enqueue(encoder.encode('"}'));
            controller.close();
          },
        }),
        duplex: "half",
      } as RequestInit & { duplex: "half" }),
    );
    expect(response.status).toBe(413);
    expect(getModel).not.toHaveBeenCalled();
    expect(call).not.toHaveBeenCalled();
  });

  it("shares exhausted hosted budgets before provider lookup", async () => {
    const response = await create({
      config: hostedConfig,
      authenticate: vi.fn(async () => ({ subject: "user-1" })),
      store: {
        acquire: vi.fn(async () => ({ allowed: false as const, retryAfterSeconds: 12 })),
        release: vi.fn(),
      },
    })(request(name, body));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("12");
    expect(getModel).not.toHaveBeenCalled();
    expect(call).not.toHaveBeenCalled();
  });

  it("fails closed when hosted quota storage is unavailable", async () => {
    const response = await create({
      config: hostedConfig,
      authenticate: vi.fn(async () => ({ subject: "user-1" })),
      store: {
        acquire: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
        release: vi.fn(),
      },
    })(request(name, body));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "ai_unavailable",
      message: "The AI service is unavailable.",
    });
    expect(getModel).not.toHaveBeenCalled();
    expect(call).not.toHaveBeenCalled();
  });

  it("sets a provider output cap and cancellation signal", async () => {
    const response = await create({ config: { mode: "local" } })(
      request(name, body),
    );
    await response.text();
    expect(response.status).toBe(200);
    expect(call).toHaveBeenCalledWith(expect.objectContaining({
      maxOutputTokens: tokens,
      abortSignal: expect.any(AbortSignal),
    }));
  });
});
it("accepts the current browser chat payload with a valid hosted cookie", async () => {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  const config = {
    ...hostedConfig,
    jwksUrl: new URL("https://browser.example/keys"),
    issuer: "https://browser.example",
  };
  const token = await new SignJWT({ scope: "ai:invoke" })
    .setProtectedHeader({ alg: "RS256", kid: "browser" })
    .setSubject("browser-user")
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  const fetcher = vi.fn(async () => Response.json({
    keys: [{ ...jwk, kid: "browser", alg: "RS256", use: "sig" }],
  }));
  const response = await createChatPost({
    config,
    fetcher,
    store: {
      acquire: vi.fn(async (_subjectHash, leaseId) => ({
        allowed: true as const,
        lease: { subjectHash: "hashed", leaseId },
      })),
      release: vi.fn(async () => undefined),
    },
  })(request("chat", validBodies.chat, {
    cookie: "koe_session=" + token,
    origin: "https://koe.example.com",
  }));
  expect(response.status).toBe(200);
  await response.text();
  expect(streamText).toHaveBeenCalledTimes(1);
});
