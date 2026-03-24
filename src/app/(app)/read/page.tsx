"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TopicSelector } from "@/components/reader/topic-selector";
import { ReadingPassage } from "@/components/reader/reading-passage";
import { ReaderControls } from "@/components/reader/reader-controls";
import type { LanguageLevel } from "@/lib/ai/system-prompts";

export default function ReadPage() {
  const [language, setLanguage] = React.useState("ja");
  const [level, setLevel] = React.useState<LanguageLevel>("N5");
  const [passage, setPassage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = React.useState<string | null>(null);

  const generatePassage = React.useCallback(
    async (topic: string) => {
      setLoading(true);
      setError(null);
      setCurrentTopic(topic);
      setPassage("");

      try {
        const res = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, level, topic }),
        });

        if (!res.ok) {
          throw new Error("Failed to generate passage");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setPassage(prev => (prev || "") + chunk);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate passage"
        );
      } finally {
        setLoading(false);
      }
    },
    [language, level]
  );

  function handleNewPassage() {
    if (currentTopic) {
      generatePassage(currentTopic);
    } else {
      setPassage(null);
    }
  }

  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    // Reset level to appropriate default when switching language
    if (lang === "ja") {
      setLevel("N5");
    } else {
      setLevel("A1");
    }
  }

  function handleStartOver() {
    setPassage(null);
    setCurrentTopic(null);
    setError(null);
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Graded Reader</h1>
      </header>

      {(passage || loading) && (
        <ReaderControls
          language={language}
          level={level}
          loading={loading}
          onLanguageChange={handleLanguageChange}
          onLevelChange={setLevel}
          onNewPassage={handleNewPassage}
        />
      )}

      <main className="flex flex-1 flex-col overflow-y-auto">
        {!passage && !loading && !error && (
          <>
            <div className="mx-auto max-w-2xl px-4 pt-8">
              <ReaderControls
                language={language}
                level={level}
                loading={loading}
                onLanguageChange={handleLanguageChange}
                onLevelChange={setLevel}
                onNewPassage={handleNewPassage}
              />
            </div>
            <TopicSelector onSelect={generatePassage} />
          </>
        )}

        {loading && !passage && (
          <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-8">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-2xl px-4 py-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              className="text-sm text-primary underline underline-offset-4"
              onClick={handleStartOver}
            >
              Try again
            </button>
          </div>
        )}

        {passage && !error && (
          <>
            <ReadingPassage content={passage} />
            {!loading && (
              <div className="mx-auto max-w-2xl px-4 pb-8 text-center">
                <button
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  onClick={handleStartOver}
                >
                  Choose a different topic
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
