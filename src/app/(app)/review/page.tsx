"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Flashcard } from "@/components/review/flashcard";
import { RatingBar } from "@/components/review/rating-bar";
import { SessionProgress } from "@/components/review/session-progress";
import { SessionSummary } from "@/components/review/session-summary";
import { createNewCard, Rating } from "@/lib/srs";
import {
  createSession,
  getCurrentCard,
  submitRating,
  getProgress,
  isComplete,
  getSummary,
  type ReviewSession,
  type VocabCard,
} from "@/lib/srs/review-session";
import type { Grade } from "ts-fsrs";

// Demo vocabulary cards for development (no DB yet)
const demoCards: VocabCard[] = [
  {
    id: "demo-1",
    word: "食べる",
    reading: "たべる",
    meaning: "to eat",
    exampleSentence: "毎日朝ごはんを食べます。",
    srsCard: createNewCard(),
  },
  {
    id: "demo-2",
    word: "飲む",
    reading: "のむ",
    meaning: "to drink",
    exampleSentence: "水を飲みたいです。",
    srsCard: createNewCard(),
  },
  {
    id: "demo-3",
    word: "書く",
    reading: "かく",
    meaning: "to write",
    exampleSentence: "手紙を書きました。",
    srsCard: createNewCard(),
  },
  {
    id: "demo-4",
    word: "読む",
    reading: "よむ",
    meaning: "to read",
    exampleSentence: "本を読むのが好きです。",
    srsCard: createNewCard(),
  },
  {
    id: "demo-5",
    word: "話す",
    reading: "はなす",
    meaning: "to speak / to talk",
    exampleSentence: "日本語を話せますか？",
    srsCard: createNewCard(),
  },
];

export default function ReviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<ReviewSession>(() =>
    createSession(demoCards)
  );
  const [revealed, setRevealed] = useState(false);

  const currentCard = getCurrentCard(session);
  const progress = getProgress(session);
  const complete = isComplete(session);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleRate = useCallback(
    (rating: Grade) => {
      const result = submitRating(session, rating);
      setSession(result.session);
      setRevealed(false);
    },
    [session]
  );

  const handleDone = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Review</h1>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        {complete ? (
          <SessionSummary summary={getSummary(session)} onDone={handleDone} />
        ) : currentCard ? (
          <>
            <SessionProgress progress={progress} />
            <Flashcard
              card={currentCard}
              onReveal={handleReveal}
              revealed={revealed}
            />
            <RatingBar
              card={currentCard.srsCard}
              onRate={handleRate}
              visible={revealed}
            />
          </>
        ) : null}
      </main>
    </>
  );
}
