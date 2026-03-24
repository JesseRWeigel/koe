import { describe, it, expect, vi, afterEach } from "vitest";

// Mock global fetch for isOllamaAvailable
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("AI Provider Abstraction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    mockFetch.mockReset();
    vi.resetModules();
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
      const model = getModel("chat");
      // ai-sdk-ollama returns models with provider containing "ollama"
      expect(model.provider).toContain("ollama");
    });

    it("uses default model names for ollama", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const { getModel } = await import("./provider");
      const model = getModel("chat");
      expect(model.modelId).toBe("qwen3.5:9b");
    });

    it("uses custom model names from env for ollama", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      vi.stubEnv("OLLAMA_CHAT_MODEL", "custom-chat-model");
      const { getModel } = await import("./provider");
      const model = getModel("chat");
      expect(model.modelId).toBe("custom-chat-model");
    });

    it("uses gateway model string when DEFAULT_AI_PROVIDER=gateway", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      const { getModel } = await import("./provider");
      const model = getModel("chat");
      expect(model).toBeDefined();
    });

    it("uses custom model names from env for gateway", async () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("GATEWAY_CHAT_MODEL", "custom/gateway-model");
      const { getModel } = await import("./provider");
      const model = getModel("chat");
      expect(model.modelId).toBe("custom/gateway-model");
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
      const { getProviderConfig } = await import("./provider");
      const config = getProviderConfig();
      expect(config).toEqual({
        provider: "gateway",
        baseUrl: undefined,
        models: {
          chat: expect.any(String),
          grammar: expect.any(String),
          content: expect.any(String),
        },
      });
    });

    it("defaults to ollama when DEFAULT_AI_PROVIDER is not set", async () => {
      const { getProviderConfig } = await import("./provider");
      const config = getProviderConfig();
      expect(config.provider).toBe("ollama");
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
