import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveConversation,
  getConversations,
  getConversation,
  deleteConversation,
  type Conversation,
} from "./history";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: crypto.randomUUID(),
    language: "japanese",
    level: "N5",
    startedAt: new Date(),
    messages: [
      { role: "user", text: "Hello" },
      { role: "assistant", text: "こんにちは！" },
    ],
    ...overrides,
  };
}

describe("Conversation History", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("saveConversation", () => {
    it("saves a conversation to storage", () => {
      const conv = makeConversation();
      saveConversation(conv);

      const stored = getConversation(conv.id);
      expect(stored).toBeDefined();
      expect(stored!.id).toBe(conv.id);
      expect(stored!.language).toBe("japanese");
      expect(stored!.messages).toHaveLength(2);
    });

    it("updates an existing conversation with the same id", () => {
      const conv = makeConversation();
      saveConversation(conv);

      const updated = {
        ...conv,
        messages: [
          ...conv.messages,
          { role: "user" as const, text: "How are you?" },
        ],
      };
      saveConversation(updated);

      const stored = getConversation(conv.id);
      expect(stored!.messages).toHaveLength(3);

      // Should not duplicate
      expect(getConversations()).toHaveLength(1);
    });

    it("does not save a conversation with no messages", () => {
      const conv = makeConversation({ messages: [] });
      saveConversation(conv);
      expect(getConversations()).toHaveLength(0);
    });
  });

  describe("getConversations", () => {
    it("returns empty array when no conversations exist", () => {
      expect(getConversations()).toEqual([]);
    });

    it("returns conversations in reverse chronological order", () => {
      const older = makeConversation({
        id: "older",
        startedAt: new Date("2026-01-01"),
      });
      const newer = makeConversation({
        id: "newer",
        startedAt: new Date("2026-03-01"),
      });

      saveConversation(older);
      saveConversation(newer);

      const list = getConversations();
      expect(list).toHaveLength(2);
      expect(list[0].id).toBe("newer");
      expect(list[1].id).toBe("older");
    });
  });

  describe("getConversation", () => {
    it("returns undefined for non-existent id", () => {
      expect(getConversation("nonexistent")).toBeUndefined();
    });

    it("returns the conversation with the given id", () => {
      const conv = makeConversation({ id: "test-id" });
      saveConversation(conv);

      const result = getConversation("test-id");
      expect(result).toBeDefined();
      expect(result!.id).toBe("test-id");
      expect(result!.messages[0].text).toBe("Hello");
    });

    it("deserializes dates correctly", () => {
      const conv = makeConversation({
        id: "date-test",
        startedAt: new Date("2026-03-24T12:00:00Z"),
      });
      saveConversation(conv);

      const result = getConversation("date-test");
      expect(result!.startedAt).toBeInstanceOf(Date);
      expect(result!.startedAt.toISOString()).toBe("2026-03-24T12:00:00.000Z");
    });
  });

  describe("deleteConversation", () => {
    it("removes a conversation by id", () => {
      const conv = makeConversation({ id: "to-delete" });
      saveConversation(conv);
      expect(getConversations()).toHaveLength(1);

      deleteConversation("to-delete");
      expect(getConversations()).toHaveLength(0);
      expect(getConversation("to-delete")).toBeUndefined();
    });

    it("does nothing when deleting a non-existent conversation", () => {
      const conv = makeConversation({ id: "keep" });
      saveConversation(conv);

      deleteConversation("nonexistent");
      expect(getConversations()).toHaveLength(1);
    });
  });
});
