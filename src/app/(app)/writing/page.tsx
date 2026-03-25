"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  WritingEditor,
  type WritingCorrection,
} from "@/components/writing/writing-editor";
import { Card } from "@/components/ui/card";
import { LANGUAGES } from "@/lib/ai/system-prompts";

export default function WritingPage() {
  const [savedCorrections, setSavedCorrections] = useState<
    WritingCorrection[]
  >([]);

  function handleCorrection(correction: WritingCorrection) {
    setSavedCorrections((prev) => [correction, ...prev]);
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Writing Practice</h1>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <section>
          <h2 className="mb-3 text-base font-semibold">
            Practice free writing with AI corrections
          </h2>
          <WritingEditor onCorrection={handleCorrection} />
        </section>

        {savedCorrections.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold">
              Previous Corrections
            </h2>
            <div className="grid gap-4">
              {savedCorrections.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {LANGUAGES.find((l) => l.value === item.language)?.label}
                    </span>
                    <span>&middot;</span>
                    <span>{item.level}</span>
                    <span>&middot;</span>
                    <span>{item.createdAt.toLocaleTimeString()}</span>
                  </div>
                  <div className="mb-3 rounded-md bg-muted/50 p-3 text-sm">
                    {item.text}
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                    {item.correction}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
