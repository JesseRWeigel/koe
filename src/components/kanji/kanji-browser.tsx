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
  const [query, setQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleSelect = (kanji: KanjiEntry) => {
    setSelectedKanji(kanji);
    setDialogOpen(true);
  };

  const searchResults = query.length > 0 ? searchKanji(query) : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by meaning or reading..."
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
        <Tabs defaultValue="N5">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kanji Detail</DialogTitle>
          </DialogHeader>
          {selectedKanji && <KanjiDetail kanji={selectedKanji} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
