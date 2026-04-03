# Unified Language Module

## Problem

Language identity (codes, names, labels, flags, BCP-47 tags) is duplicated across ~14 files. Adding a language requires updating each one manually, which caused the French support blocker (issue #30).

## Solution

Create `src/lib/languages.ts` as the single source of truth for language identity. All other files import from it.

## Module: `src/lib/languages.ts`

```ts
export const LANGUAGES = {
  ja:      { name: "japanese",   label: "Japanese",   flag: "🇯🇵", bcp47: "ja-JP" },
  es:      { name: "spanish",    label: "Spanish",    flag: "🇪🇸", bcp47: "es-ES" },
  "pt-BR": { name: "portuguese", label: "Portuguese", flag: "🇧🇷", bcp47: "pt-BR" },
  fr:      { name: "french",     label: "French",     flag: "🇫🇷", bcp47: "fr-FR" },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;
export type Language = typeof LANGUAGES[LanguageCode]["name"];
```

Derived runtime arrays and lookup helpers are also exported.

## Scope

- Language identity only (codes, names, labels, flags, BCP-47)
- LEVELS and SCENARIOS stay in `system-prompts.ts` (AI-specific)
- DEMO_SENTENCES stays in `shadowing/page.tsx` (page-specific)
- DB schema imports `LANGUAGE_CODES` for enum values

## Files to update

14 files import from the new module instead of defining their own types/arrays. See the design discussion for the full table.

## Testing

- All 273 existing tests pass (no behavior change)
- New unit test for `languages.ts`
- Browser verification: Chat, Read, Shadowing, Vocabulary
