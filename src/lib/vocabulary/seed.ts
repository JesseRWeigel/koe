import type { LanguageCode } from "@/lib/languages";
import type { NewVocabularyItem } from "./store";
import { jaN5Vocabulary } from "@/data/vocabulary/ja-n5";

const SEED_KEY_PREFIX = "koe-seeded-";

/**
 * Return starter vocabulary for a given language.
 * Currently only Japanese (N5) is populated.
 */
export function getSeedVocabulary(languageCode: LanguageCode): NewVocabularyItem[] {
  switch (languageCode) {
    case "ja":
      return jaN5Vocabulary;
    default:
      return [];
  }
}

/** localStorage key for the given seed set. */
function seedKey(setId: string): string {
  return `${SEED_KEY_PREFIX}${setId}`;
}

/** Check whether a seed set has already been loaded. */
export function hasBeenSeeded(setId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(seedKey(setId)) === "true";
}

/** Mark a seed set as loaded so it won't be loaded again. */
export function markSeeded(setId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(seedKey(setId), "true");
}
