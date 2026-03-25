# Koe (声) — AI-Powered Language Learning

An open-source, AI-powered language learning app that takes you from beginner to fluency. Built for serious learners who are tired of juggling 5 different apps.

**Currently supports**: Japanese, Spanish, Brazilian Portuguese

## Why Koe?

Most language apps are great at getting you started (A1-A2) but abandon you at the intermediate plateau. Koe is designed to carry you from zero through to real fluency by combining the best evidence-based methods:

- **FSRS Spaced Repetition** — State-of-the-art algorithm that adapts to your memory patterns, reducing reviews by 20-30% vs traditional SRS
- **AI Conversation Partner** — Practice speaking with an AI that adapts to your level, corrects mistakes inline, and never judges you
- **Graded Reader** — AI-generated reading content at exactly your comprehension level with inline word lookup and audio
- **Grammar on Demand** — Grammar explanations when you need them, not front-loaded textbook style
- **Honest Progress Tracking** — Know what you can actually do, not just how many days you've logged in

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Neon Postgres](https://neon.tech/) (serverless)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/) with dual provider support:
  - **Cloud**: Vercel AI Gateway (OpenAI, Anthropic, Google, etc.)
  - **Local**: [Ollama](https://ollama.ai/) (run models on your own GPU — no API costs)
- **SRS**: [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) (FSRS algorithm)
- **ORM**: [Drizzle](https://orm.drizzle.team/)

## Features

### MVP (In Progress)

- [x] FSRS-powered vocabulary flashcards with context sentences and audio
- [x] AI conversation partner (cloud + local model support)
- [x] Graded reading engine with inline glossing and streaming
- [x] Multi-language support (Japanese, Spanish, Brazilian Portuguese)
- [x] Dashboard with real-time progress tracking
- [x] Grammar explanations on demand via AI
- [x] Writing practice with AI correction
- [x] Mobile PWA (installable on phones)
- [x] Romaji display for Japanese flashcards
- [x] Text-to-speech for pronunciation
- [x] Anki deck import (CSV/TSV with field mapping)
- [x] Conversation history and persistence
- [x] Content difficulty grading tool
- [x] Shadowing mode (listen → record → compare)
- [x] Kanji radical learning system (20 N5 kanji)
- [x] Spanish-Portuguese cognate system with false friend warnings

- [x] Pitch accent training with visual diagrams (Japanese)

### Community Contributions Welcome

- [ ] French language support ([see guide](docs/adding-a-language.md))

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Neon](https://neon.tech/) account (free tier works) or local Postgres

### AI Provider Setup (choose one or both)

**Option A: Local models with Ollama (free, private, requires GPU)**

1. Install [Ollama](https://ollama.ai/)
2. Pull a model: `ollama pull qwen3.5:9b` (fits in 16GB+ VRAM, fast responses)
3. Ollama runs on `http://localhost:11434` by default
4. For higher quality with 32GB+ VRAM: `ollama pull qwen3.5:27b` and set `OLLAMA_CHAT_MODEL=qwen3.5:27b` in `.env.local`

**Option B: Cloud models via Vercel AI Gateway**

1. Create a [Vercel](https://vercel.com/) project
2. Enable AI Gateway in the Vercel dashboard
3. Run `vercel link && vercel env pull` to get OIDC credentials

### Installation

```bash
# Clone the repo
git clone https://github.com/JesseRWeigel/koe.git
cd koe

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database URL and AI provider settings

# Set up the database
pnpm db:push

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start learning.

### Environment Variables

```bash
# Database (required)
DATABASE_URL="postgresql://..."

# AI Provider - Local (Ollama)
OLLAMA_BASE_URL="http://localhost:11434"  # Default Ollama URL
DEFAULT_AI_PROVIDER="ollama"              # or "gateway" for cloud

# AI Provider - Cloud (Vercel AI Gateway)
# These are auto-provisioned by `vercel env pull`
# VERCEL_OIDC_TOKEN is managed automatically

# Text-to-Speech (optional, for pronunciation)
ELEVENLABS_API_KEY="..."                  # Optional, browser TTS used as fallback
```

## Architecture

```
koe/
├── app/                    # Next.js App Router pages
│   ├── (app)/              # Authenticated app routes
│   │   ├── dashboard/      # Progress overview
│   │   ├── review/         # SRS review session
│   │   ├── chat/           # AI conversation partner
│   │   ├── read/           # Graded reader
│   │   ├── vocabulary/     # Word management
│   │   └── writing/        # AI writing practice
│   └── api/                # API routes
│       ├── chat/           # AI chat endpoint
│       ├── tts/            # Text-to-speech
│       ├── content/        # Content generation
│       └── writing/        # Writing correction
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Feature components
├── lib/
│   ├── ai/                 # AI provider abstraction (cloud + local)
│   ├── srs/                # FSRS engine wrapper
│   ├── db/                 # Database schema and queries
│   └── languages/          # Language-specific logic (tokenizers, etc.)
├── research/               # Research documents that informed the design
└── docs/                   # Additional documentation
```

## Research

This project was designed based on extensive research into language acquisition science, existing apps, and software architecture. See the [`research/`](./research/) directory for detailed findings:

- [Language Acquisition Science](./research/language-acquisition-science.md) — Krashen, SRS, immersion, time estimates
- [Existing Apps Analysis](./research/existing-apps-analysis.md) — What works, what's missing
- [Japanese Learning Guide](./research/japanese-learning-guide.md) — Writing systems, grammar, JLPT, immersion
- [Spanish & Portuguese Guide](./research/spanish-portuguese-guide.md) — Travel Spanish, workplace Portuguese
- [Software Architecture](./research/software-architecture-ideas.md) — FSRS algorithms, AI pipeline, data sources
- [Synthesis](./research/SYNTHESIS.md) — Key findings distilled

## Contributing

This is a personal project but contributions are welcome. Check the [Issues](https://github.com/JesseRWeigel/koe/issues) for what needs doing — MVP issues are tagged with the `mvp` label.

## License

MIT
