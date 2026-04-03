"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WordCard } from "./word-card";
import { AddWordDialog } from "./add-word-dialog";
import { ImportDialog } from "./import-dialog";
import {
  addWord,
  getWords,
  deleteWord,
  searchWords,
  type VocabularyItem,
  type NewVocabularyItem,
} from "@/lib/vocabulary/store";

const LANGUAGE_TABS = [
  { value: "all", label: "All" },
  { value: "ja", label: "Japanese" },
  { value: "es", label: "Spanish" },
  { value: "pt-BR", label: "Portuguese" },
  { value: "fr", label: "French" },
] as const;

export function VocabularyList() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [revision, setRevision] = useState(0);

  const languageFilter =
    activeTab === "all" ? undefined : (activeTab as "ja" | "es" | "pt-BR");

  const words = useMemo(() => {
    // revision is used to trigger re-computation
    void revision;
    if (query.trim()) {
      return searchWords(query, languageFilter);
    }
    return getWords(languageFilter);
  }, [query, languageFilter, revision]);

  const handleAdd = (item: NewVocabularyItem) => {
    addWord(item);
    setRevision((r) => r + 1);
  };

  const handleImport = (items: NewVocabularyItem[]) => {
    for (const item of items) {
      addWord(item);
    }
    setRevision((r) => r + 1);
  };

  const handleDelete = (id: string) => {
    deleteWord(id);
    setRevision((r) => r + 1);
  };

  const handleEdit = (_item: VocabularyItem) => {
    // Edit functionality can be expanded later
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search words or meanings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <ImportDialog
          onImport={handleImport}
          defaultLanguage={languageFilter ?? "ja"}
        />
        <AddWordDialog
          onAdd={handleAdd}
          defaultLanguage={languageFilter ?? "ja"}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {LANGUAGE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {LANGUAGE_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {words.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <BookOpen className="size-12 text-muted-foreground/50" />
                <div>
                  <p className="text-lg font-medium text-muted-foreground">
                    No words yet
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {query
                      ? "No words match your search."
                      : "Add your first vocabulary word to get started."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {words.map((word) => (
                  <WordCard
                    key={word.id}
                    item={word}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {words.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="font-mono">{words.length}</span>{" "}
          {words.length === 1 ? "word" : "words"}
        </p>
      )}
    </div>
  );
}
