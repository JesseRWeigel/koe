import { jaGuide } from "./ja";
import { esGuide } from "./es";
import { frGuide } from "./fr";
import { ptBRGuide } from "./pt-BR";

export interface GuideSection {
  title: string;
  content: string;
}

const guides: Record<string, GuideSection[]> = {
  ja: jaGuide,
  es: esGuide,
  fr: frGuide,
  "pt-BR": ptBRGuide,
};

/**
 * Returns the learning guide sections for a given language code,
 * or null if no guide exists for that language.
 */
export function getGuide(languageCode: string): GuideSection[] | null {
  return guides[languageCode] ?? null;
}
