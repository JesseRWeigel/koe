import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import { buildReaderSystemPrompt } from "@/lib/ai/system-prompts";
import {
  beginAiRequest,
  errorResponse,
  type GuardDependencies,
} from "@/lib/ai/route-protection";
import { contentRequestSchema } from "@/lib/ai/route-schemas";

export function createPost(dependencies: GuardDependencies = {}) {
  return async function POST(req: Request) {
    const access = await beginAiRequest(req, contentRequestSchema, dependencies);
    if (!access.ok) return access.response;

    try {
      const { language, level, topic } = access.input;
      const result = streamText({
        model: getModel("content"),
        system: buildReaderSystemPrompt(language, level),
        prompt: `Generate a short reading passage (100-150 words) about: ${topic}. Keep it concise.`,
        maxOutputTokens: 1024,
        maxRetries: 0,
        abortSignal: access.signal,
      });
      return access.wrap(result.toTextStreamResponse());
    } catch (error) {
      await access.finish();
      return errorResponse(error);
    }
  };
}

export const POST = createPost();
