"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { KanjiBrowser } from "@/components/kanji/kanji-browser";

export default function KanjiPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Kanji</h1>
      </header>
      <main className="flex-1">
        <KanjiBrowser />
      </main>
    </>
  );
}
