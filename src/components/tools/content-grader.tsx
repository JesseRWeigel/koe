"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/context/language-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon, SparklesIcon } from "lucide-react";

const GRADING_LANGUAGES = [
  { value: "ja", label: "Japanese" },
  { value: "es", label: "Spanish" },
  { value: "pt-BR", label: "Portuguese (BR)" },
  { value: "fr", label: "French" },
];

interface DifficultWord {
  word: string;
  meaning: string;
}

interface GradeResult {
  level: string;
  estimatedComprehension: number;
  wordCount: number;
  uniqueWords: number;
  difficultWords: DifficultWord[];
}

export function ContentGrader() {
  const { language: activeLanguage } = useLanguage();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState(activeLanguage);

  // Keep local selector in sync when the global language changes
  useEffect(() => {
    setLanguage(activeLanguage);
  }, [activeLanguage]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGrade() {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), language }),
      });

      if (!response.ok) {
        throw new Error("Failed to grade content");
      }

      const analysis: GradeResult = await response.json();
      setResult(analysis);
    } catch {
      setError("Failed to grade content. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label
            htmlFor="grade-input"
            className="text-sm font-medium leading-none"
          >
            Paste text to grade
          </label>
          <Textarea
            id="grade-input"
            placeholder="Paste any text in your target language here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            className="min-h-32"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Language</label>
          <Select
            value={language}
            onValueChange={(v) => { if (v) setLanguage(v); }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRADING_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        data-testid="grade-button"
        onClick={handleGrade}
        disabled={loading || !text.trim()}
        size="lg"
      >
        {loading ? (
          <Loader2Icon className="animate-spin" data-icon="inline-start" />
        ) : (
          <SparklesIcon data-icon="inline-start" />
        )}
        {loading ? "Grading..." : "Grade"}
      </Button>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              Difficulty Level
              <Badge variant="secondary">{result.level}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {result.estimatedComprehension}%
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Beginner Comprehension
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{result.wordCount}</div>
                  <div className="text-muted-foreground text-xs">
                    Total Words
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{result.uniqueWords}</div>
                  <div className="text-muted-foreground text-xs">
                    Unique Words
                  </div>
                </div>
              </div>

              {result.difficultWords.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    Difficult Words
                  </h4>
                  <div className="grid gap-1.5">
                    {result.difficultWords.map((dw, i) => (
                      <div
                        key={i}
                        className="flex items-baseline gap-2 text-sm"
                      >
                        <span className="font-medium">{dw.word}</span>
                        <span className="text-muted-foreground">
                          {dw.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
