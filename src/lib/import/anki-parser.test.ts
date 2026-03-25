import { describe, it, expect } from "vitest";
import {
  parseAnkiExport,
  mapToVocabulary,
  type ImportedCard,
  type ImportMapping,
} from "./anki-parser";

describe("parseAnkiExport", () => {
  it("parses tab-separated values correctly", () => {
    const input = "食べる\tたべる\tto eat\n飲む\tのむ\tto drink";
    const result = parseAnkiExport(input);
    expect(result).toEqual([
      { fields: ["食べる", "たべる", "to eat"] },
      { fields: ["飲む", "のむ", "to drink"] },
    ]);
  });

  it("parses comma-separated values correctly", () => {
    const input = "食べる,たべる,to eat\n飲む,のむ,to drink";
    const result = parseAnkiExport(input);
    expect(result).toEqual([
      { fields: ["食べる", "たべる", "to eat"] },
      { fields: ["飲む", "のむ", "to drink"] },
    ]);
  });

  it("handles quoted fields with commas inside", () => {
    const input = '"to eat, to consume",食べる,たべる\n"to drink, to sip",飲む,のむ';
    const result = parseAnkiExport(input);
    expect(result).toEqual([
      { fields: ["to eat, to consume", "食べる", "たべる"] },
      { fields: ["to drink, to sip", "飲む", "のむ"] },
    ]);
  });

  it("handles quoted fields with escaped quotes", () => {
    const input = '"He said ""hello""",word,meaning';
    const result = parseAnkiExport(input);
    expect(result).toEqual([
      { fields: ['He said "hello"', "word", "meaning"] },
    ]);
  });

  it("skips empty lines", () => {
    const input = "食べる\tたべる\tto eat\n\n\n飲む\tのむ\tto drink\n";
    const result = parseAnkiExport(input);
    expect(result).toHaveLength(2);
  });

  it("auto-detects tab delimiter", () => {
    const input = "word\treading\tmeaning";
    const result = parseAnkiExport(input);
    expect(result).toEqual([{ fields: ["word", "reading", "meaning"] }]);
  });

  it("auto-detects comma delimiter when no tabs present", () => {
    const input = "word,reading,meaning";
    const result = parseAnkiExport(input);
    expect(result).toEqual([{ fields: ["word", "reading", "meaning"] }]);
  });

  it("allows explicit delimiter override", () => {
    const input = "word;reading;meaning";
    const result = parseAnkiExport(input, ";");
    expect(result).toEqual([{ fields: ["word", "reading", "meaning"] }]);
  });

  it("trims whitespace from unquoted fields", () => {
    const input = " word , reading , meaning ";
    const result = parseAnkiExport(input);
    expect(result).toEqual([{ fields: ["word", "reading", "meaning"] }]);
  });

  it("returns empty array for empty input", () => {
    expect(parseAnkiExport("")).toEqual([]);
    expect(parseAnkiExport("  \n\n  ")).toEqual([]);
  });
});

describe("mapToVocabulary", () => {
  const cards: ImportedCard[] = [
    { fields: ["食べる", "たべる", "to eat"] },
    { fields: ["飲む", "のむ", "to drink"] },
  ];

  const mapping: ImportMapping = {
    wordField: 0,
    readingField: 1,
    meaningField: 2,
  };

  it("maps fields to vocabulary items using the column mapping", () => {
    const result = mapToVocabulary(cards, mapping, "ja");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      word: "食べる",
      reading: "たべる",
      meaning: "to eat",
      partOfSpeech: "noun",
      languageCode: "ja",
      contextSentences: [],
      tags: ["imported"],
    });
    expect(result[1]).toEqual({
      word: "飲む",
      reading: "のむ",
      meaning: "to drink",
      partOfSpeech: "noun",
      languageCode: "ja",
      contextSentences: [],
      tags: ["imported"],
    });
  });

  it("handles missing optional fields (reading is null when readingField is null)", () => {
    const mappingNoReading: ImportMapping = {
      wordField: 0,
      readingField: null,
      meaningField: 1,
    };
    const cardsNoReading: ImportedCard[] = [
      { fields: ["comer", "to eat"] },
    ];
    const result = mapToVocabulary(cardsNoReading, mappingNoReading, "es");
    expect(result).toHaveLength(1);
    expect(result[0].reading).toBeNull();
    expect(result[0].word).toBe("comer");
    expect(result[0].meaning).toBe("to eat");
    expect(result[0].languageCode).toBe("es");
  });

  it("handles different column orderings", () => {
    const reverseMapping: ImportMapping = {
      wordField: 2,
      readingField: 1,
      meaningField: 0,
    };
    const reverseCards: ImportedCard[] = [
      { fields: ["to eat", "たべる", "食べる"] },
    ];
    const result = mapToVocabulary(reverseCards, reverseMapping, "ja");
    expect(result[0].word).toBe("食べる");
    expect(result[0].reading).toBe("たべる");
    expect(result[0].meaning).toBe("to eat");
  });

  it("skips cards with empty word or meaning fields", () => {
    const cardsWithEmpty: ImportedCard[] = [
      { fields: ["食べる", "たべる", "to eat"] },
      { fields: ["", "のむ", "to drink"] },
      { fields: ["走る", "はしる", ""] },
    ];
    const result = mapToVocabulary(cardsWithEmpty, mapping, "ja");
    expect(result).toHaveLength(1);
    expect(result[0].word).toBe("食べる");
  });
});
