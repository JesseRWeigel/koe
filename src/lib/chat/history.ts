import {
  loadConversationHistory,
  saveConversationHistory,
  type StoredConversation,
} from "@/lib/conversation-storage";

export interface Conversation {
  id: string;
  language: string;
  level: string;
  startedAt: Date;
  messages: { role: "user" | "assistant"; text: string }[];
}

function readAll(): StoredConversation[] {
  return loadConversationHistory() ?? [];
}

function writeAll(conversations: StoredConversation[]): void {
  saveConversationHistory(conversations);
}

function toStored(conv: Conversation): StoredConversation {
  return {
    ...conv,
    startedAt: conv.startedAt.toISOString(),
  };
}

function fromStored(stored: StoredConversation): Conversation {
  return {
    ...stored,
    startedAt: new Date(stored.startedAt),
  };
}

/**
 * Save a conversation. Skips conversations with no messages.
 * Updates in place if a conversation with the same id exists.
 */
export function saveConversation(conv: Conversation): void {
  if (conv.messages.length === 0) return;

  const all = loadConversationHistory();
  if (all === undefined) return;
  const index = all.findIndex((c) => c.id === conv.id);

  if (index >= 0) {
    all[index] = toStored(conv);
  } else {
    all.push(toStored(conv));
  }

  writeAll(all);
}

/**
 * Get all conversations, sorted by most recent first.
 */
export function getConversations(): Conversation[] {
  return readAll()
    .map(fromStored)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

/**
 * Get a single conversation by id.
 */
export function getConversation(id: string): Conversation | undefined {
  const stored = readAll().find((c) => c.id === id);
  return stored ? fromStored(stored) : undefined;
}

/**
 * Delete a conversation by id.
 */
export function deleteConversation(id: string): void {
  const stored = loadConversationHistory();
  if (stored === undefined) return;
  const all = stored.filter((c) => c.id !== id);
  writeAll(all);
}
