import { createGateway, type LanguageModel } from "ai";
import { createOllama } from "ai-sdk-ollama";

export type ModelPurpose = "chat" | "grammar" | "content";
export type ProviderType = "ollama" | "gateway";

interface ProviderConfig {
  provider: ProviderType;
  baseUrl: string;
  authentication?: "api-key" | "sdk-managed";
  models: Record<ModelPurpose, string>;
}

interface GatewayConfig {
  baseUrl: string;
  apiKey?: string;
  authentication: "api-key" | "sdk-managed";
}

const DEFAULT_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v3/ai";

const OLLAMA_DEFAULT_MODELS: Record<ModelPurpose, string> = {
  chat: "qwen3.5:9b",
  grammar: "qwen3.5:9b",
  content: "qwen3.5:9b",
};

const GATEWAY_DEFAULT_MODELS: Record<ModelPurpose, string> = {
  chat: "anthropic/claude-sonnet-4.6",
  grammar: "anthropic/claude-haiku-4.5",
  content: "anthropic/claude-sonnet-4.6",
};

function getProvider(): ProviderType {
  const env = process.env.DEFAULT_AI_PROVIDER;
  if (!env || env === "ollama") return "ollama";
  if (env === "gateway") return "gateway";
  throw new Error(
    'DEFAULT_AI_PROVIDER must be either "ollama" or "gateway".'
  );
}

function getOllamaBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL || "http://localhost:11434";
}

function getModelName(purpose: ModelPurpose): string {
  const provider = getProvider();

  if (provider === "ollama") {
    const envKey = `OLLAMA_${purpose.toUpperCase()}_MODEL`;
    return process.env[envKey] || OLLAMA_DEFAULT_MODELS[purpose];
  }

  const envKey = `GATEWAY_${purpose.toUpperCase()}_MODEL`;
  const modelName = process.env[envKey] || GATEWAY_DEFAULT_MODELS[purpose];
  if (!/^[^\s/]+\/[^\s]+$/.test(modelName)) {
    throw new Error(
      `${envKey} must be a non-empty gateway model ID in provider/model format.`
    );
  }
  return modelName;
}

function getGatewayApiKey(): string | undefined {
  const value = process.env.AI_GATEWAY_API_KEY;
  if (value === undefined || value === "") return undefined;
  if (value.trim() !== value || value.trim() === "") {
    throw new Error(
      "AI_GATEWAY_API_KEY must be a non-empty value without surrounding whitespace."
    );
  }
  return value;
}

function getGatewayBaseUrl(): string {
  const configured = process.env.AI_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL;
  if (configured.trim() !== configured) {
    throw new Error(
      "AI_GATEWAY_BASE_URL must not contain surrounding whitespace."
    );
  }
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("AI_GATEWAY_BASE_URL must be a valid HTTPS URL.");
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "AI_GATEWAY_BASE_URL must use HTTPS and must not include credentials, a query, or a fragment."
    );
  }

  return url.toString().replace(/\/$/, "");
}

function getGatewayConfig(): GatewayConfig {
  const apiKey = getGatewayApiKey();

  return {
    baseUrl: getGatewayBaseUrl(),
    ...(apiKey ? { apiKey } : {}),
    // The installed Gateway SDK discovers request-context OIDC, refreshes
    // linked development tokens, and reports missing auth before network I/O.
    authentication: apiKey ? "api-key" : "sdk-managed",
  };
}

// Refuse redirects so an Authorization header can never be forwarded to a
// different origin. Operators must configure the final gateway endpoint.
const gatewayFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, redirect: "manual" });

/**
 * Returns an AI SDK LanguageModel for the given purpose.
 * Uses Ollama (local) or Vercel AI Gateway (cloud) based on DEFAULT_AI_PROVIDER env.
 */
export function getModel(purpose: ModelPurpose): LanguageModel {
  const provider = getProvider();
  const modelName = getModelName(purpose);

  if (provider === "ollama") {
    const baseUrl = getOllamaBaseUrl();
    const ollama = createOllama({ baseURL: baseUrl });
    // Disable thinking on qwen3/qwen3.5 models for instant responses.
    // Use 4096 context to fit fully in GPU VRAM (32K default causes CPU offloading).
    // See: https://docs.ollama.com/capabilities/thinking
    return ollama(modelName, {
      think: false,
      options: { num_ctx: 4096, num_gpu: 99 },
    });
  }

  const config = getGatewayConfig();
  const gateway = createGateway({
    baseURL: config.baseUrl,
    ...(config.apiKey ? { apiKey: config.apiKey } : {}),
    fetch: gatewayFetch,
  });
  return gateway(modelName);
}

/**
 * Returns the current provider configuration.
 */
export function getProviderConfig(): ProviderConfig {
  const provider = getProvider();

  if (provider === "gateway") {
    const gateway = getGatewayConfig();
    return {
      provider,
      baseUrl: gateway.baseUrl,
      authentication: gateway.authentication,
      models: {
        chat: getModelName("chat"),
        grammar: getModelName("grammar"),
        content: getModelName("content"),
      },
    };
  }

  return {
    provider,
    baseUrl: getOllamaBaseUrl(),
    models: {
      chat: getModelName("chat"),
      grammar: getModelName("grammar"),
      content: getModelName("content"),
    },
  };
}

/**
 * Checks if Ollama is available by pinging its health endpoint.
 */
export async function isOllamaAvailable(): Promise<boolean> {
  const baseUrl = getOllamaBaseUrl();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(baseUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}
