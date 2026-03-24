import { reviewCard, Rating } from './engine';
import type { Card, RecordLogItem } from './engine';
import type { Grade } from 'ts-fsrs';

/**
 * A vocabulary card with SRS data attached.
 */
export interface VocabCard {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  exampleSentence: string;
  srsCard: Card;
}

export interface CompletedReview {
  vocabCard: VocabCard;
  rating: Grade;
  updatedSrsCard: Card;
}

export interface ReviewSession {
  cards: VocabCard[];
  currentIndex: number;
  completed: CompletedReview[];
  startedAt: number;
}

export interface SessionProgress {
  total: number;
  completed: number;
  remaining: number;
  correctCount: number;
}

export interface SessionSummary {
  totalReviewed: number;
  correctCount: number;
  accuracy: number;
  elapsedMs: number;
}

/**
 * Create a new review session from a list of vocab cards.
 */
export function createSession(cards: VocabCard[]): ReviewSession {
  if (cards.length === 0) {
    throw new Error('Cannot create a session with no cards');
  }
  return {
    cards,
    currentIndex: 0,
    completed: [],
    startedAt: Date.now(),
  };
}

/**
 * Get the current card to review, or null if session is complete.
 */
export function getCurrentCard(session: ReviewSession): VocabCard | null {
  if (session.currentIndex >= session.cards.length) {
    return null;
  }
  return session.cards[session.currentIndex];
}

/**
 * Submit a rating for the current card. Returns a new session state and the updated SRS card.
 */
export function submitRating(
  session: ReviewSession,
  rating: Grade
): { session: ReviewSession; updatedCard: Card } {
  const currentCard = session.cards[session.currentIndex];
  const result: RecordLogItem = reviewCard(currentCard.srsCard, rating);

  const completedReview: CompletedReview = {
    vocabCard: currentCard,
    rating,
    updatedSrsCard: result.card,
  };

  return {
    session: {
      ...session,
      currentIndex: session.currentIndex + 1,
      completed: [...session.completed, completedReview],
    },
    updatedCard: result.card,
  };
}

/**
 * Get progress information for the session.
 */
export function getProgress(session: ReviewSession): SessionProgress {
  const completed = session.completed.length;
  const total = session.cards.length;
  const correctCount = session.completed.filter(
    (r) => r.rating !== Rating.Again
  ).length;

  return {
    total,
    completed,
    remaining: total - completed,
    correctCount,
  };
}

/**
 * Check if all cards have been reviewed.
 */
export function isComplete(session: ReviewSession): boolean {
  return session.currentIndex >= session.cards.length;
}

/**
 * Get summary statistics for the session.
 */
export function getSummary(session: ReviewSession): SessionSummary {
  const totalReviewed = session.completed.length;
  const correctCount = session.completed.filter(
    (r) => r.rating !== Rating.Again
  ).length;
  const accuracy =
    totalReviewed === 0 ? 0 : (correctCount / totalReviewed) * 100;
  const elapsedMs = Date.now() - session.startedAt;

  return {
    totalReviewed,
    correctCount,
    accuracy: Math.round(accuracy * 100) / 100,
    elapsedMs,
  };
}
