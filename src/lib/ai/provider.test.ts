import assert from "node:assert/strict";
import type { LanguageModel } from "ai";
import { describe, it, expect, vi, afterEach } from "vitest";

// Mock global fetch for isOllamaAvailable
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// These tests inspect the concrete adapter, not an SDK model ID shortcut.
function requireModelObject(model: LanguageModel) {
  assert(typeof model !== "string", "Expected a concrete AI SDK model");
  return model;
}

const gatewayResponse = () =>
  new Response(
    JSON.stringify({
      content: [{ type: "text", text: "ok" }],
      finishReason: "stop",
      usage: {
        inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
        outputTokens: { total: 1, text: 1, reasoning: 0 },
      },
    }),
    { status: 200, headers: { "content-type": "application/json" } }
  );

const prompt = [
  { role: "user" as const, content: [{ type: "text" as const, text: "test" }] },
];
const syntheticOidcToken =
  "eyJhbGciOiJub25lIn0.eyJleHAiOjQxMDc0NDQ4MDB9.synthetic-signature";
const expiredOidcToken =
  "eyJhbGciOiJub25lIn0.eyJleHAiOjF9.synthetic-signature";
const requestContextSymbol = Symbol.for("@vercel/request-context");
const originalRequestContext = Reflect.get(globalThis, requestContextSymbol);

describe("AI Provider Abstraction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    mockFetch.mockReset();
    vi.resetModules();
    if (originalRequestContext === undefined) {
      Reflect.deleteProperty(globalThis, requestContextSymbol);
    } else {
      Reflect.set(globalThis, requestContextSymbol, originalRequestContext);
    }
  });

  describe("getModel", () => {
    it('returns an AI SDK model object for "chat" purpose', async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const { getModel } = await import("./provider");
      const model = getModel("chat");
      expect(model).toBeDefined();
      expect(model).toHaveProperty("modelId");
    });

    it('returns a model for "grammar" purpose', async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const { getModel } = await import("./provider");
      const model = getModel("grammar");
      expect(model).toBeDefined();
    });

    it('returns a model for "content" purpose', async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const { getModel } = await import("./provider");
      const model = getModel("content");
      expect(model).toBeDefined();
    });

    it("uses ollama provider when DEFAULT_AI_PROVIDER=ollama", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const { getModel } = await import("./provider");
      const model = requireModelObject(getModel("chat"));
      // ai-sdk-ollama returns models with provider containing "ollama"
      expect(model.provider).toContain("ollama");
    });

    it("uses default model names for ollama", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const { getModel } = await import("./provider");
      const model = requireModelObject(getModel("chat"));
      expect(model.modelId).toBe("qwen3.5:9b");
    });

    it("uses custom model names from env for ollama", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      vi.stubEnv("OLLAMA_CHAT_MODEL", "custom-chat-model");
      const { getModel } = await import("./provider");
      const model = requireModelObject(getModel("chat"));
      expect(model.modelId).toBe("custom-chat-model");
    });

    it("returns a gateway model object when DEFAULT_AI_PROVIDER=gateway", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("AI_GATEWAY_API_KEY", "synthetic-gateway-key");
      const { getModel } = await import("./provider");
      const model = requireModelObject(getModel("chat"));
      expect(model.provider).toContain("gateway");
    });

    it("uses custom model names from env for gateway", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("AI_GATEWAY_API_KEY", "synthetic-gateway-key");
      vi.stubEnv("GATEWAY_CHAT_MODEL", "custom/gateway-model");
      const { getModel } = await import("./provider");
      const model = requireModelObject(getModel("chat"));
      expect(model.modelId).toBe("custom/gateway-model");
    });

    it.each([
      ["chat", "test/chat-model"],
      ["grammar", "test/grammar-model"],
      ["content", "test/content-model"],
    ] as const)(
      "routes %s requests through the configured gateway endpoint with its model ID",
      async (purpose, modelId) => {
        vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
        vi.stubEnv("AI_GATEWAY_API_KEY", "synthetic-gateway-key");
        vi.stubEnv(
          "AI_GATEWAY_BASE_URL",
          "https://gateway.example.test/v3/ai/"
        );
        vi.stubEnv(`GATEWAY_${purpose.toUpperCase()}_MODEL`, modelId);
        mockFetch.mockResolvedValueOnce(gatewayResponse());

        const { getModel } = await import("./provider");
        const model = requireModelObject(getModel(purpose));
        await model.doGenerate({ prompt });

        const [url, init] = mockFetch.mock.calls.at(-1)!;
        const headers = new Headers(init.headers);
        expect(url).toBe(
          "https://gateway.example.test/v3/ai/language-model"
        );
        expect(headers.get("ai-language-model-id")).toBe(modelId);
        expect(headers.get("authorization")).toBe(
          "Bearer synthetic-gateway-key"
        );
        expect(init.redirect).toBe("manual");
      }
    );

    it("fails clearly before a network request when gateway credentials are missing", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("AI_GATEWAY_API_KEY", "");
      vi.stubEnv("VERCEL_OIDC_TOKEN", "");
      const { getModel } = await import("./provider");
      const model = requireModelObject(getModel("chat"));

      await expect(model.doGenerate({ prompt })).rejects.toThrow(
        "No authentication provided"
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("rejects a gateway model without a provider prefix", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("AI_GATEWAY_API_KEY", "synthetic-gateway-key");
      vi.stubEnv("GATEWAY_GRAMMAR_MODEL", "claude-haiku");
      const { getModel } = await import("./provider");

      expect(() => getModel("grammar")).toThrow(
        "GATEWAY_GRAMMAR_MODEL"
      );
    });

    it("rejects an unsafe gateway endpoint without exposing credentials", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("AI_GATEWAY_API_KEY", "secret-value-must-not-appear");
      vi.stubEnv("AI_GATEWAY_BASE_URL", "http://gateway.example.test/v3/ai");
      const { getModel } = await import("./provider");

      let error: unknown;
      try {
        getModel("chat");
      } catch (caught) {
        error = caught;
      }
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain("AI_GATEWAY_BASE_URL");
      expect((error as Error).message).not.toContain(
        "secret-value-must-not-appear"
      );
    });

    it.each([
      "https://user:password@gateway.example.test/v3/ai",
      "https://gateway.example.test/v3/ai?target=elsewhere",
      "https://gateway.example.test/v3/ai#fragment",
    ])(
      "rejects gateway endpoint metadata that could hide routing: %s",
      async (baseUrl) => {
        vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
        vi.stubEnv("AI_GATEWAY_API_KEY", "synthetic-gateway-key");
        vi.stubEnv("AI_GATEWAY_BASE_URL", baseUrl);
        const { getModel } = await import("./provider");

        expect(() => getModel("chat")).toThrow("AI_GATEWAY_BASE_URL");
      }
    );

    it("lets the Gateway SDK use a request-context OIDC token", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("AI_GATEWAY_API_KEY", "");
      vi.stubEnv("VERCEL_OIDC_TOKEN", "");
      Reflect.set(globalThis, requestContextSymbol, {
        get: () => ({
          headers: { "x-vercel-oidc-token": syntheticOidcToken },
        }),
      });
      mockFetch.mockResolvedValueOnce(gatewayResponse());

      const { getModel } = await import("./provider");
      const model = requireModelObject(getModel("chat"));
      await model.doGenerate({ prompt });

      const [url, init] = mockFetch.mock.calls.at(-1)!;
      const headers = new Headers(init.headers);
      expect(url).toBe(
        "https://ai-gateway.vercel.sh/v3/ai/language-model"
      );
      expect(headers.get("authorization")).toBe(`Bearer ${syntheticOidcToken}`);
      expect(init.redirect).toBe("manual");
    });

    it("keeps gateway settings and credentials out of Ollama requests", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      vi.stubEnv("AI_GATEWAY_API_KEY", "synthetic-gateway-key");
      vi.stubEnv("AI_GATEWAY_BASE_URL", "not-a-url");
      vi.stubEnv("OLLAMA_BASE_URL", "http://ollama.example.test:11434");
      vi.stubEnv("OLLAMA_CHAT_MODEL", "local-model:latest");
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            model: "local-model:latest",
            created_at: "2026-09-08T00:00:00Z",
            message: { role: "assistant", content: "ok" },
            done: true,
            done_reason: "stop",
            prompt_eval_count: 1,
            eval_count: 1,
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      );

      const { getModel } = await import("./provider");
      const model = requireModelObject(getModel("chat"));
      await model.doGenerate({ prompt });

      const [url, init] = mockFetch.mock.calls.at(-1)!;
      const headers = new Headers(init.headers);
      expect(url).toBe("http://ollama.example.test:11434/api/chat");
      expect(headers.get("authorization")).toBeNull();
      expect(JSON.parse(init.body as string).model).toBe("local-model:latest");
    });
  });

  describe("getProviderConfig", () => {
    it("returns current provider settings for ollama", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const { getProviderConfig } = await import("./provider");
      const config = getProviderConfig();
      expect(config).toEqual({
        provider: "ollama",
        baseUrl: expect.any(String),
        models: {
          chat: expect.any(String),
          grammar: expect.any(String),
          content: expect.any(String),
        },
      });
    });

    it("returns current provider settings for gateway", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("AI_GATEWAY_API_KEY", "synthetic-gateway-key");
      vi.stubEnv(
        "AI_GATEWAY_BASE_URL",
        "https://gateway.example.test/v3/ai/"
      );
      const { getProviderConfig } = await import("./provider");
      const config = getProviderConfig();
      expect(config).toEqual({
        provider: "gateway",
        baseUrl: "https://gateway.example.test/v3/ai",
        authentication: "api-key",
        models: {
          chat: expect.any(String),
          grammar: expect.any(String),
          content: expect.any(String),
        },
      });
    });

    it("reports SDK-managed authentication without claiming OIDC is present", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("AI_GATEWAY_API_KEY", "");
      vi.stubEnv("VERCEL_OIDC_TOKEN", syntheticOidcToken);
      const { getProviderConfig } = await import("./provider");

      const config = getProviderConfig();
      expect(config.baseUrl).toBe("https://ai-gateway.vercel.sh/v3/ai");
      expect(config.authentication).toBe("sdk-managed");
      expect(JSON.stringify(config)).not.toContain(syntheticOidcToken);
    });

    it("leaves expired environment tokens to the SDK refresh path", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("AI_GATEWAY_API_KEY", "");
      vi.stubEnv("VERCEL_OIDC_TOKEN", expiredOidcToken);
      const { getModel, getProviderConfig } = await import("./provider");

      expect(() => getModel("chat")).not.toThrow();
      expect(getProviderConfig().authentication).toBe("sdk-managed");
    });

    it("defaults to ollama when DEFAULT_AI_PROVIDER is not set", async () => {
      const { getProviderConfig } = await import("./provider");
      const config = getProviderConfig();
      expect(config.provider).toBe("ollama");
    });

    it("rejects an invalid provider selection", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "openai");
      const { getProviderConfig } = await import("./provider");
      expect(() => getProviderConfig()).toThrow("DEFAULT_AI_PROVIDER");
    });
  });

  describe("isOllamaAvailable", () => {
    it("returns true when Ollama health endpoint responds OK", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const { isOllamaAvailable } = await import("./provider");
      const available = await isOllamaAvailable();
      expect(available).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("localhost:11434"),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it("returns false when Ollama health endpoint fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection refused"));
      const { isOllamaAvailable } = await import("./provider");
      const available = await isOllamaAvailable();
      expect(available).toBe(false);
    });

    it("returns false when Ollama responds with non-OK status", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const { isOllamaAvailable } = await import("./provider");
      const available = await isOllamaAvailable();
      expect(available).toBe(false);
    });
  });
});
