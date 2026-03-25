import { describe, it, expect } from "vitest";
import {
  getCognates,
  getFalseFriends,
  searchCognates,
  getCognateForWord,
  type CognateEntry,
} from "./cognates";

describe("cognates database", () => {
  describe("getCognates", () => {
    it("returns all cognate entries", () => {
      const all = getCognates();
      expect(all.length).toBeGreaterThanOrEqual(45);
    });

    it("each entry has required fields", () => {
      const all = getCognates();
      for (const entry of all) {
        expect(entry.spanish).toBeDefined();
        expect(entry.portuguese).toBeDefined();
        expect(entry.meaning).toBeDefined();
        expect(typeof entry.isFalseFriend).toBe("boolean");
      }
    });

    it("contains both true cognates and false friends", () => {
      const all = getCognates();
      const trueCognates = all.filter((e) => !e.isFalseFriend);
      const falseFriends = all.filter((e) => e.isFalseFriend);
      expect(trueCognates.length).toBeGreaterThanOrEqual(30);
      expect(falseFriends.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe("getFalseFriends", () => {
    it("returns only false friends", () => {
      const ff = getFalseFriends();
      expect(ff.length).toBeGreaterThanOrEqual(15);
      for (const entry of ff) {
        expect(entry.isFalseFriend).toBe(true);
      }
    });

    it("every false friend has a note", () => {
      const ff = getFalseFriends();
      for (const entry of ff) {
        expect(entry.note).toBeDefined();
        expect(entry.note!.length).toBeGreaterThan(0);
      }
    });
  });

  describe("searchCognates", () => {
    it("finds cognates by Spanish word", () => {
      const results = searchCognates("casa");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((e) => e.spanish === "casa")).toBe(true);
    });

    it("finds cognates by Portuguese word", () => {
      const results = searchCognates("livro");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((e) => e.portuguese === "livro")).toBe(true);
    });

    it("finds cognates by meaning", () => {
      const results = searchCognates("water");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some((e) => e.meaning.toLowerCase().includes("water"))).toBe(true);
    });

    it("is case-insensitive", () => {
      const lower = searchCognates("casa");
      const upper = searchCognates("CASA");
      expect(lower).toEqual(upper);
    });

    it("returns empty array for no matches", () => {
      const results = searchCognates("xyznonexistent");
      expect(results).toEqual([]);
    });

    it("matches partial strings", () => {
      const results = searchCognates("cas");
      expect(results.some((e) => e.spanish.includes("cas") || e.portuguese.includes("cas"))).toBe(true);
    });
  });

  describe("getCognateForWord", () => {
    it("finds a cognate by Spanish word", () => {
      const result = getCognateForWord("casa", "es");
      expect(result).toBeDefined();
      expect(result!.spanish).toBe("casa");
    });

    it("finds a cognate by Portuguese word", () => {
      const result = getCognateForWord("livro", "pt-BR");
      expect(result).toBeDefined();
      expect(result!.portuguese).toBe("livro");
    });

    it("returns undefined for unknown words", () => {
      const result = getCognateForWord("xyznotaword", "es");
      expect(result).toBeUndefined();
    });

    it("is case-insensitive", () => {
      const result = getCognateForWord("Casa", "es");
      expect(result).toBeDefined();
      expect(result!.spanish).toBe("casa");
    });

    it("finds false friends", () => {
      const result = getCognateForWord("embarazada", "es");
      expect(result).toBeDefined();
      expect(result!.isFalseFriend).toBe(true);
    });
  });
});
