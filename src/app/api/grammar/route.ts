import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import { buildGrammarSystemPrompt } from "@/lib/ai/system-prompts";
import {
  beginAiRequest,
  errorResponse,
  type GuardDependencies,
} from "@/lib/ai/route-protection";
import { grammarRequestSchema } from "@/lib/ai/route-schemas";

export function createPost(dependencies: GuardDependencies = {}) {
  return async function POST(req: Request) {
    const access = await beginAiRequest(req, grammarRequestSchema, dependencies);
    if (!access.ok) return access.response;

    try {
      const { text, context, language } = access.input;
      const result = streamText({
        model: getModel("grammar"),
        system: buildGrammarSystemPrompt(language),
        prompt: `Explain this grammar: "${text}"${context ? `\nContext: ${context}` : ""}`,
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
