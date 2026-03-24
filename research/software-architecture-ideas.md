# AI-Powered Language Learning App: Software Architecture Research

> Research compiled March 2026. Covers core features, AI/LLM integration, SRS algorithms,
> technical stack, gamification, and data sources for Japanese/Spanish/Portuguese.

---

## Table of Contents

1. [Core Features](#1-core-features)
2. [AI/LLM Integration Opportunities](#2-aillm-integration-opportunities)
3. [SRS Algorithm Deep Dive](#3-srs-algorithm-deep-dive)
4. [Technical Stack Considerations](#4-technical-stack-considerations)
5. [Gamification That Actually Works](#5-gamification-that-actually-works)
6. [Data Sources](#6-data-sources)
7. [Sources](#sources)

---

## 1. Core Features

### 1.1 Spaced Repetition System (SRS)

The SRS is the backbone of any vocabulary acquisition system. Three algorithm options
are worth considering:

| Algorithm | Origin | Parameters | Adaptivity | Maturity |
|-----------|--------|-----------|------------|----------|
| SM-2 | SuperMemo (1987) | Ease factor per card | None (same formula for everyone) | Battle-tested, Anki default for 15+ years |
| FSRS | open-spaced-repetition (2022) | 19 trained weights | Learns per-user memory patterns | Default in Anki since 23.10, 99.6% superiority over SM-2 |
| Custom hybrid | -- | Configurable | Full control | Requires data collection and tuning |

**Recommendation**: Start with FSRS via the `ts-fsrs` npm package (official TypeScript
implementation). It reduces reviews by 20-30% compared to SM-2 while maintaining the
same retention. Fall back to SM-2 as a simpler baseline for new users who lack review
history for FSRS optimization.

### 1.2 AI Conversation Partner

An LLM-powered conversation partner is the highest-value differentiator over traditional
flashcard apps. Key requirements:

- **Unscripted dialogue**: Users converse freely on topics they choose, not pre-written
  scripts. The LLM maintains context across the conversation.
- **Level-appropriate language**: The system prompt constrains the LLM to use vocabulary
  and grammar at the user's current proficiency level (CEFR A1-C2 or JLPT N5-N1).
- **Inline corrections**: Grammar and vocabulary mistakes are corrected mid-conversation
  with brief explanations, not just flagged post-hoc.
- **Role-play scenarios**: "Order food at a restaurant," "Ask for directions," "Job
  interview" -- situational practice with appropriate register.
- **Voice mode**: Speech-to-text input, LLM response, text-to-speech output for a
  fully spoken conversation loop.

Current leaders: Langua (cloned native-speaker voices + grammar feedback), Univerbal
(YC-backed, unscripted LLM conversations), Enverson AI (real-time adaptive tutoring
across all four skills).

### 1.3 Comprehensible Input System

Based on Krashen's Input Hypothesis (i+1): learners acquire language most efficiently
when they understand 90-98% of the input, with the remaining 2-10% being new material
just beyond their current level.

**Implementation approach:**

1. **Graded reading engine**: Content tagged by vocabulary level and grammar complexity.
   The system selects or generates text where ~95% of words are known to the user
   (tracked via SRS data) and ~5% are new target vocabulary.
2. **Inline glossing**: Unknown words are highlighted and tappable for definition,
   pronunciation, and example sentences. Known words are left clean.
3. **Audio accompaniment**: Every text passage has native-speaker audio (TTS or
   pre-recorded) for simultaneous reading + listening practice.
4. **Difficulty auto-adjustment**: If the user looks up too many words (>10% of passage),
   the system drops down a level. If they look up almost none (<2%), it pushes up.
5. **Content types**: Short stories, news articles, dialogues, song lyrics, manga
   descriptions -- variety keeps engagement high.

A 2025 Frontiers in Education study confirmed that AI-generated graded reading materials
significantly improved oral proficiency in a 6-month intervention, consistent with
Krashen's hypothesis while also supporting scaffolding and cognitive load management.

### 1.4 Progress Tracking and Analytics

Users need visibility into their learning. Key metrics:

- **Known vocabulary count** (by language, by CEFR/JLPT level)
- **Retention rate** (% of reviews answered correctly, rolling 7/30/90 day)
- **Daily streak and study time**
- **Words due for review** (upcoming SRS schedule)
- **Skill breakdown**: Reading / Listening / Speaking / Writing proficiency estimates
- **Grammar points mastered** vs. in-progress
- **Comprehensible input stats**: Pages read, minutes listened, new words acquired
  through context

Visualization: Progress rings, heat-map calendars (GitHub-style), vocabulary growth
charts over time.

### 1.5 Multi-Language Support Architecture

The system must support adding new languages without architectural changes.

**Language-agnostic core:**
- SRS engine operates on abstract "cards" with front/back/audio/metadata
- Grammar rules and lesson content stored as structured data per language
- Tokenization and word boundary detection delegated to language-specific modules
  (critical for Japanese, which has no spaces)

**Language-specific modules:**
- Japanese: MeCab or Kuromoji for tokenization, furigana rendering, kanji stroke order
- Spanish/Portuguese: Verb conjugation engine, gender/number agreement rules
- Each language has its own frequency list, grammar database, and content library

**Data model:**
```
Language
  -> WordBank (frequency-ranked vocabulary)
  -> GrammarPoints (rules, examples, level)
  -> ContentLibrary (graded reading/listening)
  -> TTS voice configuration
  -> Tokenizer configuration
```

---

## 2. AI/LLM Integration Opportunities

### 2.1 Conversation Practice with Grammar Correction

**Architecture:**

```
User speech -> STT (Whisper/Deepgram) -> text
  -> LLM (system prompt: target language, user level, correction style)
  -> Response with inline corrections
  -> TTS (ElevenLabs/Azure) -> audio playback
```

**System prompt strategy:**

The LLM system prompt should include:
- User's current CEFR level and known vocabulary list (or summary)
- Instructions to stay in the target language (with L1 fallback option)
- Correction format: `[correction: "you said X, better: Y, because: Z"]`
- Conversation topic and register constraints
- Cultural context notes (formal vs. informal, regional variants)

**Model selection:**
- GPT-4o or Claude Sonnet for high-quality conversation and nuanced correction
- Smaller/local models (Qwen 3.5) for cost-sensitive or offline scenarios
- Context window of 128K+ tokens enables maintaining long conversation history

### 2.2 Dynamic Content Generation

LLMs can generate unlimited practice content at the exact right difficulty:

- **Stories**: "Write a 200-word story in Japanese using only N4 vocabulary and grammar,
  featuring the words [list of SRS words due for review]"
- **Cloze exercises**: Generate sentences with blanks for target vocabulary or grammar
- **Reading comprehension**: Generate a passage + questions at the user's level
- **Dialogue scripts**: Two-person conversations for specific scenarios
- **Grammar drills**: Exercises targeting the user's weakest grammar points

**Quality control**: LLM output must be validated. Options:
1. Second LLM pass to check for errors
2. Human review queue for generated content (crowdsourced)
3. User flagging system with rapid response

### 2.3 Pronunciation Feedback

**Pipeline:**

```
User speaks -> Record audio
  -> STT with word-level timestamps (Whisper/Deepgram)
  -> Compare transcription to expected text
  -> Phoneme-level analysis (Azure Pronunciation Assessment or ELSA API)
  -> LLM generates human-readable feedback
  -> Highlight problem sounds, suggest practice
```

**API options for pronunciation scoring:**

| Service | Phoneme Scoring | Languages | Pricing |
|---------|----------------|-----------|---------|
| Azure Pronunciation Assessment | Yes, detailed per-phoneme | 30+ languages | Included in Speech Services ($1/hr) |
| ELSA API | Yes, individual sounds + intonation + fluency | English-focused, expanding | Enterprise pricing |
| OpenAI Whisper + LLM analysis | Word-level only, no phoneme | 100+ languages | $0.006/min STT + LLM cost |
| Web Speech API (browser) | No scoring, just transcription | Varies by browser | Free |

**Recommendation**: Azure Pronunciation Assessment for phoneme-level feedback when
available for the target language. Whisper + LLM analysis as a fallback that works
for all languages.

### 2.4 Adaptive Difficulty

The system should continuously model the user's ability and adjust:

- **Vocabulary**: FSRS already handles per-word difficulty. Feed FSRS data into content
  generation to target words at the right retrievability threshold.
- **Grammar**: Track error rates per grammar point. Weight practice toward weak areas.
- **Reading level**: Adjust text complexity based on lookup rate and comprehension quiz
  scores.
- **Conversation**: LLM adjusts its language complexity based on user's demonstrated
  ability in the current session.
- **Speed**: Listening exercises adjust playback speed (0.75x -> 1.0x -> 1.25x) based
  on comprehension accuracy.

### 2.5 Translation with Explanation

Go beyond raw translation to teach *why*:

```
User input: "I ate sushi yesterday"
Output:
  Translation: "昨日寿司を食べました"
  Breakdown:
    昨日 (きのう) - yesterday [time word, goes first in Japanese]
    寿司 (すし) - sushi [object, marked with を]
    を - object particle [marks what was eaten]
    食べました (たべました) - ate [past polite form of 食べる]
  Grammar note: Japanese word order is SOV (Subject-Object-Verb),
  unlike English SVO. Time expressions typically come at the start.
```

LLMs excel at generating these breakdowns. The key is structured output (JSON) so
the UI can render each component with interactive elements (tap a word to add it to
SRS, tap grammar note to see the full lesson).

### 2.6 Example Sentence Generation

For every vocabulary word in the SRS, generate multiple example sentences:

- One at the user's current level (reinforcement)
- One slightly above (i+1 exposure)
- One from a real corpus (authentic usage, sourced from Tatoeba)
- One in a different context/meaning (polysemy awareness)

Cache generated sentences to avoid repeated LLM calls. Build a growing corpus of
level-tagged example sentences over time.

---

## 3. SRS Algorithm Deep Dive

### 3.1 SM-2 (SuperMemo 2) Algorithm

SM-2, created by Piotr Wozniak in 1987, is the algorithm Anki used as its default
for over 15 years.

**Core concept**: Each card has an "ease factor" (EF) that determines how quickly
intervals grow. Easier cards get longer intervals; harder cards get shorter ones.

**The algorithm:**

1. **Initial values**: EF = 2.5, repetitions = 0, interval = 0
2. **Quality rating**: User rates recall from 0-5
   - 5: Perfect recall
   - 4: Correct after hesitation
   - 3: Correct with serious difficulty
   - 2: Incorrect, but correct answer seemed easy
   - 1: Incorrect, correct answer remembered
   - 0: Complete blackout
3. **If quality >= 3** (correct):
   - If repetitions == 0: interval = 1 day
   - If repetitions == 1: interval = 6 days
   - If repetitions >= 2: interval = previous_interval * EF
   - repetitions += 1
4. **If quality < 3** (incorrect):
   - repetitions = 0
   - interval = 1 day
   - EF unchanged
5. **Update EF**:
   ```
   EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
   ```
   Minimum EF = 1.3

**Pros:**
- Dead simple to implement (~50 lines of code)
- Battle-tested over decades
- No training data needed
- Deterministic and predictable

**Cons:**
- Same formula for everyone -- doesn't adapt to individual memory patterns
- Ease factor can spiral into "ease hell" (cards get stuck at EF 1.3)
- No concept of forgetting curve or retrievability
- Interval growth is purely multiplicative, can't model complex memory dynamics
- Anki's modified version diverged significantly from original SM-2

### 3.2 FSRS (Free Spaced Repetition Scheduler)

FSRS was created by Jarrett Ye (Expertium) starting in 2022, using machine learning
trained on 700 million reviews from 20,000 users. It became Anki's default scheduler
in version 23.10 (late 2023).

**Core concept**: Three-variable DSR model:
- **Difficulty (D)**: How hard the card is to remember (1.0 = easiest, 10.0 = hardest)
- **Stability (S)**: Time in days for retrievability to drop from 100% to 90%
- **Retrievability (R)**: Current probability of successful recall (0.0 to 1.0)

**Key formulas:**

**Retrievability decay** (power forgetting curve):
```
R(t) = (1 + F * t/S)^C
```
Where t = days since last review, S = stability, F and C are trained constants.
At t=0: R = 1.0 (just reviewed). At t=S: R = 0.9 (by definition of stability).

**Stability after successful recall:**
```
S' = S * (1 + e^(w8) * (11 - D) * S^(-w9) * (e^((1-R) * w10) - 1) * hard_penalty * easy_bonus)
```
Key properties of this formula:
- Easier cards (lower D) gain more stability per review
- Higher current stability makes further stability gains harder (diminishing returns)
- Lower retrievability at time of review = bigger stability gain (spacing effect)

**Stability after failure (lapse):**
```
S' = w11 * D^(-w12) * ((S+1)^w13 - 1) * e^(w14 * (1-R))
```

**Difficulty update:**
```
D' = w7 * D_init(3) + (1 - w7) * mean_revert(D + delta_D * (rating))
```

**Parameters**: 19 floating-point weights (w[0] through w[18]) that control all
scheduling behavior. These can be:
- **Default**: Pre-trained on aggregate data, works well out of the box
- **Optimized**: Trained on an individual user's review history for personalized scheduling
- **Per-deck**: Different parameters for different types of content

**Comparison to SM-2:**

| Aspect | SM-2 | FSRS |
|--------|------|------|
| Personalization | None | Learns from your review history |
| Memory model | None (just EF multiplier) | Explicit forgetting curve (DSR) |
| Reviews needed | Baseline | 20-30% fewer for same retention |
| Parameters | 1 per card (EF) | 19 global + 3 per card (D, S, R) |
| Training data needed | None | ~1000 reviews for good optimization |
| Accuracy (log loss) | Baseline | 99.6% of users see improvement |
| Implementation complexity | ~50 lines | ~200 lines (or use ts-fsrs) |

### 3.3 Custom Scheduling for Our App

**Recommended approach: FSRS with language-learning extensions.**

Extensions beyond vanilla FSRS:

1. **Receptive vs. productive tracking**: A word has two cards -- recognition
   (JP -> EN) and production (EN -> JP). These have independent SRS states but
   linked metadata. Production is always harder; its difficulty should start higher.

2. **Context-dependent recall**: Track whether a word was recalled in isolation
   (flashcard), in reading (comprehensible input), or in conversation. Weight
   conversation recall higher for stability updates.

3. **Related word clustering**: Kanji components, verb conjugation families, and
   cognates should influence each other's scheduling. Learning 食べる should partially
   reinforce 食べ物 and 食事.

4. **Leech detection**: Cards that fail repeatedly (>8 lapses) are flagged for
   intervention -- different format, mnemonic suggestion, or different example sentence.

5. **New user cold start**: Use SM-2 or default FSRS parameters for the first ~500
   reviews, then switch to optimized FSRS once enough data exists.

**TypeScript implementation:**

```typescript
// Using the official ts-fsrs package
import { FSRS, generatorParameters, Card, Rating } from 'ts-fsrs';

// Initialize with default or user-optimized parameters
const params = generatorParameters({
  request_retention: 0.9,  // Target 90% retention
  maximum_interval: 365,   // Cap at 1 year
  // w: [...] // Optional: user-optimized weights
});

const fsrs = new FSRS(params);

// Schedule a review
const card = new Card(); // New card
const scheduling = fsrs.repeat(card, new Date());

// Get the next review date for each possible rating
const again = scheduling[Rating.Again]; // Failed recall
const hard  = scheduling[Rating.Hard];  // Difficult recall
const good  = scheduling[Rating.Good];  // Successful recall
const easy  = scheduling[Rating.Easy];  // Effortless recall
```

---

## 4. Technical Stack Considerations

### 4.1 Platform Strategy: Web + PWA + Mobile

**Recommended: Next.js web app with PWA capabilities, then React Native for mobile.**

| Approach | Pros | Cons |
|----------|------|------|
| Next.js only | Single codebase, fast dev, SSR for SEO | No app store presence, limited device APIs |
| Next.js + PWA | Offline support, installable, push notifications | iOS PWA limitations (no background sync) |
| React Native | Native feel, app store, full device access | Separate codebase, slower iteration |
| Next.js + Capacitor | Web codebase in native shell | Performance compromise, plugin ecosystem |

**Phase 1**: Next.js 15 + PWA (service worker for offline, IndexedDB for local data).
This gets an MVP out fast with full SRS, reading, and conversation features.

**Phase 2**: React Native app sharing the core logic (SRS engine, API clients) as a
shared TypeScript package.

**Key Next.js architecture decisions:**
- App Router (not Pages Router)
- Server Components for content-heavy pages (reading library, grammar lessons)
- Client Components for interactive features (flashcards, conversation)
- API Routes for LLM proxy, TTS proxy, auth
- Edge Runtime for low-latency API routes (SRS calculations, session management)

### 4.2 Database Schema

**PostgreSQL via Prisma ORM.**

```prisma
// Core user model
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  createdAt     DateTime @default(now())

  // Learning preferences
  nativeLanguage   String   @default("en")
  targetLanguages  UserLanguage[]
  dailyGoalMinutes Int      @default(15)

  // Relations
  cards         Card[]
  reviews       Review[]
  sessions      StudySession[]
  progress      LanguageProgress[]
}

// Per-language progress
model UserLanguage {
  id          String @id @default(cuid())
  userId      String
  user        User   @relation(fields: [userId], references: [id])
  language    String // "ja", "es", "pt"
  cefrLevel   String @default("A1") // A1-C2
  startedAt   DateTime @default(now())

  @@unique([userId, language])
}

// SRS Card (one per word/grammar point per direction)
model Card {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])

  // Content
  language      String
  type          String   // "vocabulary", "grammar", "kanji"
  direction     String   // "receptive" (L2->L1), "productive" (L1->L2)
  front         String   // Question/prompt
  back          String   // Answer
  audioUrl      String?  // TTS audio URL

  // FSRS state
  difficulty    Float    @default(5.0)  // D: 1.0-10.0
  stability     Float    @default(0.0)  // S: days
  retrievability Float   @default(1.0)  // R: 0.0-1.0
  state         Int      @default(0)    // 0=New, 1=Learning, 2=Review, 3=Relearning
  due           DateTime @default(now())
  lastReview    DateTime?
  lapses        Int      @default(0)
  reps          Int      @default(0)

  // Metadata
  wordId        String?  // FK to vocabulary bank
  grammarId     String?  // FK to grammar point
  tags          String[] // ["JLPT-N4", "food", "verbs"]

  reviews       Review[]
  createdAt     DateTime @default(now())

  @@index([userId, language, due])
  @@index([userId, state])
}

// Individual review log (for FSRS optimization)
model Review {
  id          String   @id @default(cuid())
  cardId      String
  card        Card     @relation(fields: [cardId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  rating      Int      // 1=Again, 2=Hard, 3=Good, 4=Easy
  reviewedAt  DateTime @default(now())
  timeMs      Int      // Response time in milliseconds

  // FSRS state snapshot (for optimizer training)
  difficulty  Float
  stability   Float
  retrievability Float
  interval    Float    // Scheduled interval in days

  // Context
  context     String   // "flashcard", "reading", "conversation", "exercise"

  @@index([userId, reviewedAt])
  @@index([cardId, reviewedAt])
}

// Vocabulary bank (shared across users)
model Vocabulary {
  id            String   @id @default(cuid())
  language      String
  word          String
  reading       String?  // Furigana for Japanese
  meanings      Json     // [{pos: "noun", defs: ["food", "meal"]}]
  frequency     Int?     // Frequency rank
  level         String?  // "JLPT-N4", "CEFR-A2"
  audioUrl      String?
  exampleSentences Json? // [{text, translation, audio}]

  @@unique([language, word])
  @@index([language, frequency])
  @@index([language, level])
}

// Grammar points
model GrammarPoint {
  id            String @id @default(cuid())
  language      String
  title         String // "て-form", "Subjunctive"
  level         String // "JLPT-N4", "CEFR-B1"
  explanation   Json   // {summary, detailed, examples}
  conjugations  Json?  // For verb/adjective patterns

  @@index([language, level])
}

// Study sessions for analytics
model StudySession {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  language    String
  type        String   // "srs", "reading", "conversation", "listening"
  startedAt   DateTime @default(now())
  endedAt     DateTime?

  // Metrics
  cardsReviewed Int    @default(0)
  newCards      Int    @default(0)
  correctRate   Float?
  wordsRead     Int    @default(0)
  minutesSpoken Float  @default(0)
}

// Graded content library
model Content {
  id          String @id @default(cuid())
  language    String
  type        String // "story", "article", "dialogue"
  title       String
  body        String
  audioUrl    String?
  level       String // CEFR/JLPT level
  vocabLevel  Json   // {knownWordPercent: 0.95, unknownWords: ["word1", "word2"]}
  source      String // "generated", "curated", "tatoeba"

  @@index([language, level])
}
```

### 4.3 Audio / TTS Integration

**Comparison of TTS providers for language learning:**

| Provider | Languages | Quality | Latency | Pricing | Best For |
|----------|-----------|---------|---------|---------|----------|
| ElevenLabs | 70+ (incl. JA, ES, PT) | Excellent, near-human | ~75ms (Flash v2.5) | $5-330/mo subscription | High-quality conversation voice |
| Azure Neural TTS | 140+ languages/locales | Very good | ~100ms | 500K chars/mo free, then $4/1M chars | Broadest language coverage, pronunciation assessment bundle |
| Google Cloud TTS | 50+ | Good | ~150ms | 4M chars/mo free (standard), $4-16/1M chars (neural) | Budget option with decent quality |
| OpenAI TTS | ~50 | Good | ~200ms | $15/1M chars (tts-1), $30/1M chars (tts-1-hd) | If already using OpenAI for LLM |
| Browser SpeechSynthesis | Varies by OS | Poor-Acceptable | Instant | Free | Offline fallback only |

**Recommendation:**
- **Primary**: Azure Neural TTS -- best language coverage, includes pronunciation
  assessment, generous free tier, predictable per-character pricing.
- **Premium voice**: ElevenLabs for conversation partner voice (more natural, but higher cost).
- **Offline fallback**: Browser SpeechSynthesis API for basic functionality when offline.
- **Pre-generate**: Cache TTS audio for all vocabulary words and common sentences.
  Only use real-time TTS for dynamic content (AI conversations, generated exercises).

### 4.4 Speech Recognition for Speaking Practice

**Options:**

| Service | Word Timestamps | Phoneme Analysis | Languages | Cost |
|---------|----------------|-----------------|-----------|------|
| OpenAI Whisper API | Yes | No | 100+ | $0.006/min (cheapest) |
| gpt-4o-mini-transcribe | Yes | No | 100+ | ~$0.01/min |
| Deepgram Nova-3 | Yes | No | 40+ | $0.0043/min |
| Azure Speech-to-Text | Yes | Yes (Pronunciation Assessment) | 30+ | $1/hr |
| Web Speech API (browser) | No | No | Varies | Free |

**Recommended architecture:**

```
[Browser] Web Speech API for real-time interim results (free, instant feedback)
    |
    v
[Server] Whisper/Deepgram for accurate final transcription
    |
    v
[Server] Azure Pronunciation Assessment for phoneme-level scoring (if supported for language)
    |
    v
[LLM] Generate human-readable pronunciation feedback
    |
    v
[Client] Display results with highlighted problem areas
```

For Japanese specifically, accurate speech recognition is critical because pitch accent
and vowel length are phonemic. Azure and Whisper both support Japanese well.

### 4.5 Offline Capability

**Architecture: PWA with IndexedDB + Background Sync.**

**What must work offline:**
- SRS flashcard reviews (highest priority -- this is the daily habit)
- Reading previously downloaded content
- Viewing vocabulary and grammar reference
- Reviewing conversation history

**What requires network:**
- AI conversation partner (LLM API calls)
- New content generation
- Speech recognition (server-side)
- TTS for new content (pre-cached content works offline)
- FSRS parameter optimization

**Implementation:**

```
Service Worker
  ├── Cache-first: App shell, static assets, UI
  ├── Network-first: API responses, user data sync
  └── Stale-while-revalidate: Content library, vocabulary data

IndexedDB (via Dexie.js or idb)
  ├── cards: Full SRS card state for offline reviews
  ├── reviews: Queued reviews to sync when online
  ├── vocabulary: Downloaded vocabulary data
  ├── content: Downloaded reading material
  └── audio: Cached TTS audio blobs

Background Sync
  └── On reconnect: Push queued reviews, pull updated SRS state,
      download new content
```

**Storage budget:** A complete JLPT N5-N1 vocabulary set (~10,000 words) with audio
is roughly 50-100MB. IndexedDB can handle this easily (browsers allow 50%+ of disk).

---

## 5. Gamification That Actually Works

Research shows a critical distinction: **engagement gamification vs. retention
gamification**. The University of Colorado found gamified training increased engagement
by 60% but knowledge retention only improved by 9%. The goal is to align game
mechanics with actual learning outcomes.

### 5.1 Mechanics That Improve Retention

These game elements are directly tied to learning behavior:

**Mastery levels per word/grammar point:**
Map SRS states to visible progression: New -> Learning -> Familiar -> Strong -> Mastered.
This transforms the invisible cognitive process of memory consolidation into a tangible,
visible game. Users can see individual words "level up" as stability increases.

**Delayed rewards aligned with SRS:**
Award the biggest point bonuses when a user successfully recalls a card at the 7-day
and 30-day review intervals. This trains the brain to associate long-term retention
with reward, not just short-term cramming.

**Retention-based leaderboards:**
Rank users by "knowledge retained after 30 days" rather than "cards reviewed today."
Research shows this shifts learner behavior -- when the ranked metric is retention,
users naturally adopt better study habits (proper rating, consistent reviews).

**Streak with forgiveness:**
Start with a low threshold (3-day streak challenge). Include a "streak freeze" mechanic
(1-2 per week) to prevent streak anxiety from causing app abandonment. Duolingo's
data shows streaks are their single most effective retention mechanic, but streak
loss is also the #1 reason users quit permanently.

**Unlockable content:**
Reaching vocabulary milestones (100 words, 500 words, etc.) unlocks new reading
content, conversation topics, or cultural lessons. This ties engagement directly
to learning progress.

### 5.2 Mechanics That Drive Engagement (Use Carefully)

These increase app opens but do not directly improve retention:

| Mechanic | Effect | Risk | Recommendation |
|----------|--------|------|----------------|
| Daily XP | Increases session frequency | Users rush through reviews for points | Cap XP per session, weight by accuracy |
| Leaderboards (activity-based) | Social motivation | Anxiety, gaming the system | Make opt-in, use retention metrics |
| Badges/achievements | Completionist motivation | Hollow once collected | Tie to meaningful milestones only |
| Hearts/lives system | Creates stakes | Punishes experimentation, causes anxiety | Avoid for language learning |
| Competitive leagues | Recurring engagement | Stressful, rewards volume over quality | Make opt-in, separate from core loop |

### 5.3 Recommended Gamification System

```
Core loop (daily):
  1. Review due SRS cards -> earn XP weighted by card difficulty and interval length
  2. Learn new words/grammar -> earn XP for first successful review
  3. Read/listen to content -> earn XP per minute of engaged time
  4. Conversation practice -> earn XP per exchange, bonus for corrections applied

Progression:
  - Per-word mastery levels (visible on every card)
  - Overall language level (e.g., "Level 12 - Intermediate Adventurer")
  - Vocabulary milestones (100, 250, 500, 1000, 2500, 5000, 10000)
  - Streak counter with freeze mechanic
  - Monthly retention score (% of mature cards retained)

Social (opt-in):
  - Study groups (shared vocabulary lists, group challenges)
  - Retention leaderboard (not activity leaderboard)
  - Share milestones to social media
```

---

## 6. Data Sources

### 6.1 Word Frequency Lists

| Source | Languages | Format | License | Notes |
|--------|-----------|--------|---------|-------|
| [wordfreq](https://github.com/rspeer/wordfreq) | 40+ including JA, ES, PT | Python library | MIT | Aggregates multiple sources, frequency ranks per word |
| [TUBELEX](https://github.com/naist-nlp/tubelex) | JA, ES, EN, ZH, ID | TSV files | CC-BY | YouTube subtitle corpus, approximates everyday spoken language |
| [Wiktionary Frequency Lists](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists) | JA, ES, PT + many more | Wiki pages, downloadable | CC-BY-SA | Leeds University corpus-derived, multiple languages |
| [Corpus del Espanol](https://www.corpusdelespanol.org/) | ES | Online + downloadable | Academic | 10 billion words, dialect/genre/historical variants |

### 6.2 Vocabulary and Dictionary Databases

| Source | Language | Content | License | Notes |
|--------|----------|---------|---------|-------|
| [JMdict/EDICT](https://www.edrdg.org/jmdict/j_jmdict.html) | JA-EN | 200K+ entries, readings, PoS, meanings | CC-BY-SA | Standard Japanese-English dictionary, daily updates |
| [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) | JA | 13,000+ kanji, readings, meanings, stroke count, frequency | CC-BY-SA | Includes frequency rank (1-2500 from newspaper survey) |
| [JLPT vocabulary lists](https://www.tanos.co.uk/jlpt/) | JA | N5-N1 word lists + MP3 audio | Free | Community-maintained, includes audio files |
| [Wiktionary (machine-readable)](https://en.wiktionary.org/) | ES, PT, JA, all | Definitions, etymology, conjugations, audio | CC-BY-SA | Use [Wiktextract](https://github.com/tatuylonen/wiktextract) for structured JSON |

### 6.3 Example Sentences

| Source | Languages | Size | License | Notes |
|--------|-----------|------|---------|-------|
| [Tatoeba](https://tatoeba.org/en/downloads) | 400+ languages | 12M+ sentences | CC-BY | Downloadable sentence pairs with translations, community-maintained |
| [Massif](https://massif.la/) | JA | Millions | Web scrape | Japanese example sentences from real sources, searchable by word |
| Tatoeba JSON (JA) | JA-EN | JMdict-linked | CC-BY | [Pre-processed JSON format](https://github.com/mwhirls/tatoeba-json) |
| LLM-generated | Any | Unlimited | Self-owned | Generate with GPT-4o/Claude, validate, cache. Level-tagged by design |

### 6.4 Grammar Databases

| Source | Language | Content | Notes |
|--------|----------|---------|-------|
| [Tae Kim's Grammar Guide](https://guidetojapanese.org/) | JA | Complete grammar reference | CC-BY-SA, well-structured by level |
| [JLPT Sensei](https://jlptsensei.com/) | JA | Grammar by JLPT level with examples | Web resource, would need licensing |
| [SpanishDict](https://www.spanishdict.com/guide) | ES | Comprehensive grammar reference | Proprietary, use as reference only |
| [Conjugation tables (Verbix)](https://www.verbix.com/) | ES, PT, 100+ | Verb conjugation data | API available |
| LLM-generated | Any | Grammar explanations, drills | Generate structured grammar lessons per point |

### 6.5 Audio and Pronunciation

| Source | Language | Content | Notes |
|--------|----------|---------|-------|
| [Forvo](https://forvo.com/) | All major | Native speaker pronunciations | API available (paid), community recordings |
| JLPT Tanos MP3s | JA | N5-N1 vocabulary audio | Free download |
| TTS-generated | Any | Unlimited | Generate with Azure/ElevenLabs, cache per word |
| [Mozilla Common Voice](https://commonvoice.mozilla.org/) | 100+ | Crowd-sourced speech recordings | CC-0, useful for training custom models |

### 6.6 Recommended Data Pipeline

```
1. Bootstrap vocabulary:
   - JMdict (JA), Wiktionary (ES, PT) -> parse into Vocabulary table
   - wordfreq -> assign frequency ranks
   - JLPT lists -> assign levels (JA)
   - CEFR word lists -> assign levels (ES, PT)

2. Example sentences:
   - Tatoeba corpus -> filter by quality, link to vocabulary
   - LLM generation -> fill gaps, create level-appropriate examples
   - User-contributed -> community review pipeline

3. Audio:
   - Pre-generate TTS for all vocabulary words (Azure Neural, ~$4/1M chars)
   - ~10,000 words * ~10 chars avg = ~100K chars = well within free tier per language
   - Cache as MP3/OGG in object storage (S3/R2)

4. Grammar:
   - Curate from open-source guides (Tae Kim for JA)
   - Structure as JSON with examples and exercises
   - LLM-generate additional drills per grammar point

5. Reading content:
   - Seed with public domain texts, graded readers
   - LLM-generate stories/articles per level (cache and curate)
   - User-submitted content with community review
```

---

## Sources

### SRS Algorithms
- [FSRS vs SM-2 Guide (MemoForge)](https://memoforge.app/blog/fsrs-vs-sm2-anki-algorithm-guide-2025/)
- [FSRS Algorithm Technical Explanation (Expertium)](https://expertium.github.io/Algorithm.html)
- [FSRS Algorithm Wiki (open-spaced-repetition)](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm)
- [Implementing FSRS in 100 Lines (Borretti)](https://borretti.me/article/implementing-fsrs-in-100-lines)
- [ts-fsrs TypeScript Implementation](https://github.com/open-spaced-repetition/ts-fsrs)
- [simple-ts-fsrs Minimal Implementation](https://github.com/AustinShelby/simple-ts-fsrs)
- [SM-2 Algorithm Original (SuperMemo)](https://super-memory.com/english/ol/sm2.htm)
- [What Algorithm Does Anki Use? (Anki FAQ)](https://faqs.ankiweb.net/what-spaced-repetition-algorithm)
- [FSRS Benchmark Results (Expertium)](https://expertium.github.io/Benchmark.html)

### AI Language Learning Apps
- [Best AI Language Learning Apps 2026 (LanguaTalk)](https://languatalk.com/blog/whats-the-best-ai-for-language-learning/)
- [Top AI Language Learning Apps 2026 (Enverson)](https://www.enverson.com/top-6-ai-based-language-learning-apps-2026)
- [How to Build an AI Language Learning App (Sapient)](https://sapient.pro/blog/how-to-build-ai-based-language-learning-app)
- [Univerbal AI Conversation Tutor (YC)](https://www.ycombinator.com/companies/univerbal)

### Comprehensible Input
- [95-98% Comprehensibility Research (Conti)](https://gianfrancoconti.com/2025/02/27/why-the-input-we-give-our-learners-must-be-95-98-comprehensible-in-order-to-enhance-language-acquisition-the-theory-and-the-research-evidence/)
- [Testing Krashen's Input Hypothesis with AI (Frontiers in Education 2025)](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1614680/full)
- [Comprehensible Input Method (Migaku)](https://migaku.com/blog/language-fun/comprehensible-input-method-language-learning)
- [Comprehensible Input Wiki](https://comprehensibleinputwiki.org/wiki/Main_Page)

### Speech and TTS
- [Best TTS APIs 2026 (Speechmatics)](https://www.speechmatics.com/company/articles-and-news/best-tts-apis-in-2025-top-12-text-to-speech-services-for-developers)
- [Best Speech-to-Text APIs 2026 (Deepgram)](https://deepgram.com/learn/best-speech-to-text-apis-2026)
- [TTS Comparison for Language Apps 2026 (DEV Community)](https://dev.to/pocket_linguist/text-to-speech-in-2026-comparing-5-tts-apis-for-language-apps-606)
- [ELSA Pronunciation API](https://elsaspeak.com/en/elsa-api/)
- [Azure Pronunciation Assessment](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/pronunciation-assessment-tool)
- [OpenAI Whisper](https://openai.com/index/whisper/)

### Gamification Research
- [Gamification Mechanics on Vocabulary Retention: Systematic Review 2021-2025 (IJRISS)](https://rsisinternational.org/journals/ijriss/article.php?id=4935)
- [Spaced Repetition with Gamification for Retention (eLearning Industry)](https://elearningindustry.com/the-learning-retention-formula)
- [The Dark Side of Gamification (Growth Engineering)](https://www.growthengineering.co.uk/dark-side-of-gamification/)
- [Gamification Effectiveness Review (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10135444/)
- [Duolingo Gamification Case Study 2025](https://www.youngurbanproject.com/duolingo-case-study/)

### Data Sources
- [wordfreq Python Library (GitHub)](https://github.com/rspeer/wordfreq)
- [TUBELEX YouTube Subtitle Corpus](https://github.com/naist-nlp/tubelex)
- [Tatoeba Sentence Database](https://tatoeba.org/en/downloads)
- [JMdict / KANJIDIC (EDRDG)](https://www.edrdg.org/jmdict/j_jmdict.html)
- [JLPT Vocabulary Resources (Tanos)](https://www.tanos.co.uk/jlpt/)
- [Wiktionary Frequency Lists](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists)
- [Corpus del Espanol](https://www.corpusdelespanol.org/)

### Technical Stack
- [Next.js + Prisma + Postgres Guide (Vercel)](https://vercel.com/kb/guide/nextjs-prisma-postgres)
- [PWA Offline Data (web.dev)](https://web.dev/learn/pwa/offline-data)
- [Full Stack Language Learning App (DEV Community)](https://dev.to/nadim_ch0wdhury/develop-full-stack-language-learning-app-in-next-js-nest-js-2l94)
