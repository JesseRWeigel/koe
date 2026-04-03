import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import { buildGrammarSystemPrompt } from "@/lib/ai/system-prompts";
import type { LanguageCode } from "@/lib/languages";

export async function POST(req: Request) {
  const { text, context, language } = (await req.json()) as {
    text: string;
    context?: string;
    language: LanguageCode;
  };

  if (!text || !language) {
    return Response.json(
      { error: "Missing required fields: text, language" },
      { status: 400 }
    );
  }

  const result = streamText({
    model: getModel("grammar"),
    system: buildGrammarSystemPrompt(language),
    prompt: `Explain this grammar: "${text}"${context ? `\nContext: ${context}` : ""}`,
  });

  return result.toTextStreamResponse();
}
