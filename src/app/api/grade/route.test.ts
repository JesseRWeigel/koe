import { describe, it, expect, vi, afterEach } from "vitest";

// Mock the ai module
vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

// Mock the AI provider
vi.mock("@/lib/ai", () => ({
  getModel: vi.fn(() => ({ modelId: "test-model", provider: "ollama" })),
}));

import { POST, createPost } from "./route";
import { generateText } from "ai";

const mockGenerateText = vi.mocked(generateText);

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/grade", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when text is missing", async () => {
    const res = await POST(makeRequest({ language: "ja" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_request");
  });

  it("returns 400 when language is missing", async () => {
    const res = await POST(makeRequest({ text: "hello" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_request");
  });

  it("returns parsed analysis when AI returns valid JSON", async () => {
    const analysis = {
      level: "N4",
      estimatedComprehension: 65,
      wordCount: 42,
      uniqueWords: 30,
      difficultWords: [
        { word: "勉強", meaning: "study" },
      ],
    };
    mockGenerateText.mockResolvedValueOnce({
      text: JSON.stringify(analysis),
    } as never);

    const res = await POST(makeRequest({ text: "日本語のテスト文", language: "ja" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(analysis);
  });

  it("returns 500 when AI returns invalid JSON", async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: "This is not valid JSON at all",
    } as never);

    const res = await POST(makeRequest({ text: "test text", language: "es" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("invalid_ai_response");
    expect(body).not.toHaveProperty("raw");
  });

  it("truncates input text to 2000 characters", async () => {
    const longText = "あ".repeat(3000);
    const analysis = {
      level: "N3",
      estimatedComprehension: 50,
      wordCount: 100,
      uniqueWords: 80,
      difficultWords: [],
    };
    mockGenerateText.mockResolvedValueOnce({
      text: JSON.stringify(analysis),
    } as never);

    await POST(makeRequest({ text: longText, language: "ja" }));

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.not.stringContaining("あ".repeat(2001)),
      })
    );
  });

  it("calls generateText with getModel('grammar')", async () => {
    const { getModel } = await import("@/lib/ai");
    mockGenerateText.mockResolvedValueOnce({
      text: JSON.stringify({ level: "A1", estimatedComprehension: 90, wordCount: 5, uniqueWords: 5, difficultWords: [] }),
    } as never);

    await POST(makeRequest({ text: "hola mundo", language: "es" }));

    expect(getModel).toHaveBeenCalledWith("grammar");
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.anything(),
        system: expect.stringContaining("difficulty"),
        prompt: expect.stringContaining("hola mundo"),
      })
    );
  });

  it("handles AI responses wrapped in markdown code fences", async () => {
    const analysis = {
      level: "N5",
      estimatedComprehension: 85,
      wordCount: 10,
      uniqueWords: 8,
      difficultWords: [],
    };
    mockGenerateText.mockResolvedValueOnce({
      text: "```json\n" + JSON.stringify(analysis) + "\n```",
    } as never);

    const res = await POST(makeRequest({ text: "テスト", language: "ja" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(analysis);
  });

  it("returns 504 and releases the lease when the provider ignores cancellation", async () => {
    let settleProvider!: (value: { text: string }) => void;
    const providerResult = new Promise<{ text: string }>((resolve) => {
      settleProvider = resolve;
    });
    mockGenerateText.mockReturnValueOnce(providerResult as never);
    const release = vi.fn(async () => undefined);
    const post = createPost({
      config: {
        mode: "hosted",
        jwksUrl: new URL("https://login.example.com/keys"),
        issuer: "https://login.example.com",
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
      deadlineMs: 10,
    });

    const responsePromise = post(makeRequest({ text: "hola", language: "es" }));
    const responseBeforeProviderSettles = await Promise.race([
      responsePromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 100)),
    ]);
    settleProvider({
      text: JSON.stringify({
        level: "A1",
        estimatedComprehension: 90,
        wordCount: 1,
        uniqueWords: 1,
        difficultWords: [],
      }),
    });
    await providerResult;

    expect(responseBeforeProviderSettles).toBeInstanceOf(Response);
    if (!(responseBeforeProviderSettles instanceof Response)) return;
    expect(responseBeforeProviderSettles.status).toBe(504);
    expect(await responseBeforeProviderSettles.json()).toEqual({
      error: "request_timeout",
      message: "The AI request timed out.",
    });
    expect(release).toHaveBeenCalledTimes(1);
  });
});
