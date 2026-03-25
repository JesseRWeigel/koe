"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PitchDiagram } from "@/components/kanji/pitch-diagram";
import {
  getPitchEntries,
  getPitchByPattern,
  type PitchPattern,
} from "@/lib/languages/pitch-accent";

const PATTERN_FILTERS = [
  { label: "All", value: null },
  { label: "Heiban", value: "heiban" as PitchPattern },
  { label: "Atamadaka", value: "atamadaka" as PitchPattern },
  { label: "Nakadaka", value: "nakadaka" as PitchPattern },
  { label: "Odaka", value: "odaka" as PitchPattern },
] as const;

const PATTERN_DESCRIPTIONS: Record<PitchPattern, string> = {
  heiban: "Flat pattern (LH...H) -- pitch rises after the first mora and stays high.",
  atamadaka: "Head-high pattern (HL...L) -- pitch starts high and drops after the first mora.",
  nakadaka: "Middle-high pattern (LH...HL) -- pitch rises, peaks in the middle, then drops.",
  odaka: "Tail-high pattern (LH...H(L)) -- pitch rises and stays high, dropping only on a following particle.",
};

const PATTERN_COLORS: Record<PitchPattern, "default" | "secondary" | "destructive" | "outline"> = {
  heiban: "default",
  atamadaka: "destructive",
  nakadaka: "secondary",
  odaka: "outline",
};

export default function PitchPage() {
  const [activeFilter, setActiveFilter] = useState<PitchPattern | null>(null);

  const entries = activeFilter
    ? getPitchByPattern(activeFilter)
    : getPitchEntries();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Pitch Accent</h1>
      </header>
      <main className="flex-1 space-y-6 p-4">
        {/* Pattern explanations */}
        <section className="space-y-2">
          <h2 className="text-base font-medium">Pitch Accent Patterns</h2>
          <p className="text-sm text-muted-foreground">
            Japanese pitch accent determines the melody of words. Each word follows one of four patterns
            based on where the pitch rises and falls across its morae (sound units).
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.entries(PATTERN_DESCRIPTIONS) as [PitchPattern, string][]).map(
              ([pattern, description]) => (
                <div key={pattern} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={PATTERN_COLORS[pattern]}>
                      {pattern}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {PATTERN_FILTERS.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                activeFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Pitch cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.word}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl">{entry.word}</span>
                  <Badge variant={PATTERN_COLORS[entry.pattern]}>
                    {entry.pattern}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <span className="text-lg">{entry.reading}</span>
                  <span className="ml-2">— {entry.meaning}</span>
                </div>
                <PitchDiagram
                  morae={entry.morae}
                  accentPosition={entry.accentPosition}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
