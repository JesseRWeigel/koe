import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  serial,
  integer,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";
import { LANGUAGE_CODES } from "@/lib/languages";

// Enum types
export const languageCodeEnum = pgEnum("language_code", LANGUAGE_CODES as [string, ...string[]]);
export const cardTypeEnum = pgEnum("card_type", [
  "recognition",
  "recall",
  "listening",
]);
export const cardStateEnum = pgEnum("card_state", [
  "new",
  "learning",
  "review",
  "relearning",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  settings: jsonb("settings"),
  nativeLanguage: text("native_language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Languages table
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: languageCodeEnum("code").notNull().unique(),
  name: text("name").notNull(),
});

// Vocabulary table
export const vocabulary = pgTable("vocabulary", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  languageId: integer("language_id")
    .notNull()
    .references(() => languages.id),
  word: text("word").notNull(),
  reading: text("reading"),
  meaning: text("meaning").notNull(),
  partOfSpeech: text("part_of_speech").notNull(),
  contextSentences: jsonb("context_sentences"),
  audioUrl: text("audio_url"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cards table
// fsrsState jsonb contains: stability, difficulty, elapsedDays, scheduledDays, reps, lapses, state, lastReview
export const cards = pgTable("cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  vocabularyId: uuid("vocabulary_id")
    .notNull()
    .references(() => vocabulary.id),
  cardType: cardTypeEnum("card_type").notNull(),
  fsrsState: jsonb("fsrs_state"),
  dueAt: timestamp("due_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id),
  rating: integer("rating").notNull(),
  reviewedAt: timestamp("reviewed_at").defaultNow().notNull(),
  elapsedMs: integer("elapsed_ms").notNull(),
  scheduledDays: real("scheduled_days").notNull(),
  stabilityAfter: real("stability_after").notNull(),
  difficultyAfter: real("difficulty_after").notNull(),
});

// Study Sessions table
export const studySessions = pgTable("study_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  languageId: integer("language_id")
    .notNull()
    .references(() => languages.id),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  cardsReviewed: integer("cards_reviewed").notNull().default(0),
  newCards: integer("new_cards").notNull().default(0),
});

// Grammar Points table
export const grammarPoints = pgTable("grammar_points", {
  id: uuid("id").defaultRandom().primaryKey(),
  languageId: integer("language_id")
    .notNull()
    .references(() => languages.id),
  title: text("title").notNull(),
  explanation: text("explanation").notNull(),
  level: text("level").notNull(),
  examples: jsonb("examples"),
});
