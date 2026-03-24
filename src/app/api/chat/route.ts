import { streamText, convertToModelMessages } from "ai";
import { getModel } from "@/lib/ai";
import { buildSystemPrompt } from "@/lib/ai/system-prompts";
import type { Language, Level } from "@/lib/ai/system-prompts";

export async function POST(req: Request) {
  const { messages, language, level, scenario } = await req.json();

  const systemPrompt = buildSystemPrompt(
    (language || "japanese") as Language,
    (level || "N5") as Level,
    scenario || "free"
  );

  const result = streamText({
    model: getModel("chat"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
