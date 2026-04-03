import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadSrsState,
  saveSrsState,
  getSrsCardState,
  updateSrsCardState,
  getDueVocabCards,
  SRS_STORAGE_KEY,
} from "./srs-storage";
import { createNewCard } from "./engine";
import type { Card } from "ts-fsrs";
import type { VocabularyItem } from "@/lib/vocabulary/store";
import type { LanguageCode } from "@/lib/languages";

function makeVocabItem(overrides: Partial<VocabularyItem> = {}): VocabularyItem {
  return {
    id: "vocab-1",
    word: "test",
    reading: null,
    meaning: "test meaning",
    partOfSpeech: "noun",
    languageCode: "ja" as LanguageCode,
    contextSentences: [],
    tags: [],
    createdAt: new Date(),
    ...overrides,
  };
}

describe("SRS Storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadSrsState / saveSrsState", () => {
    it("returns empty object when nothing is stored", () => {
      expect(loadSrsState()).toEqual({});
    });

    it("persists and loads SRS state from localStorage", () => {
      const card = createNewCard();
      const state = { "vocab-1": card };
      saveSrsState(state);

      const loaded = loadSrsState();
      expect(loaded["vocab-1"]).toBeDefined();
      expect(loaded["vocab-1"].stability).toBe(card.stability);
    });

    it("returns empty object if localStorage has invalid JSON", () => {
      localStorage.setItem(SRS_STORAGE_KEY, "not-json");
      expect(loadSrsState()).toEqual({});
    });
  });

  describe("getSrsCardState", () => {
    it("returns existing card state if present", () => {
      const card = createNewCard();
      const state = { "vocab-1": card };
      saveSrsState(state);

      const result = getSrsCardState("vocab-1");
      expect(result.stability).toBe(card.stability);
    });

    it("returns a new card if no state exists for that ID", () => {
      const result = getSrsCardState("nonexistent");
      expect(result).toBeDefined();
      expect(result.stability).toBe(0);
    });
  });

  describe("updateSrsCardState", () => {
    it("saves updated card state and persists it", () => {
      const card = createNewCard();
      updateSrsCardState("vocab-1", card);

      const loaded = loadSrsState();
      expect(loaded["vocab-1"]).toBeDefined();
    });

    it("preserves other cards when updating one", () => {
      const card1 = createNewCard();
      const card2 = createNewCard();
      updateSrsCardState("vocab-1", card1);
      updateSrsCardState("vocab-2", card2);

      const loaded = loadSrsState();
      expect(loaded["vocab-1"]).toBeDefined();
      expect(loaded["vocab-2"]).toBeDefined();
    });
  });

  describe("getDueVocabCards", () => {
    it("returns all cards when no SRS state exists (new cards are due)", () => {
      const items = [
        makeVocabItem({ id: "v1" }),
        makeVocabItem({ id: "v2" }),
      ];

      const due = getDueVocabCards(items);
      expect(due).toHaveLength(2);
    });

    it("filters out cards that are not yet due", () => {
      const items = [
        makeVocabItem({ id: "v1" }),
        makeVocabItem({ id: "v2" }),
      ];

      // Make v1 due in the future
      const futureCard = createNewCard();
      futureCard.due = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day from now
      updateSrsCardState("v1", futureCard);

      const due = getDueVocabCards(items);
      expect(due).toHaveLength(1);
      expect(due[0].id).toBe("v2");
    });

    it("returns empty array when no cards are due", () => {
      const items = [makeVocabItem({ id: "v1" })];

      const futureCard = createNewCard();
      futureCard.due = new Date(Date.now() + 1000 * 60 * 60 * 24);
      updateSrsCardState("v1", futureCard);

      const due = getDueVocabCards(items);
      expect(due).toHaveLength(0);
    });

    it("includes cards whose due date is in the past", () => {
      const items = [makeVocabItem({ id: "v1" })];

      const pastCard = createNewCard();
      pastCard.due = new Date(Date.now() - 1000 * 60); // 1 minute ago
      updateSrsCardState("v1", pastCard);

      const due = getDueVocabCards(items);
      expect(due).toHaveLength(1);
    });
  });
});
