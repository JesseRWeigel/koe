"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Rating } from "@/lib/srs";
import type { Card } from "@/lib/srs";
import { getNextReviewDates } from "@/lib/srs";
import type { Grade } from "ts-fsrs";

interface RatingBarProps {
  card: Card;
  onRate: (rating: Grade) => void;
  visible: boolean;
}

function formatInterval(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

const ratingConfig: {
  rating: Grade;
  label: string;
  key: string;
  variant: "destructive" | "outline" | "secondary" | "default";
}[] = [
  { rating: Rating.Again, label: "Again", key: "1", variant: "destructive" },
  { rating: Rating.Hard, label: "Hard", key: "2", variant: "outline" },
  { rating: Rating.Good, label: "Good", key: "3", variant: "secondary" },
  { rating: Rating.Easy, label: "Easy", key: "4", variant: "default" },
];

export function RatingBar({ card, onRate, visible }: RatingBarProps) {
  const nextDates = getNextReviewDates(card);

  useEffect(() => {
    if (!visible) return;

    function handleKeyDown(e: KeyboardEvent) {
      const mapping: Record<string, Grade> = {
        "1": Rating.Again,
        "2": Rating.Hard,
        "3": Rating.Good,
        "4": Rating.Easy,
      };
      const rating = mapping[e.key];
      if (rating !== undefined) {
        e.preventDefault();
        onRate(rating);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onRate]);

  if (!visible) return null;

  return (
    <div className="flex w-full max-w-lg gap-2">
      {ratingConfig.map(({ rating, label, key, variant }) => (
        <Button
          key={rating}
          variant={variant}
          size="lg"
          className="flex flex-1 flex-col gap-0.5 py-3 h-auto"
          onClick={() => onRate(rating)}
        >
          <span className="text-sm">{label}</span>
          <span className="text-xs font-mono opacity-70">
            {formatInterval(nextDates[rating])}
          </span>
          <kbd className="text-[10px] opacity-50">{key}</kbd>
        </Button>
      ))}
    </div>
  );
}
