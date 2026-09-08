import { beforeEach, describe, expect, test } from "vitest";
import {
  getConversation,
  getConversations,
  saveConversation,
  type Conversation,
} from "./history";
import {
  getDashboardStats,
  recordConversation,
  resetStats,
} from "@/lib/dashboard/stats";

const conversation: Conversation = {
  id: "synthetic-conversation",
  language: "japanese",
  level: "N5",
  startedAt: new Date("2026-09-08T12:00:00.000Z"),
  messages: [
    { role: "user", text: "こんにちは" },
    { role: "assistant", text: "こんにちは！" },
  ],
};

describe("conversation history and dashboard storage", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStats();
  });

  test("recording a conversation preserves its saved messages across reload order", () => {
    saveConversation(conversation);
    recordConversation();

    expect(getConversation(conversation.id)?.messages).toEqual(
      conversation.messages
    );

    resetStats();
    expect(getDashboardStats().conversations).toBe(1);
    expect(getConversations()).toHaveLength(1);

    expect(localStorage.getItem("koe-conversations-v2")).not.toBeNull();
    expect(localStorage.getItem("koe-conversation-count-v2")).toBe("1");
  });
});
