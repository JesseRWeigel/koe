import { generateText } from "ai";
import { getModel } from "@/lib/ai";
import {
  buildReaderSystemPrompt,
  type LanguageLevel,
} from "@/lib/ai/system-prompts";

export async function POST(req: Request) {
  try {
    const { language, level, topic } = (await req.json()) as {
      language: string;
      level: LanguageLevel;
      topic: string;
    };

    if (!language || !level || !topic) {
      return Response.json(
        { error: "Missing required fields: language, level, topic" },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: getModel("content"),
      system: buildReaderSystemPrompt(language, level),
      prompt: `Generate a short reading passage (200-400 words) about: ${topic}`,
    });

    return Response.json({ content: result.text });
  } catch (error) {
    console.error("Content generation error:", error);
    return Response.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
