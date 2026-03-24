"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LANGUAGES,
  LEVELS,
  SCENARIOS,
  type Language,
  type Level,
} from "@/lib/ai/system-prompts";

interface ChatHeaderProps {
  language: Language;
  level: Level;
  scenario: string;
  onLanguageChange: (language: Language) => void;
  onLevelChange: (level: Level) => void;
  onScenarioChange: (scenario: string) => void;
}

export function ChatHeader({
  language,
  level,
  scenario,
  onLanguageChange,
  onLevelChange,
  onScenarioChange,
}: ChatHeaderProps) {
  const levels = LEVELS[language];

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-lg font-semibold">Conversation Practice</h1>
      <div className="ml-auto flex items-center gap-2">
        <Select value={language} onValueChange={(val: string | null) => { if (val) onLanguageChange(val as Language); }}>
          <SelectTrigger size="sm">
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
        <Select value={level} onValueChange={(val: string | null) => { if (val) onLevelChange(val as Level); }}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {levels.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={scenario} onValueChange={(val: string | null) => { if (val) onScenarioChange(val); }}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCENARIOS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
