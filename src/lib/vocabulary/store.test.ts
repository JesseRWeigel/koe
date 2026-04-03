import { describe, test, expect, beforeEach } from "vitest";
import {
  addWord,
  getWords,
  getWord,
  updateWord,
  deleteWord,
  searchWords,
  resetStore,
  type VocabularyItem,
} from "./store";

beforeEach(() => {
  localStorage.clear();
  resetStore();
});

const sampleWord = {
  word: "食べる",
  reading: "たべる",
  meaning: "to eat",
  partOfSpeech: "verb",
  languageCode: "ja" as const,
  contextSentences: ["毎日ご飯を食べる。"],
  tags: ["JLPT N5", "food"],
};

describe("Vocabulary Store", () => {
  describe("addWord", () => {
    test("adds a word and returns it with a generated id and createdAt", () => {
      const result = addWord(sampleWord);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.word).toBe("食べる");
      expect(result.reading).toBe("たべる");
      expect(result.meaning).toBe("to eat");
      expect(result.partOfSpeech).toBe("verb");
      expect(result.languageCode).toBe("ja");
      expect(result.contextSentences).toEqual(["毎日ご飯を食べる。"]);
      expect(result.tags).toEqual(["JLPT N5", "food"]);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    test("assigns unique ids to different words", () => {
      const word1 = addWord(sampleWord);
      const word2 = addWord({ ...sampleWord, word: "飲む" });
      expect(word1.id).not.toBe(word2.id);
    });

    test("defaults reading to null when not provided", () => {
      const result = addWord({
        word: "hola",
        reading: null,
        meaning: "hello",
        partOfSpeech: "interjection",
        languageCode: "es",
        contextSentences: [],
        tags: [],
      });
      expect(result.reading).toBeNull();
    });
  });

  describe("getWords", () => {
    test("returns all words when no language filter is provided", () => {
      addWord(sampleWord);
      addWord({
        word: "hola",
        reading: null,
        meaning: "hello",
        partOfSpeech: "interjection",
        languageCode: "es",
        contextSentences: [],
        tags: [],
      });
      const words = getWords();
      expect(words).toHaveLength(2);
    });

    test("filters words by language code", () => {
      addWord(sampleWord);
      addWord({
        word: "hola",
        reading: null,
        meaning: "hello",
        partOfSpeech: "interjection",
        languageCode: "es",
        contextSentences: [],
        tags: [],
      });
      const jaWords = getWords("ja");
      expect(jaWords).toHaveLength(1);
      expect(jaWords[0].word).toBe("食べる");

      const esWords = getWords("es");
      expect(esWords).toHaveLength(1);
      expect(esWords[0].word).toBe("hola");
    });

    test("returns empty array when no words exist", () => {
      expect(getWords()).toEqual([]);
    });
  });

  describe("getWord", () => {
    test("returns the word with the given id", () => {
      const added = addWord(sampleWord);
      const found = getWord(added.id);
      expect(found).toBeDefined();
      expect(found!.word).toBe("食べる");
    });

    test("returns undefined for non-existent id", () => {
      expect(getWord("non-existent")).toBeUndefined();
    });
  });

  describe("updateWord", () => {
    test("updates specified fields and returns the updated word", () => {
      const added = addWord(sampleWord);
      const updated = updateWord(added.id, {
        meaning: "to eat (food)",
        tags: ["JLPT N5", "food", "common"],
      });
      expect(updated).toBeDefined();
      expect(updated!.meaning).toBe("to eat (food)");
      expect(updated!.tags).toEqual(["JLPT N5", "food", "common"]);
      // Unchanged fields remain
      expect(updated!.word).toBe("食べる");
    });

    test("returns undefined for non-existent id", () => {
      expect(updateWord("non-existent", { meaning: "test" })).toBeUndefined();
    });

    test("persists the update for subsequent reads", () => {
      const added = addWord(sampleWord);
      updateWord(added.id, { meaning: "to eat (updated)" });
      const found = getWord(added.id);
      expect(found!.meaning).toBe("to eat (updated)");
    });
  });

  describe("deleteWord", () => {
    test("removes the word and returns true", () => {
      const added = addWord(sampleWord);
      const result = deleteWord(added.id);
      expect(result).toBe(true);
      expect(getWord(added.id)).toBeUndefined();
      expect(getWords()).toHaveLength(0);
    });

    test("returns false for non-existent id", () => {
      expect(deleteWord("non-existent")).toBe(false);
    });
  });

  describe("searchWords", () => {
    beforeEach(() => {
      addWord(sampleWord); // 食べる - to eat
      addWord({
        word: "飲む",
        reading: "のむ",
        meaning: "to drink",
        partOfSpeech: "verb",
        languageCode: "ja",
        contextSentences: [],
        tags: ["JLPT N5"],
      });
      addWord({
        word: "comer",
        reading: null,
        meaning: "to eat",
        partOfSpeech: "verb",
        languageCode: "es",
        contextSentences: [],
        tags: [],
      });
    });

    test("searches by word text", () => {
      const results = searchWords("食べ");
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe("食べる");
    });

    test("searches by meaning", () => {
      const results = searchWords("drink");
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe("飲む");
    });

    test("searches by reading", () => {
      const results = searchWords("のむ");
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe("飲む");
    });

    test("search is case-insensitive", () => {
      const results = searchWords("DRINK");
      expect(results).toHaveLength(1);
    });

    test("filters by language code when provided", () => {
      const results = searchWords("eat", "ja");
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe("食べる");
    });

    test("returns all matching across languages without filter", () => {
      const results = searchWords("eat");
      expect(results).toHaveLength(2); // 食べる and comer
    });

    test("returns empty array for no matches", () => {
      expect(searchWords("xyz")).toEqual([]);
    });
  });

  describe("localStorage persistence", () => {
    test("persists words to localStorage when adding", () => {
      addWord(sampleWord);
      const stored = localStorage.getItem("koe-vocabulary");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].word).toBe("食べる");
    });

    test("loads words from localStorage on initialization", () => {
      // Pre-populate localStorage
      const storedWords = [
        {
          id: "vocab-99",
          word: "猫",
          reading: "ねこ",
          meaning: "cat",
          partOfSpeech: "noun",
          languageCode: "ja",
          contextSentences: [],
          tags: [],
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("koe-vocabulary", JSON.stringify(storedWords));

      // Reset and reload from localStorage
      resetStore();

      const words = getWords();
      expect(words).toHaveLength(1);
      expect(words[0].word).toBe("猫");
      expect(words[0].createdAt).toBeInstanceOf(Date);
    });

    test("persists deletion to localStorage", () => {
      const added = addWord(sampleWord);
      deleteWord(added.id);
      const stored = localStorage.getItem("koe-vocabulary");
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(0);
    });

    test("persists updates to localStorage", () => {
      const added = addWord(sampleWord);
      updateWord(added.id, { meaning: "to eat (updated)" });
      const stored = localStorage.getItem("koe-vocabulary");
      const parsed = JSON.parse(stored!);
      expect(parsed[0].meaning).toBe("to eat (updated)");
    });
  });
});
