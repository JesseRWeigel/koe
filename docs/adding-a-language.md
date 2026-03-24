# Adding a New Language to Koe

This guide walks you through adding support for a new language. The app is designed to be multi-language from the ground up, so the process is mostly adding your language to existing lists and writing AI prompts.

**Estimated effort**: ~1-2 hours, mostly spent on AI prompt engineering.

## Prerequisites

- Basic familiarity with TypeScript and React
- Knowledge of the language you're adding (for writing good AI prompts)
- The app running locally (`pnpm dev`)

## Steps

### 1. Database schema

**File**: `src/lib/db/schema.ts`

Add your language code to the `languageCodeEnum`. Use [BCP-47 language tags](https://www.iana.org/assignments/language-subtag-registry/) (e.g., `fr` for French, `de` for German, `ko` for Korean).

```typescript
export const languageCodeEnum = pgEnum("language_code", ["ja", "es", "pt-BR", "fr"]);
//                                                                              ^^^^
```

### 2. Language switcher

**File**: `src/components/language-switcher.tsx`

Add your language to the `languages` array with its flag emoji:

```typescript
const languages = [
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "pt-BR", name: "Portuguese", flag: "🇧🇷" },
  { code: "fr", name: "French", flag: "🇫🇷" },  // Add your language
] as const;
```

Update the `LanguageCode` type — it's inferred automatically from this array.

### 3. Vocabulary list

**File**: `src/components/vocabulary/vocabulary-list.tsx`

Add a tab for your language in the vocabulary filter tabs.

### 4. AI system prompts (most important step)

**File**: `src/lib/ai/system-prompts.ts`

This is where your language expertise matters most. Update these:

#### a. Types and constants

```typescript
// Add to Language type
export type Language = "japanese" | "spanish" | "portuguese" | "french";

// Add to LANGUAGES array
{ value: "french", label: "French" },

// Add to LEVELS record
// Most languages use CEFR (A1-C1). Japanese uses JLPT (N5-N1).
french: [
  { value: "A1", label: "A1 (Beginner)" },
  { value: "A2", label: "A2 (Elementary)" },
  { value: "B1", label: "B1 (Intermediate)" },
  { value: "B2", label: "B2 (Upper Intermediate)" },
  { value: "C1", label: "C1 (Advanced)" },
],
```

#### b. Chat system prompt (`buildSystemPrompt`)

Add a section for your language with:
- Language-specific cultural context
- Formality levels (e.g., tu/vous in French, du/Sie in German)
- Common mistakes speakers of English make
- Natural conversation patterns

#### c. Reader system prompt (`buildReaderSystemPrompt`)

Add instructions for generating reading content:
- Vocabulary constraints per level
- Any special formatting (e.g., furigana for Japanese)
- Cultural topics that are engaging for learners

#### d. Grammar system prompt (`buildGrammarSystemPrompt`)

Add language-specific grammar instruction focus areas. Examples:
- **French**: Subjunctive mood, gendered nouns, liaisons, passé composé vs imparfait
- **German**: Cases (nominative/accusative/dative/genitive), separable verbs, word order
- **Korean**: Honorifics, particles, verb conjugation, sentence-final endings

### 5. TTS language mapping

**File**: `src/lib/audio/tts.ts`

Add the BCP-47 voice tag for browser text-to-speech:

```typescript
export const LANG_MAP: Record<TTSOptions["lang"], string> = {
  ja: "ja-JP",
  es: "es-ES",
  "pt-BR": "pt-BR",
  fr: "fr-FR",  // Add your language
};
```

Also update the `TTSOptions["lang"]` type to include your language code.

### 6. Chat and reader UI (automatic)

The language/level selectors in these files pull from the `LANGUAGES` and `LEVELS` constants:
- `src/components/chat/chat-header.tsx`
- `src/components/reader/reader-controls.tsx`

They'll automatically include your language once you update step 4. No code changes needed here.

### 7. Vocabulary store

**File**: `src/lib/vocabulary/store.ts`

Add your language code to the `languageCode` field type in the `VocabularyItem` interface.

### 8. Tests

Update these test files:
- `src/lib/ai/system-prompts.test.ts` — Add tests for your language's prompts
- `src/lib/db/schema.test.ts` — Update the enum value count test
- `src/lib/audio/tts.test.ts` — Add your language to the LANG_MAP test

### 9. Verify

```bash
# Run all tests
pnpm test

# Check for type errors
pnpm build

# Start the app and test your language
pnpm dev
```

Try all three AI features with your language:
- **Chat** (`/chat`): Have a conversation, check the level adaptation
- **Read** (`/read`): Generate a passage, verify vocabulary level
- **Grammar** (`/grammar`): Ask about a grammar pattern

## Tips for writing good AI prompts

- **Be specific about levels**: Don't just say "beginner" — describe exactly what vocabulary and grammar is appropriate (e.g., "present tense only, common verbs, no subjunctive")
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
- TTS is especially important — make sure the browser has voices for your language
