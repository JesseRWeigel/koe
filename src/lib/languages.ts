/**
 * Single source of truth for all supported languages.
 *
 * To add a new language, add one entry to LANGUAGES below.
 * Every type, label, flag, and BCP-47 tag derives from this object.
 */
export const LANGUAGES = {
  ja: { name: "japanese", label: "Japanese", flag: "\u{1F1EF}\u{1F1F5}", bcp47: "ja-JP" },
  es: { name: "spanish", label: "Spanish", flag: "\u{1F1EA}\u{1F1F8}", bcp47: "es-ES" },
  "pt-BR": { name: "portuguese", label: "Portuguese", flag: "\u{1F1E7}\u{1F1F7}", bcp47: "pt-BR" },
  fr: { name: "french", label: "French", flag: "\u{1F1EB}\u{1F1F7}", bcp47: "fr-FR" },
} as const;

/** Short language code: "ja" | "es" | "pt-BR" | "fr" */
export type LanguageCode = keyof typeof LANGUAGES;

/** Full language name: "japanese" | "spanish" | "portuguese" | "french" */
export type Language = (typeof LANGUAGES)[LanguageCode]["name"];

/** All language codes as a runtime array. */
export const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

/** Full language info list — useful for rendering dropdowns, tabs, and buttons. */
export const LANGUAGE_LIST = (Object.entries(LANGUAGES) as [LanguageCode, (typeof LANGUAGES)[LanguageCode]][]).map(
  ([code, info]) => ({ code, ...info }),
);

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

const codeByName = Object.fromEntries(
  Object.entries(LANGUAGES).map(([code, info]) => [info.name, code]),
) as Record<Language, LanguageCode>;

/** Map a full language name ("french") to its code ("fr"). */
export function languageToCode(name: Language): LanguageCode {
  return codeByName[name];
}

/** Map a language code ("fr") to its full name ("french"). */
export function codeToLanguage(code: LanguageCode): Language {
  return LANGUAGES[code].name;
}

/** Map a language code to its display label ("French"). */
export function codeToLabel(code: LanguageCode): string {
  return LANGUAGES[code].label;
}

/** Map a language code to its BCP-47 voice tag ("fr-FR"). */
export function codeToBcp47(code: LanguageCode): string {
  return LANGUAGES[code].bcp47;
}
