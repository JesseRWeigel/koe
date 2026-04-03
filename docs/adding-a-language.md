# Adding a New Language to Koe

This guide walks you through adding support for a new language. The app uses a centralized language module, so most of the work is writing AI prompts.

**Estimated effort**: ~1 hour, mostly spent on AI prompt engineering.

## Prerequisites

- Basic familiarity with TypeScript and React
- Knowledge of the language you're adding (for writing good AI prompts)
- The app running locally (`pnpm dev`)

## Steps

### 1. Register the language (one file)

**File**: `src/lib/languages.ts`

Add one entry to the `LANGUAGES` object. Everything else (types, dropdowns, TTS mapping, DB enum) derives from this automatically.

```typescript
export const LANGUAGES = {
  ja:      { name: "japanese",   label: "Japanese",   flag: "🇯🇵", bcp47: "ja-JP" },
  es:      { name: "spanish",    label: "Spanish",    flag: "🇪🇸", bcp47: "es-ES" },
  "pt-BR": { name: "portuguese", label: "Portuguese", flag: "🇧🇷", bcp47: "pt-BR" },
  fr:      { name: "french",     label: "French",     flag: "🇫🇷", bcp47: "fr-FR" },
  // Add your language here:
  de:      { name: "german",     label: "German",     flag: "🇩🇪", bcp47: "de-DE" },
} as const;
```

Use [BCP-47 language tags](https://www.iana.org/assignments/language-subtag-registry/) for the key and `bcp47` field.

This single change automatically updates:
- The `LanguageCode` and `Language` types (used across all components)
- Language dropdowns in Chat, Read, Grammar, Vocabulary, Writing, and Import
- Language buttons in Shadowing
- TTS voice mapping
- Database enum values

### 2. Add proficiency levels

**File**: `src/lib/ai/system-prompts.ts`

Add your language to the `LEVELS` record. Most languages use CEFR (A1-C1). Japanese uses JLPT (N5-N1).

```typescript
export const LEVELS: Record<Language, { value: Level; label: string }[]> = {
  // ... existing languages ...
  german: [
    { value: "A1", label: "A1 (Beginner)" },
    { value: "A2", label: "A2 (Elementary)" },
    { value: "B1", label: "B1 (Intermediate)" },
    { value: "B2", label: "B2 (Upper Intermediate)" },
    { value: "C1", label: "C1 (Advanced)" },
  ],
};
```

### 3. AI system prompts (most important step)

**File**: `src/lib/ai/system-prompts.ts`

This is where your language expertise matters most. Add your language to these functions:

#### a. Grammar instructions (`getLanguageSpecificGrammarInstructions`)

Add a `case` for your language code with grammar focus areas. Examples:
- **French**: Subjunctive mood, gendered nouns, liaisons, passe compose vs imparfait
- **German**: Cases (nominative/accusative/dative/genitive), separable verbs, word order
- **Korean**: Honorifics, particles, verb conjugation, sentence-final endings

#### b. Writing correction guidance (`getWritingLanguageSpecificGuidance`)

Add a `case` with common mistakes to watch for in student writing.

### 4. Add shadowing demo sentences

**File**: `src/app/(app)/shadowing/page.tsx`

Add 8 beginner sentences to the `DEMO_SENTENCES` record:

```typescript
const DEMO_SENTENCES: Record<string, ShadowingSentence[]> = {
  // ... existing languages ...
  de: [
    { sentence: "Guten Morgen", meaning: "Good morning" },
    // ... 7 more sentences
  ],
};
```

### 5. Tests

Update these test files:
- `src/lib/ai/system-prompts.test.ts` -- Add tests for your language's prompts
- `src/lib/db/schema.test.ts` -- Update the enum values assertion
- `src/lib/audio/tts.test.ts` -- Add your language to the LANG_MAP test

### 6. Verify

```bash
# Run all tests
pnpm test

# Check for type errors
pnpm build

# Start the app and test your language
pnpm dev
```

Try all features with your language:
- **Chat** (`/chat`): Have a conversation, check the level adaptation
- **Read** (`/read`): Generate a passage, verify vocabulary level
- **Grammar** (`/grammar`): Ask about a grammar pattern
- **Shadowing** (`/shadowing`): Verify your flag button appears and demo sentences load
- **Vocabulary** (`/vocabulary`): Check your language tab appears, try adding a word
- **Writing** (`/writing`): Verify your language is selectable

## Tips for writing good AI prompts

- **Be specific about levels**: Don't just say "beginner" -- describe exactly what vocabulary and grammar is appropriate (e.g., "present tense only, common verbs, no subjunctive")
- **Include cultural context**: Language learning is cultural learning. Mention formality norms, common social situations, and culturally relevant topics
- **Note common mistakes**: What errors do English speakers typically make? The AI should watch for and correct these
- **Test with real conversations**: Have actual conversations with the AI at each level to verify the prompts work well

## Special cases

### Languages with non-Latin scripts (like Japanese, Korean, Chinese, Arabic)

If your language uses a different writing system:
- Consider whether learners need romanization/transliteration at beginner levels
- The `reading` field in vocabulary is designed for this (it's used for furigana in Japanese)
- Update the add-word dialog to show the reading field for your language

### Tonal languages (like Mandarin, Thai, Vietnamese)

- Consider adding tone marks or tone numbers in vocabulary entries
- Mention tone in the grammar system prompt
- TTS is especially important -- make sure the browser has voices for your language
