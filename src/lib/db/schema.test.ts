import { describe, expect, test } from "vitest";
import { getTableColumns } from "drizzle-orm";
import {
  users,
  languages,
  vocabulary,
  cards,
  reviews,
  studySessions,
  grammarPoints,
  cardTypeEnum,
  cardStateEnum,
  languageCodeEnum,
} from "./schema";

describe("enum types", () => {
  test("cardTypeEnum has recognition, recall, listening", () => {
    expect(cardTypeEnum.enumValues).toEqual([
      "recognition",
      "recall",
      "listening",
    ]);
  });

  test("cardStateEnum has new, learning, review, relearning", () => {
    expect(cardStateEnum.enumValues).toEqual([
      "new",
      "learning",
      "review",
      "relearning",
    ]);
  });

  test("languageCodeEnum has ja, es, pt-BR", () => {
    expect(languageCodeEnum.enumValues).toEqual(["ja", "es", "pt-BR", "fr"]);
  });
});

describe("users table", () => {
  test("has required columns", () => {
    const cols = getTableColumns(users);
    expect(cols.id).toBeDefined();
    expect(cols.name).toBeDefined();
    expect(cols.settings).toBeDefined();
    expect(cols.nativeLanguage).toBeDefined();
    expect(cols.createdAt).toBeDefined();
  });

  test("id is uuid primary key", () => {
    const cols = getTableColumns(users);
    expect(cols.id.dataType).toBe("string");
    expect(cols.id.columnType).toBe("PgUUID");
    expect(cols.id.primary).toBe(true);
  });

  test("settings is jsonb", () => {
    const cols = getTableColumns(users);
    expect(cols.settings.columnType).toBe("PgJsonb");
  });
});

describe("languages table", () => {
  test("has required columns", () => {
    const cols = getTableColumns(languages);
    expect(cols.id).toBeDefined();
    expect(cols.code).toBeDefined();
    expect(cols.name).toBeDefined();
  });

  test("id is serial primary key", () => {
    const cols = getTableColumns(languages);
    expect(cols.id.columnType).toBe("PgSerial");
    expect(cols.id.primary).toBe(true);
  });

  test("code uses languageCodeEnum", () => {
    const cols = getTableColumns(languages);
    expect(cols.code.columnType).toBe("PgEnumColumn");
  });
});

describe("vocabulary table", () => {
  test("has required columns", () => {
    const cols = getTableColumns(vocabulary);
    expect(cols.id).toBeDefined();
    expect(cols.userId).toBeDefined();
    expect(cols.languageId).toBeDefined();
    expect(cols.word).toBeDefined();
    expect(cols.reading).toBeDefined();
    expect(cols.meaning).toBeDefined();
    expect(cols.partOfSpeech).toBeDefined();
    expect(cols.contextSentences).toBeDefined();
    expect(cols.audioUrl).toBeDefined();
    expect(cols.tags).toBeDefined();
    expect(cols.createdAt).toBeDefined();
  });

  test("id is uuid primary key", () => {
    const cols = getTableColumns(vocabulary);
    expect(cols.id.columnType).toBe("PgUUID");
    expect(cols.id.primary).toBe(true);
  });

  test("reading is nullable (for Japanese)", () => {
    const cols = getTableColumns(vocabulary);
    expect(cols.reading.notNull).toBe(false);
  });

  test("audioUrl is nullable", () => {
    const cols = getTableColumns(vocabulary);
    expect(cols.audioUrl.notNull).toBe(false);
  });

  test("contextSentences is jsonb", () => {
    const cols = getTableColumns(vocabulary);
    expect(cols.contextSentences.columnType).toBe("PgJsonb");
  });

  test("tags is text array", () => {
    const cols = getTableColumns(vocabulary);
    expect(cols.tags.columnType).toBe("PgArray");
  });

  test("userId references users table", () => {
    const cols = getTableColumns(vocabulary);
    expect(cols.userId.notNull).toBe(true);
  });

  test("languageId references languages table", () => {
    const cols = getTableColumns(vocabulary);
    expect(cols.languageId.notNull).toBe(true);
  });
});

describe("cards table", () => {
  test("has required columns", () => {
    const cols = getTableColumns(cards);
    expect(cols.id).toBeDefined();
    expect(cols.vocabularyId).toBeDefined();
    expect(cols.cardType).toBeDefined();
    expect(cols.fsrsState).toBeDefined();
    expect(cols.dueAt).toBeDefined();
    expect(cols.createdAt).toBeDefined();
  });

  test("id is uuid primary key", () => {
    const cols = getTableColumns(cards);
    expect(cols.id.columnType).toBe("PgUUID");
    expect(cols.id.primary).toBe(true);
  });

  test("cardType uses cardTypeEnum", () => {
    const cols = getTableColumns(cards);
    expect(cols.cardType.columnType).toBe("PgEnumColumn");
  });

  test("fsrsState is jsonb for ts-fsrs state fields", () => {
    const cols = getTableColumns(cards);
    expect(cols.fsrsState.columnType).toBe("PgJsonb");
  });

  test("dueAt is timestamp", () => {
    const cols = getTableColumns(cards);
    expect(cols.dueAt.columnType).toBe("PgTimestamp");
  });
});

describe("reviews table", () => {
  test("has required columns", () => {
    const cols = getTableColumns(reviews);
    expect(cols.id).toBeDefined();
    expect(cols.cardId).toBeDefined();
    expect(cols.rating).toBeDefined();
    expect(cols.reviewedAt).toBeDefined();
    expect(cols.elapsedMs).toBeDefined();
    expect(cols.scheduledDays).toBeDefined();
    expect(cols.stabilityAfter).toBeDefined();
    expect(cols.difficultyAfter).toBeDefined();
  });

  test("id is uuid primary key", () => {
    const cols = getTableColumns(reviews);
    expect(cols.id.columnType).toBe("PgUUID");
    expect(cols.id.primary).toBe(true);
  });

  test("rating is integer", () => {
    const cols = getTableColumns(reviews);
    expect(cols.rating.columnType).toBe("PgInteger");
  });

  test("elapsedMs is integer", () => {
    const cols = getTableColumns(reviews);
    expect(cols.elapsedMs.columnType).toBe("PgInteger");
  });

  test("scheduledDays is real", () => {
    const cols = getTableColumns(reviews);
    expect(cols.scheduledDays.columnType).toBe("PgReal");
  });

  test("stabilityAfter is real", () => {
    const cols = getTableColumns(reviews);
    expect(cols.stabilityAfter.columnType).toBe("PgReal");
  });

  test("difficultyAfter is real", () => {
    const cols = getTableColumns(reviews);
    expect(cols.difficultyAfter.columnType).toBe("PgReal");
  });
});

describe("studySessions table", () => {
  test("has required columns", () => {
    const cols = getTableColumns(studySessions);
    expect(cols.id).toBeDefined();
    expect(cols.userId).toBeDefined();
    expect(cols.languageId).toBeDefined();
    expect(cols.startedAt).toBeDefined();
    expect(cols.endedAt).toBeDefined();
    expect(cols.cardsReviewed).toBeDefined();
    expect(cols.newCards).toBeDefined();
  });

  test("id is uuid primary key", () => {
    const cols = getTableColumns(studySessions);
    expect(cols.id.columnType).toBe("PgUUID");
    expect(cols.id.primary).toBe(true);
  });

  test("endedAt is nullable", () => {
    const cols = getTableColumns(studySessions);
    expect(cols.endedAt.notNull).toBe(false);
  });

  test("cardsReviewed and newCards are integers", () => {
    const cols = getTableColumns(studySessions);
    expect(cols.cardsReviewed.columnType).toBe("PgInteger");
    expect(cols.newCards.columnType).toBe("PgInteger");
  });
});

describe("grammarPoints table", () => {
  test("has required columns", () => {
    const cols = getTableColumns(grammarPoints);
    expect(cols.id).toBeDefined();
    expect(cols.languageId).toBeDefined();
    expect(cols.title).toBeDefined();
    expect(cols.explanation).toBeDefined();
    expect(cols.level).toBeDefined();
    expect(cols.examples).toBeDefined();
  });

  test("id is uuid primary key", () => {
    const cols = getTableColumns(grammarPoints);
    expect(cols.id.columnType).toBe("PgUUID");
    expect(cols.id.primary).toBe(true);
  });

  test("explanation is text", () => {
    const cols = getTableColumns(grammarPoints);
    expect(cols.explanation.columnType).toBe("PgText");
  });

  test("examples is jsonb", () => {
    const cols = getTableColumns(grammarPoints);
    expect(cols.examples.columnType).toBe("PgJsonb");
  });
});
