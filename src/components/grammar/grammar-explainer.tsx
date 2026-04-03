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
import { Loader2Icon, SparklesIcon } from "lucide-react";
import { type LanguageCode, LANGUAGE_LIST } from "@/lib/languages";
import { useLanguage } from "@/lib/context/language-context";

export interface GrammarExplanation {
  id: string;
  text: string;
  language: LanguageCode;
  explanation: string;
  createdAt: Date;
}

interface GrammarExplainerProps {
  onExplanation: (explanation: GrammarExplanation) => void;
}

export function GrammarExplainer({ onExplanation }: GrammarExplainerProps) {
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const { language, setLanguage: setContextLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExplain() {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const response = await fetch("/api/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          context: context.trim() || undefined,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get grammar explanation");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setExplanation(fullText);
      }

      onExplanation({
        id: crypto.randomUUID(),
        text: text.trim(),
        language,
        explanation: fullText,
        createdAt: new Date(),
      });
    } catch {
      setError("Failed to generate explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label
            htmlFor="grammar-input"
            className="text-sm font-medium leading-none"
          >
            Grammar pattern or sentence
          </label>
          <Textarea
            id="grammar-input"
            placeholder="e.g. 食べられる, subjuntivo, por vs para..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Language</label>
          <Select value={language} onValueChange={(v) => setContextLanguage(v as LanguageCode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_LIST.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="grammar-context"
          className="text-sm font-medium leading-none"
        >
          Context{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="grammar-context"
          placeholder="Where did you encounter this? Paste a sentence or describe the situation..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={loading}
          className="min-h-10"
        />
      </div>

      <Button
        onClick={handleExplain}
        disabled={loading || !text.trim()}
        size="lg"
      >
        {loading ? (
          <Loader2Icon className="animate-spin" data-icon="inline-start" />
        ) : (
          <SparklesIcon data-icon="inline-start" />
        )}
        {loading ? "Explaining..." : "Explain"}
      </Button>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {explanation && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="mb-2 text-sm font-semibold">Explanation</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
}
