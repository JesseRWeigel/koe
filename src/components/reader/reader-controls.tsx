"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCwIcon, LoaderIcon } from "lucide-react";
import type { LanguageLevel } from "@/lib/ai/system-prompts";

const languages = [
  { code: "ja", name: "Japanese" },
  { code: "es", name: "Spanish" },
  { code: "pt-BR", name: "Portuguese" },
  { code: "fr", name: "French" },
] as const;

const jlptLevels: LanguageLevel[] = ["N5", "N4", "N3", "N2", "N1"];
const cefrLevels: LanguageLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface ReaderControlsProps {
  language: string;
  level: LanguageLevel;
  loading: boolean;
  onLanguageChange: (lang: string) => void;
  onLevelChange: (level: LanguageLevel) => void;
  onNewPassage: () => void;
}

export function ReaderControls({
  language,
  level,
  loading,
  onLanguageChange,
  onLevelChange,
  onNewPassage,
}: ReaderControlsProps) {
  const levels = language === "ja" ? jlptLevels : cefrLevels;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
      <Select value={language} onValueChange={(val: string | null) => { if (val) onLanguageChange(val); }}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={level} onValueChange={(val: string | null) => { if (val) onLevelChange(val as LanguageLevel); }}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {levels.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={onNewPassage}
        disabled={loading}
      >
        {loading ? (
          <LoaderIcon className="size-4 animate-spin" />
        ) : (
          <RefreshCwIcon className="size-4" />
        )}
        <span>{loading ? "Generating..." : "New Passage"}</span>
      </Button>
    </div>
  );
}
