"use client";

import * as React from "react";
import { saveReaderWord } from "@/lib/vocabulary/store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
} from "@/components/ui/popover";

interface ReadingPassageProps {
  content: string;
  canSaveSpanish?: boolean;
}

function WordToken({ word, sentence }: { word: string; sentence?: string }) {
  const [meaning, setMeaning] = React.useState("");
  const [status, setStatus] = React.useState<ReturnType<typeof saveReaderWord>>();
  const meaningId = React.useId();
  const trimmed = word.trim();
  if (!trimmed) return null;

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer rounded px-0.5 transition-colors hover:bg-primary/10 focus-visible:bg-primary/20 focus-visible:outline-none">
        {trimmed}
      </PopoverTrigger>
      <PopoverContent side="top" sideOffset={8} className="w-auto max-w-xs">
        <PopoverTitle className="text-sm font-medium">{trimmed}</PopoverTitle>
        {sentence ? (
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setStatus(saveReaderWord(trimmed, meaning, sentence));
            }}
          >
            <label htmlFor={meaningId}>Meaning</label>
            <input
              id={meaningId}
              required
              value={meaning}
              className="rounded border bg-background px-2 py-1"
              onChange={(event) => {
                setMeaning(event.target.value);
                setStatus(undefined);
              }}
            />
            <button type="submit" className="rounded bg-primary p-1 text-primary-foreground">
              Save to vocabulary
            </button>
            {status === "saved" && <p role="status">Saved with its sentence.</p>}
            {status === "already-saved" && <p role="status">Already saved with this sentence.</p>}
            {status === "invalid" && <p role="alert">Enter a meaning before saving.</p>}
            {status === "unavailable" && <p role="alert">Could not save in this browser. Try again.</p>}
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">Dictionary coming soon.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

const spanishSentences = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter("es", { granularity: "sentence" })
  : null;
const spanishWords = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter("es", { granularity: "word" })
  : null;

function PassageLine({ line, canSaveSpanish }: { line: string; canSaveSpanish: boolean }) {
  if (!line.trim()) return null;

  if (canSaveSpanish && spanishSentences && spanishWords) {
    const words = spanishWords;
    return (
      <p className="mb-4 leading-relaxed">
        {Array.from(spanishSentences.segment(line), ({ segment: sentence, index }) =>
          Array.from(words.segment(sentence), (token) =>
            token.isWordLike ? (
              <WordToken key={`es-${index + token.index}`} word={token.segment} sentence={sentence} />
            ) : (
              <React.Fragment key={index + token.index}>{token.segment}</React.Fragment>
            )
          )
        )}
      </p>
    );
  }

  // Preserve the existing display for languages without vocabulary capture.
  const tokens = line.split(/(\s+)/);

  return (
    <p className="mb-4 leading-relaxed">
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) {
          return <span key={i}>{token}</span>;
        }
        return <WordToken key={i} word={token} />;
      })}
    </p>
  );
}

export function ReadingPassage({ content, canSaveSpanish = false }: ReadingPassageProps) {
  const lines = content.split("\n");
  const title = lines[0]?.trim();
  const body = lines.slice(1).join("\n").trim();
  const paragraphs = body.split(/\n\s*\n/);

  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      {title && (
        <h2 className="mb-6 text-2xl font-bold tracking-tight">{title}</h2>
      )}
      <div className="text-lg leading-loose tracking-wide">
        {paragraphs.map((para, i) => (
          <PassageLine key={i} line={para.replace(/\n/g, " ")} canSaveSpanish={canSaveSpanish} />
        ))}
      </div>
    </article>
  );
}
