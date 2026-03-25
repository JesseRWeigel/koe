import { describe, it, expect } from "vitest";
import {
  getPitchEntries,
  getPitchByPattern,
  getPitchForWord,
  type PitchEntry,
  type PitchPattern,
} from "./pitch-accent";

describe("pitch-accent", () => {
  describe("getPitchEntries", () => {
    it("returns an array of pitch entries", () => {
      const entries = getPitchEntries();
      expect(entries.length).toBeGreaterThanOrEqual(20);
    });

    it("each entry has required fields", () => {
      const entries = getPitchEntries();
      for (const entry of entries) {
        expect(entry).toHaveProperty("word");
        expect(entry).toHaveProperty("reading");
        expect(entry).toHaveProperty("meaning");
        expect(entry).toHaveProperty("pattern");
        expect(entry).toHaveProperty("accentPosition");
        expect(entry).toHaveProperty("morae");
        expect(entry.word.length).toBeGreaterThan(0);
        expect(entry.reading.length).toBeGreaterThan(0);
        expect(entry.morae.length).toBeGreaterThan(0);
      }
    });

    it("has valid pattern values", () => {
      const validPatterns: PitchPattern[] = [
        "heiban",
        "atamadaka",
        "nakadaka",
        "odaka",
      ];
      const entries = getPitchEntries();
      for (const entry of entries) {
        expect(validPatterns).toContain(entry.pattern);
      }
    });

    it("heiban entries have accentPosition 0", () => {
      const entries = getPitchEntries().filter((e) => e.pattern === "heiban");
      for (const entry of entries) {
        expect(entry.accentPosition).toBe(0);
      }
    });

    it("atamadaka entries have accentPosition 1", () => {
      const entries = getPitchEntries().filter(
        (e) => e.pattern === "atamadaka"
      );
      for (const entry of entries) {
        expect(entry.accentPosition).toBe(1);
      }
    });
  });

  describe("getPitchByPattern", () => {
    it("returns only heiban entries when filtered", () => {
      const entries = getPitchByPattern("heiban");
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(entry.pattern).toBe("heiban");
      }
    });

    it("returns only atamadaka entries when filtered", () => {
      const entries = getPitchByPattern("atamadaka");
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(entry.pattern).toBe("atamadaka");
      }
    });

    it("returns only nakadaka entries when filtered", () => {
      const entries = getPitchByPattern("nakadaka");
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(entry.pattern).toBe("nakadaka");
      }
    });

    it("returns only odaka entries when filtered", () => {
      const entries = getPitchByPattern("odaka");
      expect(entries.length).toBeGreaterThan(0);
      for (const entry of entries) {
        expect(entry.pattern).toBe("odaka");
      }
    });

    it("returns entries that are a subset of all entries", () => {
      const all = getPitchEntries();
      const heiban = getPitchByPattern("heiban");
      for (const entry of heiban) {
        expect(all).toContainEqual(entry);
      }
    });
  });

  describe("getPitchForWord", () => {
    it("finds a word by its kanji", () => {
      const entry = getPitchForWord("桜");
      expect(entry).toBeDefined();
      expect(entry!.reading).toBe("さくら");
      expect(entry!.pattern).toBe("heiban");
    });

    it("finds a word by its reading", () => {
      const entry = getPitchForWord("さくら");
      expect(entry).toBeDefined();
      expect(entry!.word).toBe("桜");
    });

    it("returns undefined for unknown words", () => {
      const entry = getPitchForWord("zzzzz");
      expect(entry).toBeUndefined();
    });
  });

  describe("morae splitting", () => {
    it("splits simple hiragana into individual morae", () => {
      const entry = getPitchForWord("桜");
      expect(entry!.morae).toEqual(["さ", "く", "ら"]);
    });

    it("treats きょ as a single mora (combination kana)", () => {
      // 兄弟 = きょうだい
      const entry = getPitchForWord("兄弟");
      expect(entry).toBeDefined();
      expect(entry!.morae).toEqual(["きょ", "う", "だ", "い"]);
    });

    it("treats っ as a single mora", () => {
      // きって = き っ て
      const entry = getPitchForWord("切手");
      expect(entry).toBeDefined();
      expect(entry!.morae).toEqual(["き", "っ", "て"]);
    });
  });
});
