"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ShadowingPlayer } from "@/components/shadowing/shadowing-player";
import { SkipForwardIcon } from "lucide-react";
import { type LanguageCode, LANGUAGE_LIST } from "@/lib/languages";
import { useLanguage } from "@/lib/context/language-context";

interface ShadowingSentence {
  sentence: string;
  reading?: string;
  meaning: string;
}

const DEMO_SENTENCES: Record<string, ShadowingSentence[]> = {
  ja: [
    { sentence: "おはようございます", reading: "おはようございます", meaning: "Good morning" },
    { sentence: "ありがとうございます", reading: "ありがとうございます", meaning: "Thank you very much" },
    { sentence: "すみません", reading: "すみません", meaning: "Excuse me / I'm sorry" },
    { sentence: "いただきます", reading: "いただきます", meaning: "Let's eat (before a meal)" },
    { sentence: "ごちそうさまでした", reading: "ごちそうさまでした", meaning: "Thank you for the meal" },
    { sentence: "今日はいい天気ですね", reading: "きょうはいいてんきですね", meaning: "It's nice weather today, isn't it?" },
    { sentence: "お元気ですか", reading: "おげんきですか", meaning: "How are you?" },
    { sentence: "日本語を勉強しています", reading: "にほんごをべんきょうしています", meaning: "I am studying Japanese" },
  ],
  es: [
    { sentence: "Buenos días", meaning: "Good morning" },
    { sentence: "Muchas gracias", meaning: "Thank you very much" },
    { sentence: "¿Cómo estás?", meaning: "How are you?" },
    { sentence: "Me llamo...", meaning: "My name is..." },
    { sentence: "¿Dónde está el baño?", meaning: "Where is the bathroom?" },
    { sentence: "No entiendo", meaning: "I don't understand" },
    { sentence: "¿Cuánto cuesta?", meaning: "How much does it cost?" },
    { sentence: "Estoy aprendiendo español", meaning: "I am learning Spanish" },
  ],
  "pt-BR": [
    { sentence: "Bom dia", meaning: "Good morning" },
    { sentence: "Muito obrigado", meaning: "Thank you very much" },
    { sentence: "Como você está?", meaning: "How are you?" },
    { sentence: "Meu nome é...", meaning: "My name is..." },
    { sentence: "Onde fica o banheiro?", meaning: "Where is the bathroom?" },
    { sentence: "Não entendo", meaning: "I don't understand" },
    { sentence: "Quanto custa?", meaning: "How much does it cost?" },
    { sentence: "Estou aprendendo português", meaning: "I am learning Portuguese" },
  ],
  fr: [
    { sentence: "Bonjour", meaning: "Hello / Good morning" },
    { sentence: "Merci beaucoup", meaning: "Thank you very much" },
    { sentence: "Comment allez-vous ?", meaning: "How are you?" },
    { sentence: "Je m'appelle...", meaning: "My name is..." },
    { sentence: "Où sont les toilettes ?", meaning: "Where is the bathroom?" },
    { sentence: "Je ne comprends pas", meaning: "I don't understand" },
    { sentence: "Combien ça coûte ?", meaning: "How much does it cost?" },
    { sentence: "J'apprends le français", meaning: "I am learning French" },
  ],
};

export default function ShadowingPage() {
  const { language, setLanguage: setContextLanguage } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const sentences = DEMO_SENTENCES[language];
  const current = sentences[currentIndex];

  function handleNext() {
    setCurrentIndex((i) => (i + 1) % sentences.length);
  }

  function handleLanguageChange(lang: LanguageCode) {
    setContextLanguage(lang);
    setCurrentIndex(0);
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Shadowing Practice</h1>
        <div className="ml-auto flex gap-2">
          {LANGUAGE_LIST.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange(lang.code)}
            >
              {lang.flag}
            </Button>
          ))}
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <p className="text-muted-foreground text-center text-sm">
          Listen to the sentence, then record yourself repeating it. Compare
          your pronunciation with the original.
        </p>
        <p className="text-muted-foreground font-mono text-xs">
          {currentIndex + 1} / {sentences.length}
        </p>

        <ShadowingPlayer
          sentence={current.sentence}
          reading={current.reading}
          meaning={current.meaning}
          language={language}
        />

        <Button onClick={handleNext} variant="outline">
          <SkipForwardIcon className="mr-2 h-4 w-4" />
          Next Sentence
        </Button>
      </main>
    </>
  );
}
