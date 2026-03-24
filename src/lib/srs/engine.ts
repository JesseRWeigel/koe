import {
  createEmptyCard,
  fsrs,
  type Card,
  type RecordLogItem,
  Rating,
  State,
  type Grade,
} from 'ts-fsrs';

const f = fsrs();

/**
 * Create a new FSRS card with default initial state.
 */
export function createNewCard(): Card {
  return createEmptyCard();
}

/**
 * Review a card with a given rating. Returns the updated card and review log.
 */
export function reviewCard(
  card: Card,
  rating: Grade
): RecordLogItem {
  const now = new Date();
  return f.next(card, now, rating);
}

/**
 * Filter and sort cards that are due for review.
 * Returns only cards where dueAt <= now, sorted by most overdue first.
 */
export function getDueCards<T extends { dueAt: Date }>(
  cards: T[]
): T[] {
  const now = new Date();
  return cards
    .filter((item) => item.dueAt.getTime() <= now.getTime())
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}

/**
 * Preview the next due dates for all 4 rating options.
 */
export function getNextReviewDates(
  card: Card
): Record<Grade, Date> {
  const now = new Date();
  const preview = f.repeat(card, now);
  return {
    [Rating.Again]: preview[Rating.Again].card.due,
    [Rating.Hard]: preview[Rating.Hard].card.due,
    [Rating.Good]: preview[Rating.Good].card.due,
    [Rating.Easy]: preview[Rating.Easy].card.due,
  } as Record<Grade, Date>;
}

export { Rating, State } from 'ts-fsrs';
export type { Card, RecordLogItem } from 'ts-fsrs';
