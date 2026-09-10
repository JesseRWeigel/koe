import {
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { getModel } from "@/lib/ai";
import { buildSystemPrompt } from "@/lib/ai/system-prompts";
import type { Language, Level } from "@/lib/ai/system-prompts";
import {
  beginAiRequest,
  errorResponse,
  type GuardDependencies,
} from "@/lib/ai/route-protection";
import { chatRequestSchema } from "@/lib/ai/route-schemas";

export function createPost(dependencies: GuardDependencies = {}) {
  return async function POST(req: Request) {
    const access = await beginAiRequest(req, chatRequestSchema, dependencies);
    if (!access.ok) return access.response;

    try {
      const { messages, language, level, scenario } = access.input;
      const result = streamText({
        model: getModel("chat"),
        system: buildSystemPrompt(language as Language, level as Level, scenario),
        messages: await convertToModelMessages(messages as UIMessage[]),
        maxOutputTokens: 1024,
        maxRetries: 0,
        abortSignal: access.signal,
      });
      return access.wrap(result.toUIMessageStreamResponse());
    } catch (error) {
      await access.finish();
      return errorResponse(error);
    }
  };
}

export const POST = createPost();
