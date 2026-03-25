import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import {
  buildWritingCorrectionPrompt,
  type GrammarLanguage,
} from "@/lib/ai/system-prompts";

export async function POST(req: Request) {
  const { text, language, level } = (await req.json()) as {
    text: string;
    language: GrammarLanguage;
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
