import { generateText } from "ai";
import { getModel } from "@/lib/ai";

export async function POST(req: Request) {
  const { text, language } = (await req.json()) as {
    text: string;
    language: string;
  };

  if (!text || !language) {
    return Response.json(
      { error: "Missing required fields: text, language" },
      { status: 400 }
    );
  }

  const truncatedText = text.slice(0, 2000);

  const result = await generateText({
    model: getModel("grammar"),
    system:
      "You are a language difficulty analyzer. You analyze text and estimate its difficulty level for language learners. Always respond with valid JSON only, no markdown formatting or code fences.",
    prompt: `Analyze this ${language} text and return a JSON response with: level (JLPT N5-N1 for Japanese, CEFR A1-C2 for others), estimatedComprehension (percentage a beginner would understand), wordCount, uniqueWords, difficultWords (array of objects with "word" and "meaning" keys). Text: "${truncatedText}"`,
  });

  // Strip markdown code fences if the model wraps its response
  let rawText = result.text.trim();
  const fenceMatch = rawText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch) {
    rawText = fenceMatch[1].trim();
  }

  try {
    const analysis = JSON.parse(rawText);
    return Response.json(analysis);
  } catch {
    return Response.json(
      { error: "Failed to parse analysis", raw: result.text },
      { status: 500 }
    );
  }
}
