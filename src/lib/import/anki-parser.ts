import type { NewVocabularyItem } from "@/lib/vocabulary/store";
import type { LanguageCode } from "@/lib/languages";

export interface ImportedCard {
  fields: string[];
}

export interface ImportMapping {
  wordField: number;
  readingField: number | null;
  meaningField: number;
}

function detectDelimiter(text: string): string {
  const firstLine = text.split("\n")[0] ?? "";
  if (firstLine.includes("\t")) return "\t";
  return ",";
}

function parseLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
          continue;
        }
        // End of quoted field
        inQuotes = false;
        i++;
        continue;
      }
      current += char;
      i++;
    } else {
      if (char === '"' && current.length === 0) {
        inQuotes = true;
        i++;
        continue;
      }
      if (char === delimiter) {
        fields.push(current.trim());
        current = "";
        i++;
        continue;
      }
      current += char;
      i++;
    }
  }

  fields.push(current.trim());
  return fields;
}

export function parseAnkiExport(
  text: string,
  delimiter?: string
): ImportedCard[] {
  if (!text.trim()) return [];

  const effectiveDelimiter = delimiter ?? detectDelimiter(text);
  const lines = text.split("\n");
  const cards: ImportedCard[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const fields = parseLine(line, effectiveDelimiter);
    cards.push({ fields });
  }

  return cards;
}

export function mapToVocabulary(
  cards: ImportedCard[],
  mapping: ImportMapping,
  languageCode: string
): NewVocabularyItem[] {
  const items: NewVocabularyItem[] = [];

  for (const card of cards) {
    const word = card.fields[mapping.wordField]?.trim() ?? "";
    const meaning = card.fields[mapping.meaningField]?.trim() ?? "";

    if (!word || !meaning) continue;

    const reading =
      mapping.readingField !== null
        ? (card.fields[mapping.readingField]?.trim() ?? null)
        : null;

    items.push({
      word,
      reading: reading || null,
      meaning,
      partOfSpeech: "noun",
      languageCode: languageCode as LanguageCode,
      contextSentences: [],
      tags: ["imported"],
    });
  }

  return items;
}
