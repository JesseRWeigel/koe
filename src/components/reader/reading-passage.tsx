"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ReadingPassageProps {
  content: string;
}

function WordToken({ word }: { word: string }) {
  const trimmed = word.trim();
  if (!trimmed) return null;

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer rounded px-0.5 transition-colors hover:bg-primary/10 focus-visible:bg-primary/20 focus-visible:outline-none">
        {trimmed}
      </PopoverTrigger>
      <PopoverContent side="top" sideOffset={8} className="w-auto max-w-xs">
        <p className="text-sm font-medium">{trimmed}</p>
        <p className="text-xs text-muted-foreground">
          Tap to look up — dictionary coming soon
        </p>
      </PopoverContent>
    </Popover>
  );
}

function PassageLine({ line }: { line: string }) {
  if (!line.trim()) return null;

  // Split by whitespace but keep structure for CJK (split by character for ja/zh)
  const tokens = line.split(/(\s+)/);

  return (
    <p className="mb-4 leading-relaxed">
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) {
          return <span key={i}>{token}</span>;
        }
        return <WordToken key={i} word={token} />;
      })}
    </p>
  );
}

export function ReadingPassage({ content }: ReadingPassageProps) {
  const lines = content.split("\n");
  const title = lines[0]?.trim();
  const body = lines.slice(1).join("\n").trim();
  const paragraphs = body.split(/\n\s*\n/);

  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      {title && (
        <h2 className="mb-6 text-2xl font-bold tracking-tight">{title}</h2>
      )}
      <div className="text-lg leading-loose tracking-wide">
        {paragraphs.map((para, i) => (
          <PassageLine key={i} line={para.replace(/\n/g, " ")} />
        ))}
      </div>
    </article>
  );
}
