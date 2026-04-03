import { createNewCard } from "./engine";
import type { Card } from "ts-fsrs";
import type { VocabularyItem } from "@/lib/vocabulary/store";

export const SRS_STORAGE_KEY = "koe-srs-state";

export type SrsStateMap = Record<string, Card>;

/**
 * Load all SRS card states from localStorage.
 */
export function loadSrsState(): SrsStateMap {
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Rehydrate Date fields
    const result: SrsStateMap = {};
    for (const [id, card] of Object.entries(parsed)) {
      const c = card as Card & { due: string; last_review: string | null };
      result[id] = {
        ...c,
        due: new Date(c.due),
        last_review: c.last_review ? new Date(c.last_review) : null,
      } as Card;
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Save all SRS card states to localStorage.
 */
export function saveSrsState(state: SrsStateMap): void {
  try {
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Get the SRS card state for a specific vocabulary item.
 * Returns a new card if no state exists.
 */
export function getSrsCardState(vocabId: string): Card {
  const state = loadSrsState();
  return state[vocabId] ?? createNewCard();
}

/**
 * Update and persist the SRS card state for a specific vocabulary item.
 */
export function updateSrsCardState(vocabId: string, card: Card): void {
  const state = loadSrsState();
  state[vocabId] = card;
  saveSrsState(state);
}

/**
 * Get vocabulary items that are due for review.
 * Items with no SRS state are considered new and always due.
 */
export function getDueVocabCards(items: VocabularyItem[]): VocabularyItem[] {
  const state = loadSrsState();
  const now = new Date();

  return items.filter((item) => {
    const card = state[item.id];
    if (!card) return true; // New card, always due
    const due = new Date(card.due);
    return due.getTime() <= now.getTime();
  });
}
