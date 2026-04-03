import type { LanguageCode } from "@/lib/languages";

export const VOCAB_STORAGE_KEY = "koe-vocabulary";

export interface VocabularyItem {
  id: string;
  word: string;
  reading: string | null;
  meaning: string;
  partOfSpeech: string;
  languageCode: LanguageCode;
  contextSentences: string[];
  tags: string[];
  createdAt: Date;
}

export type NewVocabularyItem = Omit<VocabularyItem, "id" | "createdAt">;

let words: VocabularyItem[] = [];

let nextId = 1;

function generateId(): string {
  return `vocab-${nextId++}-${Date.now().toString(36)}`;
}

export function resetStore(): void {
  words = [];
  nextId = 1;
}

/**
 * Save current vocabulary to localStorage.
 */
export function saveToStorage(): void {
  try {
    localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(words));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Load vocabulary from localStorage into the in-memory store.
 */
export function loadFromStorage(): void {
  try {
    const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    words = parsed.map((item: VocabularyItem & { createdAt: string }) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    }));
    // Update nextId to avoid collisions
    if (words.length > 0) {
      const maxNum = words.reduce((max, w) => {
        const match = w.id.match(/^vocab-(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      nextId = maxNum + 1;
    }
  } catch {
    // Invalid data, keep current state
  }
}

export function addWord(item: NewVocabularyItem): VocabularyItem {
  const newWord: VocabularyItem = {
    ...item,
    id: generateId(),
    createdAt: new Date(),
  };
  words.push(newWord);
  saveToStorage();
  return newWord;
}

export function getWords(languageCode?: string): VocabularyItem[] {
  if (!languageCode) return [...words];
  return words.filter((w) => w.languageCode === languageCode);
}

export function getWord(id: string): VocabularyItem | undefined {
  return words.find((w) => w.id === id);
}

export function updateWord(
  id: string,
  updates: Partial<Omit<VocabularyItem, "id" | "createdAt">>
): VocabularyItem | undefined {
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return undefined;
  words[index] = { ...words[index], ...updates };
  saveToStorage();
  return words[index];
}

export function deleteWord(id: string): boolean {
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return false;
  words.splice(index, 1);
  saveToStorage();
  return true;
}

export function searchWords(
  query: string,
  languageCode?: string
): VocabularyItem[] {
  const lowerQuery = query.toLowerCase();
  let filtered = languageCode
    ? words.filter((w) => w.languageCode === languageCode)
    : words;
  return filtered.filter(
    (w) =>
      w.word.toLowerCase().includes(lowerQuery) ||
      w.meaning.toLowerCase().includes(lowerQuery) ||
      (w.reading && w.reading.toLowerCase().includes(lowerQuery))
  );
}
