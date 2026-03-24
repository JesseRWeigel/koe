export type TTSProvider = "browser" | "elevenlabs";

export interface TTSOptions {
  lang: "ja" | "es" | "pt-BR";
  rate?: number; // 0.5 - 2.0, default 1.0
  provider?: TTSProvider;
}

/** Map language codes to BCP-47 voice tags */
export const LANG_MAP: Record<TTSOptions["lang"], string> = {
  ja: "ja-JP",
  es: "es-ES",
  "pt-BR": "pt-BR",
};

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

/** Speak the given text using the browser SpeechSynthesis API */
export function speak(text: string, options: TTSOptions): void {
  if (!isSupported()) return;

  // Cancel any current speech first
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_MAP[options.lang];
  utterance.rate = Math.min(2.0, Math.max(0.5, options.rate ?? 1.0));

  // Try to select a voice matching the language
  const voices = getAvailableVoices(options.lang);
  if (voices.length > 0) {
    utterance.voice = voices[0];
  }

  window.speechSynthesis.speak(utterance);
}

/** Stop any current speech */
export function stop(): void {
  if (!isSupported()) return;
  window.speechSynthesis.cancel();
}
