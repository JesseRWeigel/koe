export interface VocabularyItem {
  id: string;
  word: string;
  reading: string | null;
  meaning: string;
  partOfSpeech: string;
  languageCode: "ja" | "es" | "pt-BR";
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

export function addWord(item: NewVocabularyItem): VocabularyItem {
  const newWord: VocabularyItem = {
    ...item,
    id: generateId(),
    createdAt: new Date(),
  };
  words.push(newWord);
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
  return words[index];
}

export function deleteWord(id: string): boolean {
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return false;
  words.splice(index, 1);
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
