import { describe, test, expect } from 'vitest';
import { createNewCard, reviewCard, getDueCards, getNextReviewDates } from './engine';
import { Rating, State } from 'ts-fsrs';

describe('FSRS Engine', () => {
  describe('createNewCard', () => {
    test('returns a card with FSRS initial state (New state, stability=0, difficulty=0)', () => {
      const card = createNewCard();
      expect(card.state).toBe(State.New);
      expect(card.stability).toBe(0);
      expect(card.difficulty).toBe(0);
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(0);
      expect(card.due).toBeInstanceOf(Date);
    });
  });

  describe('reviewCard', () => {
    test('reviewCard with Rating.Good returns updated card with longer interval', () => {
      const card = createNewCard();
      const result = reviewCard(card, Rating.Good);
      expect(result.card).toBeDefined();
      expect(result.log).toBeDefined();
      expect(result.card.reps).toBe(1);
      expect(result.card.scheduled_days).toBeGreaterThanOrEqual(0);
    });

    test('reviewCard with Rating.Again returns card staying in learning', () => {
      const card = createNewCard();
      const result = reviewCard(card, Rating.Again);
      expect(result.card.state).toBe(State.Learning);
      expect(result.card.reps).toBe(1);
    });

    test('reviewCard with Rating.Easy returns card with longest interval', () => {
      const card = createNewCard();
      const resultEasy = reviewCard(card, Rating.Easy);
      const resultGood = reviewCard(card, Rating.Good);
      expect(resultEasy.card.scheduled_days).toBeGreaterThanOrEqual(
        resultGood.card.scheduled_days
      );
    });

    test('reviewCard with Rating.Hard returns card with shorter interval than Good', () => {
      const card = createNewCard();
      const resultHard = reviewCard(card, Rating.Hard);
      const resultGood = reviewCard(card, Rating.Good);
      expect(resultHard.card.scheduled_days).toBeLessThanOrEqual(
        resultGood.card.scheduled_days
      );
    });
  });

  describe('getDueCards', () => {
    test('returns only cards where dueAt <= now, sorted by most overdue first', () => {
      const now = new Date();
      const pastCard1 = {
        id: '1',
        card: createNewCard(),
        dueAt: new Date(now.getTime() - 3600_000), // 1 hour ago
      };
      const pastCard2 = {
        id: '2',
        card: createNewCard(),
        dueAt: new Date(now.getTime() - 7200_000), // 2 hours ago
      };
      const futureCard = {
        id: '3',
        card: createNewCard(),
        dueAt: new Date(now.getTime() + 3600_000), // 1 hour from now
      };

      const due = getDueCards([pastCard1, pastCard2, futureCard]);
      expect(due).toHaveLength(2);
      // Most overdue first
      expect(due[0].id).toBe('2');
      expect(due[1].id).toBe('1');
    });

    test('returns empty array when nothing is due', () => {
      const futureCard = {
        id: '1',
        card: createNewCard(),
        dueAt: new Date(Date.now() + 3600_000),
      };
      const due = getDueCards([futureCard]);
      expect(due).toHaveLength(0);
    });
  });

  describe('getNextReviewDates', () => {
    test('returns preview of all 4 rating options with their next due dates', () => {
      const card = createNewCard();
      const preview = getNextReviewDates(card);
      expect(preview[Rating.Again]).toBeInstanceOf(Date);
      expect(preview[Rating.Hard]).toBeInstanceOf(Date);
      expect(preview[Rating.Good]).toBeInstanceOf(Date);
      expect(preview[Rating.Easy]).toBeInstanceOf(Date);
    });
  });

  describe('card state progression', () => {
    test('card progresses through states: New → Learning → Review', () => {
      let card = createNewCard();
      expect(card.state).toBe(State.New);

      // First review with Good — moves to Learning
      let result = reviewCard(card, Rating.Good);
      card = result.card;
      expect([State.Learning, State.Review]).toContain(card.state);

      // Keep reviewing with Good until we reach Review state
      for (let i = 0; i < 10 && card.state !== State.Review; i++) {
        result = reviewCard(card, Rating.Good);
        card = result.card;
      }
      expect(card.state).toBe(State.Review);
    });

    test('a lapsed Review card goes to Relearning state', () => {
      // Get a card to Review state first
      let card = createNewCard();
      let result = reviewCard(card, Rating.Good);
      card = result.card;

      for (let i = 0; i < 10 && card.state !== State.Review; i++) {
        result = reviewCard(card, Rating.Good);
        card = result.card;
      }
      expect(card.state).toBe(State.Review);

      // Now fail it — should go to Relearning
      result = reviewCard(card, Rating.Again);
      expect(result.card.state).toBe(State.Relearning);
    });
  });
});
