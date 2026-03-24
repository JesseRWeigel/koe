"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { NewVocabularyItem } from "@/lib/vocabulary/store";

const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "particle",
  "conjunction",
  "interjection",
  "pronoun",
  "preposition",
  "expression",
] as const;

const LANGUAGES = [
  { code: "ja", label: "Japanese" },
  { code: "es", label: "Spanish" },
  { code: "pt-BR", label: "Portuguese" },
] as const;

interface AddWordDialogProps {
  onAdd: (item: NewVocabularyItem) => void;
  defaultLanguage?: "ja" | "es" | "pt-BR";
}

export function AddWordDialog({
  onAdd,
  defaultLanguage = "ja",
}: AddWordDialogProps) {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [reading, setReading] = useState("");
  const [meaning, setMeaning] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("noun");
  const [languageCode, setLanguageCode] = useState<"ja" | "es" | "pt-BR">(
    defaultLanguage
  );
  const [tagsInput, setTagsInput] = useState("");

  const resetForm = useCallback(() => {
    setWord("");
    setReading("");
    setMeaning("");
    setPartOfSpeech("noun");
    setLanguageCode(defaultLanguage);
    setTagsInput("");
  }, [defaultLanguage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onAdd({
      word: word.trim(),
      reading: languageCode === "ja" && reading.trim() ? reading.trim() : null,
      meaning: meaning.trim(),
      partOfSpeech,
      languageCode,
      contextSentences: [],
      tags,
    });

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Add Word
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Word</DialogTitle>
            <DialogDescription>
              Add a vocabulary word to your collection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={languageCode}
                onValueChange={(val: string | null) => {
                  if (val) setLanguageCode(val as "ja" | "es" | "pt-BR");
                }}
              >
                <SelectTrigger className="w-full" id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="word">Word *</Label>
              <Input
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder={
                  languageCode === "ja" ? "e.g. 食べる" : "e.g. comer"
                }
                required
              />
            </div>
            {languageCode === "ja" && (
              <div className="grid gap-2">
                <Label htmlFor="reading">Reading</Label>
                <Input
                  id="reading"
                  value={reading}
                  onChange={(e) => setReading(e.target.value)}
                  placeholder="e.g. たべる"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="meaning">Meaning *</Label>
              <Input
                id="meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="e.g. to eat"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pos">Part of Speech</Label>
              <Select
                value={partOfSpeech}
                onValueChange={(val: string | null) => {
                  if (val) setPartOfSpeech(val);
                }}
              >
                <SelectTrigger className="w-full" id="pos">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARTS_OF_SPEECH.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="comma-separated, e.g. JLPT N5, food"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Word</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
