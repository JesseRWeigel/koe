"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import type { Language, Level } from "@/lib/ai/system-prompts";

export default function ChatPage() {
  const [language, setLanguage] = useState<Language>("japanese");
  const [level, setLevel] = useState<Level>("N5");
  const [scenario, setScenario] = useState("free");

  const settingsRef = useRef({ language, level, scenario });
  settingsRef.current = { language, level, scenario };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => settingsRef.current,
      }),
    []
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
  });

  const handleLanguageChange = useCallback(
    (newLanguage: Language) => {
      setLanguage(newLanguage);
      if (newLanguage === "japanese") {
        setLevel("N5");
      } else {
        setLevel("A1");
      }
      setMessages([]);
    },
    [setMessages]
  );

  const handleSend = useCallback(
    (text: string) => {
      sendMessage({ text });
    },
    [sendMessage]
  );

  const isDisabled = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-full flex-col">
      <ChatHeader
        language={language}
        level={level}
        scenario={scenario}
        onLanguageChange={handleLanguageChange}
        onLevelChange={setLevel}
        onScenarioChange={setScenario}
      />
      <ChatMessages messages={messages} status={status} />
      <ChatInput onSend={handleSend} disabled={isDisabled} />
    </div>
  );
}
