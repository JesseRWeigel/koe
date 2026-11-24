import { type LanguageCode, LANGUAGES, LANGUAGE_CODES } from "@/lib/languages";

export type TTSProvider = "browser" | "elevenlabs";

export interface TTSOptions {
  lang: LanguageCode;
  rate?: number; // 0.5 - 2.0, default 1.0
  provider?: TTSProvider;
}

/** Map language codes to BCP-47 voice tags — derived from LANGUAGES. */
export const LANG_MAP: Record<LanguageCode, string> = Object.fromEntries(
  LANGUAGE_CODES.map((code) => [code, LANGUAGES[code].bcp47]),
) as Record<LanguageCode, string>;

/** Check if TTS is available in the current environment */
export function isSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis !== undefined;
}

/** Returns 'elevenlabs' if API key is set, otherwise 'browser' */
export function getPreferredProvider(): TTSProvider {
  const key = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  return key ? "elevenlabs" : "browser";
}

/** Get available voices for a given language */
export function getAvailableVoices(lang: TTSOptions["lang"]): SpeechSynthesisVoice[] {
  if (!isSupported()) return [];
  const bcp47 = LANG_MAP[lang];
  return window.speechSynthesis.getVoices().filter((v) => v.lang === bcp47);
}

/**
 * Ensure voices are loaded. On many browsers, getVoices() returns an empty
 * array until the voiceschanged event fires. This helper waits for that event
 * if needed, with a timeout so callers are never stuck forever.
 */
export function ensureVoicesReady(): Promise<void> {
  if (!isSupported()) return Promise.resolve();

  // Voices already loaded
  if (window.speechSynthesis.getVoices().length > 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const onReady = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onReady);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onReady);

    // Timeout after 2 seconds — speak without a matched voice rather than hang
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onReady);
      resolve();
    }, 2000);
  });
}

let pendingPlayback: { timer: ReturnType<typeof setTimeout>; resolve: () => void } | undefined;

function cancelPendingPlayback(): void {
  const pending = pendingPlayback;
  if (!pending) return;
  pendingPlayback = undefined;
  clearTimeout(pending.timer);
  // This request never reached the browser, so it will not emit an event.
  pending.resolve();
}

/**
 * Speak the given text using the browser SpeechSynthesis API.
 * Returns a Promise that resolves when the utterance finishes, or rejects on
 * error. Requests canceled before they reach the browser resolve quietly.
 * The small delay between cancel() and speak() works around a browser
 * bug where the new utterance is silently dropped.
 */
export function speak(text: string, options: TTSOptions): Promise<void> {
  if (!isSupported()) return Promise.resolve();

  // The browser cannot cancel an utterance we have not handed it yet.
  cancelPendingPlayback();
  window.speechSynthesis.cancel();

  return new Promise<void>((resolve, reject) => {
    // Small delay after cancel — some browsers (Chrome, Edge) swallow the new
    // utterance when speak() is called in the same micro-task as cancel().
    const timer = setTimeout(() => {
      pendingPlayback = undefined;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_MAP[options.lang];
      utterance.rate = Math.min(2.0, Math.max(0.5, options.rate ?? 1.0));

      // Try to select a voice matching the language
      const voices = getAvailableVoices(options.lang);
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);

      window.speechSynthesis.speak(utterance);
    }, 50);
    pendingPlayback = { timer, resolve };
  });
}

/** Stop current or scheduled speech */
export function stop(): void {
  cancelPendingPlayback();
  if (!isSupported()) return;
  window.speechSynthesis.cancel();
}
