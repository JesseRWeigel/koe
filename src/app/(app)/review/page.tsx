"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/review/flashcard";
import { RatingBar } from "@/components/review/rating-bar";
import { SessionProgress } from "@/components/review/session-progress";
import { SessionSummary } from "@/components/review/session-summary";
import { createNewCard } from "@/lib/srs";
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
import {
  getDueVocabCards,
  getSrsCardState,
  updateSrsCardState,
} from "@/lib/srs/srs-storage";
import {
  getWords,
  resetStore,
  type VocabularyItem,
} from "@/lib/vocabulary/store";
import { useLanguage } from "@/lib/context/language-context";
import type { Grade } from "ts-fsrs";

function vocabToCard(item: VocabularyItem): VocabCard {
  return {
    id: item.id,
    word: item.word,
    reading: item.reading ?? "",
    meaning: item.meaning,
    exampleSentence: item.contextSentences[0] ?? "",
    srsCard: getSrsCardState(item.id),
  };
}

type PageState =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "caught-up"; totalCount: number }
  | { kind: "reviewing"; session: ReviewSession; revealed: boolean };

export default function ReviewPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [state, setState] = useState<PageState>({ kind: "loading" });

  useEffect(() => {
    resetStore();
    const allWords = getWords(language);

    if (allWords.length === 0) {
      setState({ kind: "empty" });
      return;
    }

    const dueItems = getDueVocabCards(allWords);

    if (dueItems.length === 0) {
      setState({ kind: "caught-up", totalCount: allWords.length });
      return;
    }

    const cards = dueItems.map(vocabToCard);
    setState({
      kind: "reviewing",
      session: createSession(cards),
      revealed: false,
    });
  }, [language]);

  const handleReveal = useCallback(() => {
    setState((prev) => {
      if (prev.kind !== "reviewing") return prev;
      return { ...prev, revealed: true };
    });
  }, []);

  const handleRate = useCallback((rating: Grade) => {
    setState((prev) => {
      if (prev.kind !== "reviewing") return prev;
      const result = submitRating(prev.session, rating);

      // Persist the updated SRS state
      const currentCard = getCurrentCard(prev.session);
      if (currentCard) {
        updateSrsCardState(currentCard.id, result.updatedCard);
      }

      return {
        ...prev,
        session: result.session,
        revealed: false,
      };
    });
  }, []);

  const handleGoToVocabulary = useCallback(() => {
    router.push("/vocabulary");
  }, [router]);

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
        {state.kind === "loading" && (
          <p className="text-muted-foreground">Loading...</p>
        )}

        {state.kind === "empty" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-semibold">No vocabulary words yet</h2>
            <p className="text-muted-foreground max-w-md">
              Add some words to your vocabulary first, then come back here to
              review them with spaced repetition.
            </p>
            <Button onClick={handleGoToVocabulary}>Go to Vocabulary</Button>
          </div>
        )}

        {state.kind === "caught-up" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-semibold">All caught up!</h2>
            <p className="text-muted-foreground max-w-md">
              No cards are due for review right now. You have{" "}
              {state.totalCount} word{state.totalCount !== 1 ? "s" : ""} in your
              vocabulary. Come back later when cards are due.
            </p>
            <Button variant="outline" onClick={handleDone}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {state.kind === "reviewing" && (
          <>
            {isComplete(state.session) ? (
              <SessionSummary
                summary={getSummary(state.session)}
                onDone={handleDone}
              />
            ) : getCurrentCard(state.session) ? (
              <>
                <SessionProgress progress={getProgress(state.session)} />
                <Flashcard
                  card={getCurrentCard(state.session)!}
                  onReveal={handleReveal}
                  revealed={state.revealed}
                />
                <RatingBar
                  card={getCurrentCard(state.session)!.srsCard}
                  onRate={handleRate}
                  visible={state.revealed}
                />
              </>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}
