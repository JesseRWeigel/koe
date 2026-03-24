import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock @ai-sdk/openai before importing the module under test
const mockModel = { modelId: "mock-model", provider: "mock-provider" };
const mockCreateOpenAI = vi.fn(() => {
  return vi.fn(() => mockModel);
});

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: mockCreateOpenAI,
}));

// Mock global fetch for isOllamaAvailable
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { getModel, getProviderConfig, isOllamaAvailable } from "./provider";

describe("AI Provider Abstraction", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    mockCreateOpenAI.mockClear();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getModel", () => {
    it('returns an AI SDK model object for "chat" purpose', () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const model = getModel("chat");
      expect(model).toBeDefined();
      expect(model).toHaveProperty("modelId");
    });

    it('returns a model for "grammar" purpose', () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const model = getModel("grammar");
      expect(model).toBeDefined();
    });

    it('returns a model for "content" purpose', () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      const model = getModel("content");
      expect(model).toBeDefined();
    });

    it("uses OpenAI provider with Ollama base URL when DEFAULT_AI_PROVIDER=ollama", () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      vi.stubEnv("OLLAMA_BASE_URL", "http://myhost:11434");

      getModel("chat");

      expect(mockCreateOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "http://myhost:11434/v1",
        })
      );
    });

    it("uses default Ollama base URL when OLLAMA_BASE_URL is not set", () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");

      getModel("chat");

      expect(mockCreateOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "http://localhost:11434/v1",
        })
      );
    });

    it("uses gateway model string when DEFAULT_AI_PROVIDER=gateway", () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      const model = getModel("chat");
      expect(model).toBeDefined();
    });

    it("uses custom model names from env for ollama", () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");
      vi.stubEnv("OLLAMA_CHAT_MODEL", "custom-chat-model");

      getModel("chat");

      // The provider function returned by createOpenAI should be called with the custom model
      const providerFn = mockCreateOpenAI.mock.results[0]?.value;
      expect(providerFn).toHaveBeenCalledWith("custom-chat-model");
    });

    it("uses custom model names from env for gateway", () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");
      vi.stubEnv("GATEWAY_CHAT_MODEL", "custom/gateway-model");

      const model = getModel("chat");
      expect(model).toBeDefined();
    });
  });

  describe("getProviderConfig", () => {
    it("returns current provider settings for ollama", () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "ollama");

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

    it("returns current provider settings for gateway", () => {
      vi.stubEnv("DEFAULT_AI_PROVIDER", "gateway");

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

    it("defaults to ollama when DEFAULT_AI_PROVIDER is not set", () => {
      const config = getProviderConfig();
      expect(config.provider).toBe("ollama");
    });
  });

  describe("isOllamaAvailable", () => {
    it("returns true when Ollama health endpoint responds OK", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      const available = await isOllamaAvailable();

      expect(available).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("localhost:11434"),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it("returns false when Ollama health endpoint fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

      const available = await isOllamaAvailable();

      expect(available).toBe(false);
    });

    it("returns false when Ollama responds with non-OK status", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });

      const available = await isOllamaAvailable();

      expect(available).toBe(false);
    });
  });
});
