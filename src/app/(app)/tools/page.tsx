"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ContentGrader } from "@/components/tools/content-grader";
import { CognateBrowser } from "@/components/languages/cognate-browser";
import { useLanguage } from "@/lib/context/language-context";
import type { LanguageCode } from "@/lib/languages";

/** Languages for which the Cognates Browser is relevant. */
const COGNATE_LANGUAGES: ReadonlySet<LanguageCode> = new Set(["es", "pt-BR"]);

export default function ToolsPage() {
  const { language } = useLanguage();
  const showCognates = COGNATE_LANGUAGES.has(language);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Tools</h1>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <section>
          <h2 className="mb-3 text-base font-semibold">
            Content Difficulty Grader
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Paste any text in your target language to get a difficulty grade and
            vocabulary analysis.
          </p>
          <ContentGrader />
        </section>

        {showCognates && (
          <>
            <Separator />

            <section>
              <h2 className="mb-3 text-base font-semibold">
                Spanish ↔ Portuguese Cognates
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Browse cognates between Spanish and Portuguese, and watch out for
                false friends — words that look similar but have different
                meanings.
              </p>
              <CognateBrowser />
            </section>
          </>
        )}

        {!showCognates && (
          <p className="text-muted-foreground text-sm">
            No additional language-specific tools are available for the selected
            language. Switch to Spanish or Portuguese for cognate browsing.
          </p>
        )}
      </main>
    </>
  );
}
