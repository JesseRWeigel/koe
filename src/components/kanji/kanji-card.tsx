"use client";

import { Badge } from "@/components/ui/badge";
import type { KanjiEntry } from "@/lib/languages/kanji";

interface KanjiCardProps {
  kanji: KanjiEntry;
  onClick?: (kanji: KanjiEntry) => void;
}

export function KanjiCard({ kanji, onClick }: KanjiCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(kanji)}
      className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-4xl font-bold">{kanji.character}</span>
      <span className="text-sm text-muted-foreground">
        {kanji.meanings.join(", ")}
      </span>
      <div className="flex gap-1 text-xs text-muted-foreground">
        <span>{kanji.readings.on[0]}</span>
        <span>/</span>
        <span>{kanji.readings.kun[0]}</span>
      </div>
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
        <span className="text-6xl font-bold">{kanji.character}</span>
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
            <p className="text-sm">{kanji.readings.on.join(", ")}</p>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              KUN readings
            </h3>
            <p className="text-sm">{kanji.readings.kun.join(", ")}</p>
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
              <Badge key={r} variant="outline">
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
                <span className="font-medium">{word.word}</span>
                <span className="text-muted-foreground">({word.reading})</span>
                <span className="text-muted-foreground">— {word.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
