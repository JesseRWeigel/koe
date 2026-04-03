"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2Icon, PenLineIcon, SparklesIcon, LightbulbIcon } from "lucide-react";
import { LANGUAGES, LEVELS, type Language, type Level } from "@/lib/ai/system-prompts";
import { languageToCode } from "@/lib/languages";

const WRITING_PROMPTS = [
  "Describe your day today",
  "Write about your favorite food",
  "Describe your hometown",
  "Write about a hobby you enjoy",
  "Describe your best friend",
  "Write about your dream vacation",
  "Describe what you did last weekend",
  "Write about your favorite season",
];

export interface WritingCorrection {
  id: string;
  text: string;
  language: Language;
  level: Level;
  correction: string;
  createdAt: Date;
}

interface WritingEditorProps {
  onCorrection: (correction: WritingCorrection) => void;
}

function getLanguageCode(language: Language): string {
  return languageToCode(language);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function WritingEditor({ onCorrection }: WritingEditorProps) {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<Language>("japanese");
  const [level, setLevel] = useState<Level>("N5");
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleLanguageChange(value: string | null) {
    if (!value) return;
    const lang = value as Language;
    setLanguage(lang);
    // Reset level to first available for the new language
    setLevel(LEVELS[lang][0].value);
  }

  function applyPromptSuggestion(prompt: string) {
    setText(prompt);
  }

  async function handleCheckWriting() {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setCorrection(null);

    try {
      const response = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          language: getLanguageCode(language),
          level,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get writing correction");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setCorrection(fullText);
      }

      onCorrection({
        id: crypto.randomUUID(),
        text: text.trim(),
        language,
        level,
        correction: fullText,
        createdAt: new Date(),
      });
    } catch {
      setError("Failed to get correction. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const charCount = text.length;
  const wordCount = countWords(text);

  return (
    <div className="space-y-4">
      {/* Language and Level selectors */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Language</label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Level</label>
          <Select value={level} onValueChange={(v) => v && setLevel(v as Level)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS[language].map((lvl) => (
                <SelectItem key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Writing prompt suggestions */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-sm font-medium leading-none">
          <LightbulbIcon className="size-4 text-muted-foreground" />
          Writing prompts
        </div>
        <div className="flex flex-wrap gap-2">
          {WRITING_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              size="sm"
              onClick={() => applyPromptSuggestion(prompt)}
              disabled={loading}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Writing area */}
      <div className="space-y-2">
        <label
          htmlFor="writing-input"
          className="text-sm font-medium leading-none"
        >
          Write in {LANGUAGES.find((l) => l.value === language)?.label}
        </label>
        <Textarea
          id="writing-input"
          placeholder="Start writing here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          className="min-h-40"
        />
        <div className="flex justify-end gap-3 text-xs text-muted-foreground">
          <span>{charCount} characters</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* Check button */}
      <Button
        onClick={handleCheckWriting}
        disabled={loading || !text.trim()}
        size="lg"
      >
        {loading ? (
          <Loader2Icon className="animate-spin" data-icon="inline-start" />
        ) : (
          <PenLineIcon data-icon="inline-start" />
        )}
        {loading ? "Checking..." : "Check My Writing"}
      </Button>

      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Correction display */}
      {correction && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Feedback</h3>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
            {correction}
          </div>
        </Card>
      )}
    </div>
  );
}
