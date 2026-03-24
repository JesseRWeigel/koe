"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: UIMessage[];
  status: string;
}

function formatMessageText(text: string) {
  // Split on ~correction~ pattern and render corrections with highlighting
  const parts = text.split(/(~[^~]+~)/g);

  return parts.map((part, i) => {
    if (part.startsWith("~") && part.endsWith("~")) {
      const correction = part.slice(1, -1);
      return (
        <span
          key={i}
          className="rounded bg-yellow-100 px-1 font-medium text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200"
        >
          {correction}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground text-center">
          Start a conversation to practice! Say hello in your target language.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {messages.map((message) => {
        const isUser = message.role === "user";
        const textParts = message.parts?.filter(
          (part) => part.type === "text"
        ) ?? [];

        return (
          <div
            key={message.id}
            className={cn("flex", isUser ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}
            >
              {textParts.map((part, i) => (
                <span key={i}>{formatMessageText(part.text)}</span>
              ))}
            </div>
          </div>
        );
      })}
      {status === "streaming" && (
        <div className="flex justify-start">
          <div className="text-muted-foreground px-4 py-2 text-sm italic">
            AI is typing...
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
