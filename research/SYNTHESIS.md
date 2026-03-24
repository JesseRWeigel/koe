# Research Synthesis: AI-Powered Language Learning App

> Compiled from 5 parallel research tracks, March 2026

---

## The Opportunity

**The single biggest gap in language learning software is the "intermediate plateau"** — 75% of app users drop off before reaching intermediate level, and no app gracefully bridges B1→C1. Combine this with the fact that serious learners currently juggle 3-5 separate tools (Anki + WaniKani + Bunpro + Migaku + italki), and the opportunity becomes clear:

> **Build a unified, AI-powered platform that takes learners from zero to fluency — with special attention to the intermediate plateau that kills most learners.**

---

## What the Science Says Works

| Principle | Evidence | Software Implication |
|-----------|----------|---------------------|
| **Spaced Repetition** | 91.8% retention with SRS vs ~30% passive review (Karpicke & Roediger) | FSRS algorithm (`ts-fsrs` npm package) — 20-30% fewer reviews than SM-2 |
| **Comprehensible Input (i+1)** | 95-98% known words needed for acquisition (Nation 2006) | Track user's known vocabulary, generate/select content at exactly their level |
| **Active Recall** | 80% retention vs 30% for passive review | Every interaction requires production, not just recognition |
| **Output Practice** | Swain's Output Hypothesis — producing language forces deeper processing | AI conversation partner, writing exercises, shadowing |
| **Immersion at Scale** | Canadian programs show near-native comprehension with sustained exposure | Graded reading/listening engine with authentic content |
| **Habit Formation** | 66 days to form a habit (Lally et al.), not 21 | Anti-guilt design, tiny sessions, forgive lapses |

---

## 10 Market Gaps We Can Fill

1. **Intermediate Plateau** — No app bridges B1→C1 well
2. **Unified Tool Stack** — Learners juggle 3-5 apps; nobody does vocab + grammar + reading + speaking + writing
3. **True Adaptive Difficulty** — Most "adaptive" = simple right/wrong branching
4. **Output Practice** — AI conversation exists but feels scripted; writing practice barely exists
5. **Context-Rich Vocabulary** — Words taught in isolation, not in collocations/register/context
6. **Cultural/Pragmatic Competence** — No app teaches politeness levels, humor, when-to-say-what
7. **Pitch Accent / Prosody** — Critical for Japanese, no app trains it systematically
8. **Honest Proficiency Metrics** — Streaks ≠ ability; no app maps progress to real-world competence
9. **Content Difficulty Grading** — Can't filter Netflix/YouTube by language level
10. **Anti-Burnout Design** — Streaks cause guilt, energy systems punish mistakes

---

## Your Three Languages: Key Insights

### Japanese (Category V — 2,200 hours)
- **Writing systems first**: Kana in 2 weeks, then kanji via WaniKani-style radical→kanji→vocab progression
- **Grammar**: Genki textbook is the community default; supplement with Bunpro SRS
- **Immersion ramp-up**: After ~3 months of basics, start sentence mining from native content
- **Pitch accent**: Important but not urgent — introduce after N4 level
- **Recommended path**: Kana → Genki 1 → Kanji system + Core 2K vocab → Immersion + Genki 2 → Full immersion at N3

### Spanish (Category I — 600-750 hours)
- **Fastest path**: Language Transfer (free audio) + Dreaming Spanish (comprehensible input)
- **90-day sprint** can reach basic conversational level for travel
- **Key shortcuts**: 100-sentence method, shadowing, self-narration, learn filler words early
- **For your trip**: Focus on travel scenarios — ordering food, directions, small talk

### Brazilian Portuguese (Category I — 600-750 hours)
- **Spanish helps enormously**: 89% lexical similarity, only 100-200 extra hours if you know Spanish
- **Start after Spanish reaches B1** to avoid interference
- **Workplace focus**: Titles matter (Doutor/Doutora), punctuality is flexible, relationship-building is key
- **Watch for**: False cognates (Spanish→Portuguese), nasal vowels, the "ão" sound

### Multilingual Strategy
- **Recommended order**: Japanese (ongoing, long-term) → Spanish (intensive for trip) → Portuguese (after Spanish B1)
- **Time-box**: Different times of day for different languages
- **Don't mix Spanish/Portuguese** until Spanish is solid

---

## Recommended Technical Architecture

### Core Stack
- **Frontend**: Next.js (App Router) + shadcn/ui — web-first, PWA for mobile
- **SRS Engine**: FSRS via `ts-fsrs` — adaptive per-user scheduling
- **AI Backbone**: Vercel AI SDK + AI Gateway — conversation partner, content generation, grammar explanation
- **Database**: Neon Postgres — user data, vocabulary, progress, content
- **Audio**: ElevenLabs or Azure TTS for pronunciation, Whisper for speech-to-text

### Core Features (Priority Order)
1. **SRS Vocabulary System** — FSRS-powered flashcards with context sentences, audio, images
2. **AI Conversation Partner** — Unscripted dialogue at user's level with inline corrections
3. **Graded Reading Engine** — Content at 95% comprehension with inline glossing + audio
4. **Grammar on Demand** — AI explains grammar patterns when encountered, not front-loaded
5. **Progress Dashboard** — Honest proficiency mapping, not vanity metrics
6. **Shadowing Mode** — Listen → record → compare for pronunciation training
7. **Writing Practice** — AI-corrected free writing with explanations

### Gamification That Works (Research-Backed)
- Mastery levels tied to SRS retention (not streaks)
- Delayed rewards at 7/30-day intervals (not instant dopamine)
- "Can-do" statements showing real-world abilities unlocked
- Anti-burnout: no punishment for missed days, graceful review pile management

### Free Data Sources
- **Vocabulary**: wordfreq (40+ languages), TUBELEX (YouTube frequency)
- **Japanese**: JMdict, KANJIDIC, JLPT word lists, Core 2K/6K/10K
- **Spanish/Portuguese**: Corpus del Español, OpenSubtitles
- **Sentences**: Tatoeba (12M+ sentences, 400 languages)
- **Audio**: Forvo (pronunciation), TTS generation

---

## What Makes This Different from Duolingo

| | Duolingo | Our App |
|---|---------|---------|
| **Beginner focus** | Yes (drops off at B1) | Full journey to C1 |
| **SRS algorithm** | Proprietary, basic | FSRS (state of the art) |
| **AI conversation** | Scripted roleplay (Max only) | Unscripted, level-adaptive |
| **Content grading** | Pre-made lessons | Dynamic, any content |
| **Output practice** | Minimal | Writing + speaking + shadowing |
| **Honest metrics** | Streaks, XP | Proficiency mapping |
| **Multi-tool** | Vocab only | Vocab + grammar + reading + listening + speaking + writing |
| **Burnout design** | Energy system, guilt | Forgiveness-first, sustainable |

---

## Recommended Next Steps

1. **Decide scope**: Full platform vs. focused MVP (e.g., "AI conversation partner + SRS" only)
2. **Pick a name**
3. **Scaffold the project**: Next.js + shadcn/ui + Neon + AI SDK
4. **Build SRS engine first** — it's the backbone everything else depends on
5. **Add AI conversation** — highest differentiator
6. **Japanese first** — hardest language = most features needed = best foundation for others
