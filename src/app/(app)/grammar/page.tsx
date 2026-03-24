"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  GrammarExplainer,
  type GrammarExplanation,
} from "@/components/grammar/grammar-explainer";
import { GrammarCard } from "@/components/grammar/grammar-card";

export default function GrammarPage() {
  const [savedExplanations, setSavedExplanations] = useState<
    GrammarExplanation[]
  >([]);

  function handleExplanation(explanation: GrammarExplanation) {
    setSavedExplanations((prev) => [explanation, ...prev]);
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Grammar</h1>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <section>
          <h2 className="mb-3 text-base font-semibold">
            Ask about any grammar point
          </h2>
          <GrammarExplainer onExplanation={handleExplanation} />
        </section>

        {savedExplanations.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold">
              Previous Explanations
            </h2>
            <div className="grid gap-4">
              {savedExplanations.map((item) => (
                <GrammarCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
