import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import { buildWritingCorrectionPrompt } from "@/lib/ai/system-prompts";
import {
  beginAiRequest,
  errorResponse,
  type GuardDependencies,
} from "@/lib/ai/route-protection";
import { writingRequestSchema } from "@/lib/ai/route-schemas";

export function createPost(dependencies: GuardDependencies = {}) {
  return async function POST(req: Request) {
    const access = await beginAiRequest(req, writingRequestSchema, dependencies);
    if (!access.ok) return access.response;

    try {
      const { text, language, level } = access.input;
      const result = streamText({
        model: getModel("grammar"),
        system: buildWritingCorrectionPrompt(language),
        prompt: `Correct and provide feedback on this ${language} text written by a ${level} level student:\n\n"${text}"`,
        maxOutputTokens: 768,
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
