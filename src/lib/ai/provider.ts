import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type ModelPurpose = "chat" | "grammar" | "content";
export type ProviderType = "ollama" | "gateway";

interface ProviderConfig {
  provider: ProviderType;
  baseUrl: string | undefined;
  models: Record<ModelPurpose, string>;
}

const OLLAMA_DEFAULT_MODELS: Record<ModelPurpose, string> = {
  chat: "qwen3.5:27b",
  grammar: "qwen3.5:9b",
  content: "qwen3.5:27b",
};

const GATEWAY_DEFAULT_MODELS: Record<ModelPurpose, string> = {
  chat: "anthropic/claude-sonnet-4.6",
  grammar: "anthropic/claude-haiku-4.5",
  content: "anthropic/claude-sonnet-4.6",
};

function getProvider(): ProviderType {
  const env = process.env.DEFAULT_AI_PROVIDER;
  if (env === "gateway") return "gateway";
  return "ollama";
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
  return process.env[envKey] || GATEWAY_DEFAULT_MODELS[purpose];
}

/**
 * Returns an AI SDK LanguageModel for the given purpose.
 * Uses Ollama (local) or Vercel AI Gateway (cloud) based on DEFAULT_AI_PROVIDER env.
 */
export function getModel(purpose: ModelPurpose): LanguageModel {
  const provider = getProvider();
  const modelName = getModelName(purpose);

  if (provider === "ollama") {
    const baseUrl = getOllamaBaseUrl();
    const openai = createOpenAI({
      baseURL: `${baseUrl}/v1`,
      apiKey: "ollama", // Ollama doesn't need a real API key
    });
    return openai(modelName);
  }

  // Gateway: use createOpenAI with the gateway model string
  const openai = createOpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY || "",
  });
  return openai(modelName);
}

/**
 * Returns the current provider configuration.
 */
export function getProviderConfig(): ProviderConfig {
  const provider = getProvider();

  return {
    provider,
    baseUrl: provider === "ollama" ? getOllamaBaseUrl() : undefined,
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
