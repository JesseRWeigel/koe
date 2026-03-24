import { streamText } from "ai";
import { getModel } from "@/lib/ai";
import {
  buildGrammarSystemPrompt,
  type GrammarLanguage,
} from "@/lib/ai/system-prompts";

export async function POST(req: Request) {
  const { text, context, language } = (await req.json()) as {
    text: string;
    context?: string;
    language: GrammarLanguage;
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
