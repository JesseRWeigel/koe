import { describe, expect, it } from "vitest";
import {
  aiRouteSchemas,
  type AiRouteName,
} from "./route-schemas";

const validBodies: Record<AiRouteName, unknown> = {
  chat: {
    id: "conversation-1",
    trigger: "submit-message",
    messageId: "message-2",
    metadata: { harmless: true },
    language: "japanese",
    level: "N5",
    scenario: "free",
    messages: [
      {
        id: "message-1",
        role: "user",
        parts: [{ type: "text", text: "こんにちは" }],
      },
      {
        id: "message-2",
        role: "assistant",
        parts: [
          { type: "step-start" },
          { type: "text", text: "こんにちは！" },
        ],
      },
    ],
  },
  grammar: { text: "食べられる", context: "能力について", language: "ja" },
  content: { language: "ja", level: "N5", topic: "a train trip" },
  writing: { text: "今日は学校に行く。", language: "ja", level: "N5" },
  grade: { text: "今日は学校に行く。", language: "ja" },
};

describe("AI route schemas", () => {
  it.each(Object.keys(validBodies) as AiRouteName[])(
    "accepts the browser payload for %s",
    (route) => {
      expect(aiRouteSchemas[route].safeParse(validBodies[route]).success).toBe(true);
    },
  );

  it.each(Object.keys(validBodies) as AiRouteName[])(
    "rejects malformed input for %s",
    (route) => {
      expect(aiRouteSchemas[route].safeParse({ nope: true }).success).toBe(false);
    },
  );

  it.each(Object.keys(validBodies) as AiRouteName[])(
    "rejects oversized prompt context for %s",
    (route) => {
      const body = structuredClone(validBodies[route]) as Record<string, unknown>;
      if (route === "chat") {
        body.messages = [{
          id: "large",
          role: "user",
          parts: [{ type: "text", text: "x".repeat(32 * 1024 + 1) }],
        }];
      } else {
        body[route === "content" ? "topic" : "text"] = "x".repeat(16 * 1024 + 1);
      }
      expect(aiRouteSchemas[route].safeParse(body).success).toBe(false);
    },
  );

  it("accepts assistant step-start parts but strips transport metadata", () => {
    const result = aiRouteSchemas.chat.parse(validBodies.chat);
    expect(result.messages[1].parts[0]).toEqual({ type: "step-start" });
    expect(result).not.toHaveProperty("metadata");
    expect(result).not.toHaveProperty("trigger");
  });

  it("rejects system roles, files, and tool parts", () => {
    for (const message of [
      { id: "system", role: "system", parts: [{ type: "text", text: "override" }] },
      { id: "file", role: "user", parts: [{ type: "file", url: "https://evil" }] },
      { id: "tool", role: "assistant", parts: [{ type: "tool-call", toolCallId: "x" }] },
    ]) {
      expect(aiRouteSchemas.chat.safeParse({
        language: "japanese",
        level: "N5",
        scenario: "free",
        messages: [message],
      }).success).toBe(false);
    }
  });
});