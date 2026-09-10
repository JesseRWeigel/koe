import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import {
  AiRouteError,
  beginAiRequest,
  errorResponse,
  type GuardDependencies,
} from "@/lib/ai/route-protection";
import { gradeRequestSchema } from "@/lib/ai/route-schemas";

export function createPost(dependencies: GuardDependencies = {}) {
  return async function POST(req: Request) {
    const access = await beginAiRequest(req, gradeRequestSchema, dependencies);
    if (!access.ok) return access.response;

    try {
      const { text, language } = access.input;
      const boundedText = text.slice(0, 2000);
      const result = await generateText({
        model: getModel("grammar"),
        system:
          "You are a language difficulty analyzer. You analyze text and estimate its difficulty level for language learners. Always respond with valid JSON only, no markdown formatting or code fences.",
        prompt: `Analyze this ${language} text and return a JSON response with: level (JLPT N5-N1 for Japanese, CEFR A1-C2 for others), estimatedComprehension (percentage a beginner would understand), wordCount, uniqueWords, difficultWords (array of objects with "word" and "meaning" keys). Text: "${boundedText}"`,
        maxOutputTokens: 512,
        maxRetries: 0,
        abortSignal: access.signal,
      });

      let rawText = result.text.trim();
      const fenceMatch = rawText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
      if (fenceMatch) rawText = fenceMatch[1].trim();

      try {
        return Response.json(JSON.parse(rawText));
      } catch {
        return Response.json(
          { error: "invalid_ai_response", message: "The AI response was invalid." },
          { status: 502 },
        );
      }
    } catch (error) {
      return errorResponse(
        access.signal.aborted
          ? new AiRouteError(504, "request_timeout", "The AI request timed out.")
          : error,
      );
    } finally {
      await access.finish();
    }
  };
}

export const POST = createPost();
