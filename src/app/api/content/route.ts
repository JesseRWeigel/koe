import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import { buildReaderSystemPrompt, type LanguageLevel } from "@/lib/ai/system-prompts";
import type { LanguageCode } from "@/lib/languages";

export async function POST(req: Request) {
  try {
    const { language, level, topic } = (await req.json()) as {
      language: LanguageCode;
      level: LanguageLevel;
      topic: string;
    };

    if (!language || !level || !topic) {
      return Response.json(
        { error: "Missing required fields: language, level, topic" },
        { status: 400 }
      );
    }

    const result = streamText({
      model: getModel("content"),
      system: buildReaderSystemPrompt(language, level),
      prompt: `Generate a short reading passage (100-150 words) about: ${topic}. Keep it concise.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Content generation error:", error);
    return Response.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
