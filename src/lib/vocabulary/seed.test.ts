import { describe, test, expect } from "vitest";
import { getSeedVocabulary } from "./seed";
import { jaN5Vocabulary } from "@/data/vocabulary/ja-n5";

describe("N5 seed vocabulary data", () => {
  const words = jaN5Vocabulary;

  test("has at least 100 words", () => {
    expect(words.length).toBeGreaterThanOrEqual(100);
  });

  test("every word has all required fields", () => {
    for (const w of words) {
      expect(w.word).toBeTruthy();
      expect(typeof w.word).toBe("string");
      expect(typeof w.reading).toBe("string");
      expect(w.reading!.length).toBeGreaterThan(0);
      expect(w.meaning).toBeTruthy();
      expect(typeof w.meaning).toBe("string");
      expect(w.partOfSpeech).toBeTruthy();
      expect(typeof w.partOfSpeech).toBe("string");
      expect(w.languageCode).toBe("ja");
      expect(Array.isArray(w.contextSentences)).toBe(true);
      expect(Array.isArray(w.tags)).toBe(true);
    }
  });

  test("all words are tagged with 'JLPT N5'", () => {
    for (const w of words) {
      expect(w.tags).toContain("JLPT N5");
    }
  });

  test("all readings are non-empty strings", () => {
    for (const w of words) {
      expect(typeof w.reading).toBe("string");
      expect(w.reading!.trim().length).toBeGreaterThan(0);
    }
  });

  test("no duplicate words", () => {
    const seen = new Set<string>();
    for (const w of words) {
      const key = `${w.word}|${w.reading}`;
      expect(seen.has(key), `Duplicate entry: ${w.word} (${w.reading})`).toBe(false);
      seen.add(key);
    }
  });
});

describe("getSeedVocabulary", () => {
  test("returns N5 words for Japanese", () => {
    const result = getSeedVocabulary("ja");
    expect(result.length).toBeGreaterThanOrEqual(100);
    expect(result[0].languageCode).toBe("ja");
  });

  test("returns empty array for languages without seed data", () => {
    expect(getSeedVocabulary("es")).toEqual([]);
    expect(getSeedVocabulary("fr")).toEqual([]);
    expect(getSeedVocabulary("pt-BR")).toEqual([]);
  });
});
