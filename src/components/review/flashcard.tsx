"use client";

import { useCallback, useEffect, useState } from "react";
import type { VocabCard } from "@/lib/srs/review-session";
import { toRomaji } from "@/lib/languages";

interface FlashcardProps {
  card: VocabCard;
  onReveal: () => void;
  revealed: boolean;
}

export function Flashcard({ card, onReveal, revealed }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setFlipped(false);
  }, [card.id]);

  // Sync flip with revealed prop
  useEffect(() => {
    setFlipped(revealed);
  }, [revealed]);

  const handleFlip = useCallback(() => {
    if (!revealed) {
      onReveal();
    }
  }, [revealed, onReveal]);

  // Space bar to flip
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && !revealed) {
        e.preventDefault();
        handleFlip();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, handleFlip]);

  return (
    <div
      className="perspective-[1000px] w-full max-w-lg cursor-pointer"
      onClick={handleFlip}
    >
      <div
        className={`relative transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl bg-card p-8 ring-1 ring-foreground/10 [backface-visibility:hidden]">
          <p className="text-4xl font-bold">{card.word}</p>
          {card.reading && card.reading !== card.word && (
            <>
              <p className="text-muted-foreground mt-3 text-xl">{card.reading}</p>
              <p className="text-muted-foreground/60 mt-1 font-mono text-sm">{toRomaji(card.reading)}</p>
            </>
          )}
          {!revealed && (
            <p className="text-muted-foreground mt-8 text-sm">
              Click or press Space to reveal
            </p>
          )}
        </div>

        {/* Back */}
        <div className="absolute inset-0 flex min-h-[280px] flex-col items-center justify-center rounded-xl bg-card p-8 ring-1 ring-foreground/10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-2xl font-semibold">{card.meaning}</p>
          {card.exampleSentence && (
            <p className="text-muted-foreground mt-4 text-center text-sm italic">
              {card.exampleSentence}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
