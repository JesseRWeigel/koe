import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  getConversations,
  saveConversation,
  type Conversation,
} from "./history";
import {
  getDashboardStats,
  recordConversation,
  resetStats,
} from "@/lib/dashboard/stats";
import type { StoredConversation } from "@/lib/conversation-storage";

const LEGACY_KEY = "koe-conversations";
const HISTORY_KEY = "koe-conversations-v2";
const COUNT_KEY = "koe-conversation-count-v2";

const storedConversation: StoredConversation = {
  id: "legacy-conversation",
  language: "japanese",
  level: "N5",
  startedAt: "2026-09-08T12:00:00.000Z",
  messages: [
    { role: "user", text: "Synthetic question" },
    { role: "assistant", text: "Synthetic answer" },
  ],
};

describe("conversation storage migration", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStats();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test.each([
    ["history first", () => getConversations()],
    ["dashboard first", () => resetStats()],
  ])("migrates a valid legacy array without data loss when loading %s", (_name, loadFirst) => {
    const legacyRaw = JSON.stringify([storedConversation]);
    localStorage.setItem(LEGACY_KEY, legacyRaw);

    loadFirst();
    resetStats();

    expect(getConversations()).toEqual([
      {
        ...storedConversation,
        startedAt: new Date(storedConversation.startedAt),
      },
    ]);
    expect(getDashboardStats().conversations).toBe(1);
    expect(localStorage.getItem(LEGACY_KEY)).toBe(legacyRaw);
    expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toEqual([
      storedConversation,
    ]);
    expect(localStorage.getItem(COUNT_KEY)).toBe("1");

    getConversations();
    resetStats();
    expect(getConversations()).toHaveLength(1);
    expect(getDashboardStats().conversations).toBe(1);
  });

  test("preserves a legacy numeric count while recovering empty history", () => {
    localStorage.setItem(LEGACY_KEY, "7");

    resetStats();

    expect(getDashboardStats().conversations).toBe(7);
    expect(getConversations()).toEqual([]);
    expect(localStorage.getItem(COUNT_KEY)).toBe("7");
    expect(localStorage.getItem(LEGACY_KEY)).toBe("7");
  });

  test.each([
    ["missing", null],
    ["null", "null"],
    ["malformed JSON", "{not-json"],
    ["invalid array shape", JSON.stringify([{ ...storedConversation, id: 42 }])],
  ])("recovers safely from %s legacy storage", (_name, raw) => {
    if (raw !== null) localStorage.setItem(LEGACY_KEY, raw);

    resetStats();

    expect(getDashboardStats().conversations).toBe(0);
    expect(getConversations()).toEqual([]);
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
    expect(localStorage.getItem(COUNT_KEY)).toBeNull();
  });

  test("keeps recoverable legacy history when migration writes fail", () => {
    const legacyRaw = JSON.stringify([storedConversation]);
    localStorage.setItem(LEGACY_KEY, legacyRaw);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(getConversations()).toHaveLength(1);
    expect(localStorage.getItem(LEGACY_KEY)).toBe(legacyRaw);
    expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  });

  test("storage denial returns safe defaults", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });

    expect(() => resetStats()).not.toThrow();
    expect(getDashboardStats().conversations).toBe(0);
    expect(getConversations()).toEqual([]);
  });

  test("a history read failure cannot overwrite existing v2 history", () => {
    const existingRaw = JSON.stringify([storedConversation]);
    localStorage.setItem(HISTORY_KEY, existingRaw);
    const realGetItem = Storage.prototype.getItem;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (
      this: Storage,
      key
    ) {
      if (key === HISTORY_KEY) {
        throw new DOMException("Temporary read failure", "SecurityError");
      }
      return realGetItem.call(this, key);
    });

    expect(() =>
      saveConversation({
        ...storedConversation,
        id: "new-conversation",
        startedAt: new Date(storedConversation.startedAt),
      })
    ).not.toThrow();

    vi.restoreAllMocks();
    expect(localStorage.getItem(HISTORY_KEY)).toBe(existingRaw);
  });

  test("a count read failure cannot overwrite the existing v2 count", () => {
    localStorage.setItem(COUNT_KEY, "7");
    const realGetItem = Storage.prototype.getItem;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (
      this: Storage,
      key
    ) {
      if (key === COUNT_KEY) {
        throw new DOMException("Temporary read failure", "SecurityError");
      }
      return realGetItem.call(this, key);
    });

    resetStats();
    recordConversation();

    vi.restoreAllMocks();
    expect(localStorage.getItem(COUNT_KEY)).toBe("7");
  });

  test("quota errors do not crash conversation saves", () => {
    const conversation: Conversation = {
      ...storedConversation,
      startedAt: new Date(storedConversation.startedAt),
    };
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(() => saveConversation(conversation)).not.toThrow();
  });
});
