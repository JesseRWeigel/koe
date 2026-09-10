import { z } from "zod";

const languageCode = z.enum(["ja", "es", "pt-BR", "fr"]);
const languageName = z.enum(["japanese", "spanish", "portuguese", "french"]);
const level = z.enum([
  "N5", "N4", "N3", "N2", "N1",
  "A1", "A2", "B1", "B2", "C1", "C2",
]);
const scenario = z.enum([
  "free", "restaurant", "directions", "shopping", "interview", "travel",
]);

const textPart = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(8 * 1024),
});
const stepStartPart = z.object({ type: z.literal("step-start") }).strict();
const chatMessage = z.object({
  id: z.string().min(1).max(256),
  role: z.enum(["user", "assistant"]),
  parts: z.array(z.union([textPart, stepStartPart])).min(1).max(32),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessage).min(1).max(64),
  language: languageName.default("japanese"),
  level: level.default("N5"),
  scenario: scenario.default("free"),
}).superRefine((value, context) => {
  const chars = value.messages.reduce(
    (sum, message) => sum + message.parts.reduce(
      (partSum, part) => partSum + (part.type === "text" ? part.text.length : 0),
      0,
    ),
    0,
  );
  if (chars > 32 * 1024) {
    context.addIssue({
      code: "custom",
      path: ["messages"],
      message: "Chat context is too large.",
    });
  }
});

export const grammarRequestSchema = z.object({
  text: z.string().trim().min(1).max(8 * 1024),
  context: z.string().trim().max(8 * 1024).optional(),
  language: languageCode,
});

export const contentRequestSchema = z.object({
  language: languageCode,
  level,
  topic: z.string().trim().min(1).max(1024),
});

export const writingRequestSchema = z.object({
  text: z.string().trim().min(1).max(16 * 1024),
  language: languageCode,
  level: level,
});

export const gradeRequestSchema = z.object({
  text: z.string().trim().min(1).max(16 * 1024),
  language: languageCode,
});

export const aiRouteSchemas = {
  chat: chatRequestSchema,
  grammar: grammarRequestSchema,
  content: contentRequestSchema,
  writing: writingRequestSchema,
  grade: gradeRequestSchema,
};

export type AiRouteName = keyof typeof aiRouteSchemas;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type GrammarRequest = z.infer<typeof grammarRequestSchema>;
export type ContentRequest = z.infer<typeof contentRequestSchema>;
export type WritingRequest = z.infer<typeof writingRequestSchema>;
export type GradeRequest = z.infer<typeof gradeRequestSchema>;