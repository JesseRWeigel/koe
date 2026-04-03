import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  speak,
  stop,
  isSupported,
  getPreferredProvider,
  getAvailableVoices,
  LANG_MAP,
} from "./tts";

// Mock SpeechSynthesisUtterance since jsdom doesn't provide it
class MockSpeechSynthesisUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string = "") {
    this.text = text;
  }
}

vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);

function createMockSpeechSynthesis() {
  return {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => [
      { lang: "ja-JP", name: "Japanese Voice" },
      { lang: "es-ES", name: "Spanish Voice" },
      { lang: "pt-BR", name: "Portuguese Voice" },
      { lang: "fr-FR", name: "French Voice" },
      { lang: "en-US", name: "English Voice" },
      {},
    ]),
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null,
  };
}

describe("TTS Service", () => {
  let mockSynthesis: ReturnType<typeof createMockSpeechSynthesis>;

  beforeEach(() => {
    mockSynthesis = createMockSpeechSynthesis();
    Object.defineProperty(window, "speechSynthesis", {
      value: mockSynthesis,
      writable: true,
      configurable: true,
    });
    // Clear env
    delete process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("LANG_MAP", () => {
    it("maps all supported languages correctly", () => {
      expect(LANG_MAP).toEqual({
        ja: "ja-JP",
        es: "es-ES",
        "pt-BR": "pt-BR",
        fr: "fr-FR",
      });
    });
  });

  describe("isSupported", () => {
    it("returns true when speechSynthesis is available", () => {
      expect(isSupported()).toBe(true);
    });

    it("returns false when speechSynthesis is undefined", () => {
      Object.defineProperty(window, "speechSynthesis", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(isSupported()).toBe(false);
    });
  });

  describe("getPreferredProvider", () => {
    it("returns 'browser' when no ELEVENLABS_API_KEY", () => {
      expect(getPreferredProvider()).toBe("browser");
    });

    it("returns 'elevenlabs' when ELEVENLABS_API_KEY is set", () => {
      vi.stubEnv("NEXT_PUBLIC_ELEVENLABS_API_KEY", "test-key-123");
      expect(getPreferredProvider()).toBe("elevenlabs");
      vi.unstubAllEnvs();
    });
  });

  describe("speak", () => {
    it("calls speechSynthesis.speak with correct lang tag", () => {
      speak("こんにちは", { lang: "ja" });

      expect(mockSynthesis.speak).toHaveBeenCalledOnce();
      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.lang).toBe("ja-JP");
      expect(utterance.text).toBe("こんにちは");
    });

    it("calls speechSynthesis.speak with Spanish lang tag", () => {
      speak("hola", { lang: "es" });

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.lang).toBe("es-ES");
    });

    it("calls speechSynthesis.speak with Portuguese lang tag", () => {
      speak("olá", { lang: "pt-BR" });

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.lang).toBe("pt-BR");
    });

    it("calls speechSynthesis.speak with French lang tag", () => {
      speak("bonjour", { lang: "fr" });

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.lang).toBe("fr-FR");
      expect(utterance.text).toBe("bonjour");
    });

    it("uses default rate of 1.0 when not specified", () => {
      speak("test", { lang: "ja" });

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.rate).toBe(1.0);
    });

    it("clamps rate to minimum 0.5", () => {
      speak("test", { lang: "ja", rate: 0.1 });

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.rate).toBe(0.5);
    });

    it("clamps rate to maximum 2.0", () => {
      speak("test", { lang: "ja", rate: 5.0 });

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.rate).toBe(2.0);
    });

    it("accepts rate within valid range", () => {
      speak("test", { lang: "ja", rate: 1.5 });

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.rate).toBe(1.5);
    });

    it("cancels current speech before speaking new text", () => {
      speak("test", { lang: "ja" });

      expect(mockSynthesis.cancel).toHaveBeenCalledOnce();
      expect(mockSynthesis.speak).toHaveBeenCalledOnce();
    });
  });

  describe("stop", () => {
    it("calls speechSynthesis.cancel", () => {
      stop();
      expect(mockSynthesis.cancel).toHaveBeenCalledOnce();
    });
  });

  describe("getAvailableVoices", () => {
    it("returns only voices matching the requested language", () => {
      const voices = getAvailableVoices("ja");
      expect(voices).toHaveLength(1);
      expect(voices[0].lang).toBe("ja-JP");
    });

    it("returns empty array when no voices match", () => {
      mockSynthesis.getVoices.mockReturnValue([
        { lang: "en-US", name: "English Voice" },
      ]);
      const voices = getAvailableVoices("ja");
      expect(voices).toHaveLength(0);
    });
  });
});