"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import type { Language, Level } from "@/lib/ai/system-prompts";
import {
  saveConversation,
  type Conversation,
} from "@/lib/chat/history";

function extractText(message: UIMessage): string {
  return (
    message.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("") ?? ""
  );
}

export default function ChatPage() {
  const [language, setLanguage] = useState<Language>("japanese");
  const [level, setLevel] = useState<Level>("N5");
  const [scenario, setScenario] = useState("free");
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID());
  const [conversationStartedAt, setConversationStartedAt] = useState(() => new Date());

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

  // Auto-save conversation whenever messages change (and there are messages)
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    if (messages.length === 0) return;

    const conv: Conversation = {
      id: conversationId,
      language,
      level,
      startedAt: conversationStartedAt,
      messages: messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          text: extractText(m),
        })),
    };
    saveConversation(conv);
  }, [messages, conversationId, language, level, conversationStartedAt]);

  // Save current conversation before unloading the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentMessages = messagesRef.current;
      if (currentMessages.length === 0) return;
      saveConversation({
        id: conversationId,
        language,
        level,
        startedAt: conversationStartedAt,
        messages: currentMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            text: extractText(m),
          })),
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [conversationId, language, level, conversationStartedAt]);

  const startNewConversation = useCallback(() => {
    setConversationId(crypto.randomUUID());
    setConversationStartedAt(new Date());
    setMessages([]);
  }, [setMessages]);

  const handleLanguageChange = useCallback(
    (newLanguage: Language) => {
      setLanguage(newLanguage);
      if (newLanguage === "japanese") {
        setLevel("N5");
      } else {
        setLevel("A1");
      }
      startNewConversation();
    },
    [startNewConversation]
  );

  const handleLoadConversation = useCallback(
    (conv: Conversation) => {
      // Save current conversation before loading another
      if (messagesRef.current.length > 0) {
        saveConversation({
          id: conversationId,
          language,
          level,
          startedAt: conversationStartedAt,
          messages: messagesRef.current
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              role: m.role as "user" | "assistant",
              text: extractText(m),
            })),
        });
      }

      setConversationId(conv.id);
      setConversationStartedAt(conv.startedAt);
      setLanguage(conv.language as Language);
      setLevel(conv.level as Level);
      setMessages(
        conv.messages.map((m, i) => ({
          id: `${conv.id}-${i}`,
          role: m.role,
          parts: [{ type: "text" as const, text: m.text }],
          createdAt: conv.startedAt,
        }))
      );
    },
    [conversationId, language, level, conversationStartedAt, setMessages]
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
        onLoadConversation={handleLoadConversation}
      />
      <ChatMessages messages={messages} status={status} />
      <ChatInput onSend={handleSend} disabled={isDisabled} />
    </div>
  );
}
