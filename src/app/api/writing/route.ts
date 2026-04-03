import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import { buildWritingCorrectionPrompt } from "@/lib/ai/system-prompts";
import type { LanguageCode } from "@/lib/languages";

export async function POST(req: Request) {
  const { text, language, level } = (await req.json()) as {
    text: string;
    language: LanguageCode;
    level: string;
  };

  if (!text || !language) {
    return Response.json(
      { error: "Missing required fields: text, language" },
      { status: 400 }
    );
  }

  const result = streamText({
    model: getModel("grammar"),
    system: buildWritingCorrectionPrompt(language),
    prompt: `Correct and provide feedback on this ${language} text written by a ${level} level student:\n\n"${text}"`,
  });

  return result.toTextStreamResponse();
}
