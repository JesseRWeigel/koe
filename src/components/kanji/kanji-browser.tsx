"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KanjiCard, KanjiDetail } from "@/components/kanji/kanji-card";
import {
  getKanjiByLevel,
  searchKanji,
  type KanjiEntry,
} from "@/lib/languages/kanji";

const levels = ["N5", "N4", "N3", "N2", "N1"] as const;

export function KanjiBrowser() {
  const [selectedKanji, setSelectedKanji] = React.useState<KanjiEntry | null>(
    null
  );
  const [level, setLevel] = React.useState("N5");
  const [query, setQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const openerRef = React.useRef<HTMLButtonElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = (kanji: KanjiEntry, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setSelectedKanji(kanji);
    setDialogOpen(true);
  };

  const searchResults = query.trim().length > 0 ? searchKanji(query) : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          aria-label="Search kanji"
          placeholder="Search kanji, meanings, readings, or example words..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {searchResults ? (
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
            {searchResults.map((kanji) => (
              <KanjiCard
                key={kanji.character}
                kanji={kanji}
                onClick={handleSelect}
              />
            ))}
          </div>
        </div>
      ) : (
        <Tabs value={level} onValueChange={setLevel}>
          <TabsList>
            {levels.map((level) => (
              <TabsTrigger key={level} value={level}>
                {level}
              </TabsTrigger>
            ))}
          </TabsList>
          {levels.map((level) => {
            const kanji = getKanjiByLevel(level);
            return (
              <TabsContent key={level} value={level}>
                {kanji.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No kanji data for {level} yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                    {kanji.map((k) => (
                      <KanjiCard
                        key={k.character}
                        kanji={k}
                        onClick={handleSelect}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          finalFocus={() =>
            openerRef.current?.isConnected ? openerRef.current : searchRef.current
          }
        >
          <DialogHeader>
            <DialogTitle>Kanji Detail</DialogTitle>
          </DialogHeader>
          {selectedKanji && <KanjiDetail kanji={selectedKanji} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
