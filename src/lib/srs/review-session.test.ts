import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createNewCard, Rating } from './engine';
import {
  createSession,
  getCurrentCard,
  submitRating,
  getProgress,
  isComplete,
  getSummary,
  type ReviewSession,
  type VocabCard,
} from './review-session';

function makeDemoCards(count: number): VocabCard[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `card-${i + 1}`,
    word: `word${i + 1}`,
    reading: `reading${i + 1}`,
    meaning: `meaning${i + 1}`,
    exampleSentence: `Example sentence ${i + 1}`,
    srsCard: createNewCard(),
  }));
}

describe('ReviewSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-23T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createSession', () => {
    test('creates a session with the given cards', () => {
      const cards = makeDemoCards(3);
      const session = createSession(cards);
      expect(session.cards).toHaveLength(3);
      expect(session.currentIndex).toBe(0);
      expect(session.completed).toHaveLength(0);
    });

    test('throws if given an empty card list', () => {
      expect(() => createSession([])).toThrow();
    });
  });

  describe('getCurrentCard', () => {
    test('returns the first card initially', () => {
      const cards = makeDemoCards(3);
      const session = createSession(cards);
      const current = getCurrentCard(session);
      expect(current?.id).toBe('card-1');
    });

    test('returns null when session is complete', () => {
      const cards = makeDemoCards(1);
      let session = createSession(cards);
      session = submitRating(session, Rating.Good).session;
      expect(getCurrentCard(session)).toBeNull();
    });
  });

  describe('submitRating', () => {
    test('advances to the next card after rating', () => {
      const cards = makeDemoCards(3);
      let session = createSession(cards);
      const result = submitRating(session, Rating.Good);
      session = result.session;
      expect(getCurrentCard(session)?.id).toBe('card-2');
    });

    test('returns the updated SRS card', () => {
      const cards = makeDemoCards(2);
      const session = createSession(cards);
      const result = submitRating(session, Rating.Good);
      expect(result.updatedCard.reps).toBe(1);
    });

    test('records the rating in completed list', () => {
      const cards = makeDemoCards(2);
      let session = createSession(cards);
      session = submitRating(session, Rating.Good).session;
      expect(session.completed).toHaveLength(1);
      expect(session.completed[0].rating).toBe(Rating.Good);
    });

    test('Rating.Again counts as incorrect', () => {
      const cards = makeDemoCards(2);
      let session = createSession(cards);
      session = submitRating(session, Rating.Again).session;
      expect(session.completed[0].rating).toBe(Rating.Again);
    });
  });

  describe('getProgress', () => {
    test('reports correct progress after some reviews', () => {
      const cards = makeDemoCards(5);
      let session = createSession(cards);
      session = submitRating(session, Rating.Good).session;
      session = submitRating(session, Rating.Again).session;
      session = submitRating(session, Rating.Easy).session;

      const progress = getProgress(session);
      expect(progress.total).toBe(5);
      expect(progress.completed).toBe(3);
      expect(progress.remaining).toBe(2);
      expect(progress.correctCount).toBe(2); // Good + Easy
    });

    test('initial progress shows zero completed', () => {
      const session = createSession(makeDemoCards(3));
      const progress = getProgress(session);
      expect(progress.total).toBe(3);
      expect(progress.completed).toBe(0);
      expect(progress.remaining).toBe(3);
      expect(progress.correctCount).toBe(0);
    });
  });

  describe('isComplete', () => {
    test('returns false when cards remain', () => {
      const session = createSession(makeDemoCards(3));
      expect(isComplete(session)).toBe(false);
    });

    test('returns true when all cards reviewed', () => {
      const cards = makeDemoCards(2);
      let session = createSession(cards);
      session = submitRating(session, Rating.Good).session;
      session = submitRating(session, Rating.Hard).session;
      expect(isComplete(session)).toBe(true);
    });
  });

  describe('getSummary', () => {
    test('returns session stats after completion', () => {
      const cards = makeDemoCards(3);
      let session = createSession(cards);

      // Advance time by 30 seconds between reviews
      session = submitRating(session, Rating.Good).session;
      vi.advanceTimersByTime(10_000);
      session = submitRating(session, Rating.Again).session;
      vi.advanceTimersByTime(20_000);
      session = submitRating(session, Rating.Easy).session;

      const summary = getSummary(session);
      expect(summary.totalReviewed).toBe(3);
      expect(summary.correctCount).toBe(2);
      expect(summary.accuracy).toBeCloseTo(66.67, 0);
      expect(summary.elapsedMs).toBeGreaterThanOrEqual(30_000);
    });

    test('accuracy is 100% when all correct', () => {
      const cards = makeDemoCards(2);
      let session = createSession(cards);
      session = submitRating(session, Rating.Good).session;
      session = submitRating(session, Rating.Easy).session;
      expect(getSummary(session).accuracy).toBe(100);
    });

    test('accuracy is 0% when all incorrect', () => {
      const cards = makeDemoCards(2);
      let session = createSession(cards);
      session = submitRating(session, Rating.Again).session;
      session = submitRating(session, Rating.Again).session;
      expect(getSummary(session).accuracy).toBe(0);
    });
  });
});
