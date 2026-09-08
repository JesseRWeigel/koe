export interface StoredConversation {
  id: string;
  language: string;
  level: string;
  startedAt: string;
  messages: { role: "user" | "assistant"; text: string }[];
}

const LEGACY_KEY = "koe-conversations";
const HISTORY_KEY = "koe-conversations-v2";
const COUNT_KEY = "koe-conversation-count-v2";

type StorageRead =
  | { ok: true; value: string | null }
  | { ok: false };

function readStorage(key: string): StorageRead {
  try {
    return { ok: true, value: localStorage.getItem(key) };
  } catch {
    return { ok: false };
  }
}

function writeStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function parseJson(raw: string | null): unknown {
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function isStoredConversation(value: unknown): value is StoredConversation {
  if (typeof value !== "object" || value === null) return false;

  const conversation = value as Record<string, unknown>;
  if (
    typeof conversation.id !== "string" ||
    typeof conversation.language !== "string" ||
    typeof conversation.level !== "string" ||
    typeof conversation.startedAt !== "string" ||
    !Number.isFinite(Date.parse(conversation.startedAt)) ||
    !Array.isArray(conversation.messages)
  ) {
    return false;
  }

  return conversation.messages.every((message) => {
    if (typeof message !== "object" || message === null) return false;
    const storedMessage = message as Record<string, unknown>;
    return (
      (storedMessage.role === "user" || storedMessage.role === "assistant") &&
      typeof storedMessage.text === "string"
    );
  });
}

function asHistory(value: unknown): StoredConversation[] | undefined {
  return Array.isArray(value) && value.every(isStoredConversation)
    ? value
    : undefined;
}

function asCount(value: unknown): number | undefined {
  return typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : undefined;
}

function persistCountIfMissing(count: number): void {
  const countRead = readStorage(COUNT_KEY);
  if (countRead.ok && asCount(parseJson(countRead.value)) === undefined) {
    writeStorage(COUNT_KEY, String(count));
  }
}

export function loadConversationHistory(): StoredConversation[] | undefined {
  const historyRead = readStorage(HISTORY_KEY);
  if (!historyRead.ok) return undefined;

  const current = asHistory(parseJson(historyRead.value));
  if (current !== undefined) return current;

  const legacyRead = readStorage(LEGACY_KEY);
  if (!legacyRead.ok) return undefined;

  const legacy = parseJson(legacyRead.value);
  const legacyHistory = asHistory(legacy);
  if (legacyHistory !== undefined) {
    if (writeStorage(HISTORY_KEY, JSON.stringify(legacyHistory))) {
      persistCountIfMissing(legacyHistory.length);
    }
    return legacyHistory;
  }

  const legacyCount = asCount(legacy);
  if (legacyCount !== undefined) persistCountIfMissing(legacyCount);
  return [];
}

export function saveConversationHistory(
  conversations: StoredConversation[]
): boolean {
  return writeStorage(HISTORY_KEY, JSON.stringify(conversations));
}

export function loadConversationCount(): number | undefined {
  const countRead = readStorage(COUNT_KEY);
  if (!countRead.ok) return undefined;

  const current = asCount(parseJson(countRead.value));
  if (current !== undefined) return current;

  const historyRead = readStorage(HISTORY_KEY);
  if (!historyRead.ok) return undefined;

  const currentHistory = asHistory(parseJson(historyRead.value));
  if (currentHistory !== undefined) {
    const derivedCount = currentHistory.length;
    writeStorage(COUNT_KEY, String(derivedCount));
    return derivedCount;
  }

  const legacyRead = readStorage(LEGACY_KEY);
  if (!legacyRead.ok) return undefined;

  const legacy = parseJson(legacyRead.value);
  const legacyHistory = asHistory(legacy);
  if (legacyHistory !== undefined) {
    if (writeStorage(HISTORY_KEY, JSON.stringify(legacyHistory))) {
      writeStorage(COUNT_KEY, String(legacyHistory.length));
    }
    return legacyHistory.length;
  }

  const legacyCount = asCount(legacy);
  if (legacyCount !== undefined) {
    writeStorage(COUNT_KEY, String(legacyCount));
    return legacyCount;
  }

  return 0;
}

export function saveConversationCount(count: number): boolean {
  if (asCount(count) === undefined) return false;
  return writeStorage(COUNT_KEY, String(count));
}
