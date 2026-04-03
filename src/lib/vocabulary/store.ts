import type { LanguageCode } from "@/lib/languages";

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

const STORAGE_KEY = "koe-vocabulary";

interface StoredVocabularyItem {
  id: string;
  word: string;
  reading: string | null;
  meaning: string;
  partOfSpeech: string;
  languageCode: string;
  contextSentences: string[];
  tags: string[];
  createdAt: string;
}

function loadFromStorage(): VocabularyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as StoredVocabularyItem[];
    return stored.map((s) => ({
      ...s,
      languageCode: s.languageCode as LanguageCode,
      createdAt: new Date(s.createdAt),
    }));
  } catch {
    return [];
  }
}

function saveToStorage(items: VocabularyItem[]): void {
  try {
    const toStore: StoredVocabularyItem[] = items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // localStorage may be unavailable (SSR, quota exceeded, etc.)
  }
}

let words: VocabularyItem[] = loadFromStorage();

let nextId = 1;

function generateId(): string {
  return `vocab-${nextId++}-${Date.now().toString(36)}`;
}

export function resetStore(): void {
  words = loadFromStorage();
  nextId = 1;
}

export function addWord(item: NewVocabularyItem): VocabularyItem {
  const newWord: VocabularyItem = {
    ...item,
    id: generateId(),
    createdAt: new Date(),
  };
  words.push(newWord);
  saveToStorage(words);
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
  saveToStorage(words);
  return words[index];
}

export function deleteWord(id: string): boolean {
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return false;
  words.splice(index, 1);
  saveToStorage(words);
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
