import { describe, test, expect, beforeEach } from "vitest";
import {
  getDashboardStats,
  recordReview,
  recordConversation,
  resetStats,
} from "./stats";
import { resetStore, addWord } from "@/lib/vocabulary/store";

describe("Dashboard Stats", () => {
  beforeEach(() => {
    resetStore();
    resetStats();
  });

  test("returns zero stats when no data", () => {
    const stats = getDashboardStats();
    expect(stats.wordsLearned).toBe(0);
    expect(stats.dueToday).toBe(0);
    expect(stats.retention).toBeNull();
    expect(stats.conversations).toBe(0);
  });

  test("wordsLearned counts vocabulary items", () => {
    addWord({
      word: "猫",
      reading: "ねこ",
      meaning: "cat",
      partOfSpeech: "noun",
      languageCode: "ja",
      contextSentences: [],
      tags: [],
    });
    addWord({
      word: "犬",
      reading: "いぬ",
      meaning: "dog",
      partOfSpeech: "noun",
      languageCode: "ja",
      contextSentences: [],
      tags: [],
    });

    const stats = getDashboardStats();
    expect(stats.wordsLearned).toBe(2);
  });

  test("wordsLearned filters by language when provided", () => {
    addWord({
      word: "猫",
      reading: "ねこ",
      meaning: "cat",
      partOfSpeech: "noun",
      languageCode: "ja",
      contextSentences: [],
      tags: [],
    });
    addWord({
      word: "gato",
      reading: null,
      meaning: "cat",
      partOfSpeech: "noun",
      languageCode: "es",
      contextSentences: [],
      tags: [],
    });

    const jaStats = getDashboardStats("ja");
    expect(jaStats.wordsLearned).toBe(1);

    const allStats = getDashboardStats();
    expect(allStats.wordsLearned).toBe(2);
  });

  test("recordReview tracks reviews and calculates retention", () => {
    recordReview(true); // correct
    recordReview(true); // correct
    recordReview(false); // incorrect

    const stats = getDashboardStats();
    expect(stats.retention).toBeCloseTo(66.67, 0);
  });

  test("retention is null with no reviews", () => {
    const stats = getDashboardStats();
    expect(stats.retention).toBeNull();
  });

  test("recordConversation increments count", () => {
    recordConversation();
    recordConversation();
    recordConversation();

    const stats = getDashboardStats();
    expect(stats.conversations).toBe(3);
  });

  test("dueToday returns count of words added (all new cards are due)", () => {
    addWord({
      word: "猫",
      reading: "ねこ",
      meaning: "cat",
      partOfSpeech: "noun",
      languageCode: "ja",
      contextSentences: [],
      tags: [],
    });

    const stats = getDashboardStats();
    // New words are immediately due for first review
    expect(stats.dueToday).toBe(1);
  });

  test("stats include streakDays", () => {
    const stats = getDashboardStats();
    expect(stats).toHaveProperty("streakDays");
    expect(typeof stats.streakDays).toBe("number");
  });
});
