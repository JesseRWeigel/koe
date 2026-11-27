"use client";

import { Badge } from "@/components/ui/badge";
import type { KanjiEntry } from "@/lib/languages/kanji";

interface KanjiCardProps {
  kanji: KanjiEntry;
  onClick?: (kanji: KanjiEntry, opener: HTMLButtonElement) => void;
}

export function KanjiCard({ kanji, onClick }: KanjiCardProps) {
  const on = kanji.readings.on[0];
  const kun = kanji.readings.kun[0];

  return (
    <button
      type="button"
      onClick={(event) => onClick?.(kanji, event.currentTarget)}
      className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span lang="ja" className="text-4xl font-bold">{kanji.character}</span>
      <span className="text-sm text-muted-foreground">
        {kanji.meanings.join(", ")}
      </span>
      {(on || kun) && (
        <div className="flex gap-1 text-xs text-muted-foreground">
          {on && <span lang="ja">{on}</span>}
          {on && kun && <span aria-hidden="true">/</span>}
          {kun && <span lang="ja">{kun}</span>}
        </div>
      )}
    </button>
  );
}

interface KanjiDetailProps {
  kanji: KanjiEntry;
}

export function KanjiDetail({ kanji }: KanjiDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <span lang="ja" className="text-6xl font-bold">{kanji.character}</span>
        <Badge variant="secondary">{kanji.jlptLevel}</Badge>
      </div>

      <div className="grid gap-4">
        <div>
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
            Meanings
          </h3>
          <p className="text-sm">{kanji.meanings.join(", ")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              ON readings
            </h3>
            <p className="text-sm">
              {kanji.readings.on.length > 0 ? (
                <span lang="ja">{kanji.readings.on.join(", ")}</span>
              ) : "Not listed"}
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              KUN readings
            </h3>
            <p className="text-sm">
              {kanji.readings.kun.length > 0 ? (
                <span lang="ja">{kanji.readings.kun.join(", ")}</span>
              ) : "Not listed"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
            Stroke count
          </h3>
          <p className="text-sm">{kanji.strokeCount}</p>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-medium text-muted-foreground">
            Radicals
          </h3>
          <div className="flex gap-2">
            {kanji.radicals.map((r) => (
              <Badge key={r} lang="ja" variant="outline">
                {r}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            Example words
          </h3>
          <div className="grid gap-2">
            {kanji.exampleWords.map((word) => (
              <div
                key={word.word}
                className="flex items-baseline gap-2 text-sm"
              >
                <span lang="ja" className="font-medium">{word.word}</span>
                <span lang="ja" className="text-muted-foreground">({word.reading})</span>
                <span className="text-muted-foreground">— {word.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
