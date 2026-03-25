"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { HistoryIcon, TrashIcon, ArrowLeftIcon } from "lucide-react";
import {
  getConversations,
  getConversation,
  deleteConversation,
  type Conversation,
} from "@/lib/chat/history";

interface ChatHistoryProps {
  onLoadConversation: (conv: Conversation) => void;
}

export function ChatHistory({ onLoadConversation }: ChatHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [viewing, setViewing] = useState<Conversation | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setConversations(getConversations());
      setViewing(null);
    }
  }, [open]);

  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteConversation(id);
      setConversations(getConversations());
      if (viewing?.id === id) {
        setViewing(null);
      }
    },
    [viewing]
  );

  const handleLoad = useCallback(
    (conv: Conversation) => {
      onLoadConversation(conv);
      setOpen(false);
    },
    [onLoadConversation]
  );

  const handleView = useCallback((id: string) => {
    const conv = getConversation(id);
    if (conv) setViewing(conv);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Chat history" />
        }
      >
        <HistoryIcon className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {viewing ? (
              <span className="flex items-center gap-2">
                <button
                  onClick={() => setViewing(null)}
                  className="rounded p-1 hover:bg-muted"
                  aria-label="Back to list"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>
                Conversation
              </span>
            ) : (
              "Chat History"
            )}
          </SheetTitle>
          <SheetDescription>
            {viewing
              ? `${viewing.language} - ${viewing.level} - ${new Date(viewing.startedAt).toLocaleDateString()}`
              : "Your past conversations"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {viewing ? (
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleLoad(viewing)}
              >
                Load this conversation
              </Button>
              {viewing.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 text-sm ${
                    msg.role === "user"
                      ? "ml-8 bg-primary text-primary-foreground"
                      : "mr-8 bg-muted"
                  }`}
                >
                  <p className="mb-1 text-xs font-medium opacity-70">
                    {msg.role === "user" ? "You" : "Assistant"}
                  </p>
                  {msg.text}
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No conversations yet. Start chatting!
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
                  onClick={() => handleView(conv.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleView(conv.id);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {conv.language}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conv.level}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm">
                      {conv.messages[0]?.text ?? "Empty conversation"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(conv.startedAt).toLocaleDateString()} -{" "}
                      {conv.messages.length} messages
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => handleDelete(conv.id, e)}
                    aria-label={`Delete conversation from ${new Date(conv.startedAt).toLocaleDateString()}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
