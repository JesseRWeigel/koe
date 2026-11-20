"use client";

import { useCallback, useEffect, useId } from "react";
import type { VocabCard } from "@/lib/srs/review-session";

interface FlashcardProps {
  card: VocabCard;
  onReveal: () => void;
  revealed: boolean;
}

export function Flashcard({ card, onReveal, revealed }: FlashcardProps) {
  const answerId = useId();
  const reading = card.reading && card.reading !== card.word ? card.reading : "";

  const handleReveal = useCallback(() => {
    if (!revealed) onReveal();
  }, [revealed, onReveal]);

  // Preserve the page-background shortcut without stealing Space from other
  // controls. A focused reveal button already handles Space and Enter natively.
  useEffect(() => {
    if (revealed) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.code !== "Space" || event.defaultPrevented || event.repeat ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        (event.target !== document.body && event.target !== document.documentElement)
      ) return;

      event.preventDefault();
      handleReveal();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, handleReveal]);

  return (
    <>
      <button
        type="button"
        aria-label={`Reveal answer for ${card.word}${reading ? `, ${reading}` : ""}`}
        aria-expanded={revealed}
        aria-disabled={revealed}
        aria-controls={answerId}
        className="perspective-[1000px] w-full max-w-lg cursor-pointer rounded-xl text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring aria-disabled:cursor-default"
        onClick={handleReveal}
      >
        <span
          aria-hidden="true"
          className={`relative block transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
            revealed ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <span className="flex min-h-[280px] flex-col items-center justify-center rounded-xl bg-card p-8 ring-1 ring-foreground/10 [backface-visibility:hidden]">
            <span className="text-4xl font-bold">{card.word}</span>
            {reading && <span className="text-muted-foreground mt-3 text-xl">{reading}</span>}
            {!revealed && (
              <span className="text-muted-foreground mt-8 text-sm">
                Select or press Space to reveal
              </span>
            )}
          </span>

          <span className="absolute inset-0 flex min-h-[280px] flex-col items-center justify-center rounded-xl bg-card p-8 ring-1 ring-foreground/10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {revealed && (
              <>
                <span className="text-2xl font-semibold">{card.meaning}</span>
                {card.exampleSentence && (
                  <span className="text-muted-foreground mt-4 text-sm italic">{card.exampleSentence}</span>
                )}
              </>
            )}
          </span>
        </span>
      </button>
      <span id={answerId} role="status" className="sr-only">
        {revealed && `${card.meaning}${card.exampleSentence ? `. ${card.exampleSentence}` : ""}`}
      </span>
    </>
  );
}
