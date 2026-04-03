import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  speak,
  stop,
  isSupported,
  getPreferredProvider,
  getAvailableVoices,
  ensureVoicesReady,
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
  onerror: ((event: unknown) => void) | null = null;

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
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

describe("TTS Service", () => {
  let mockSynthesis: ReturnType<typeof createMockSpeechSynthesis>;

  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
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

  describe("ensureVoicesReady", () => {
    it("resolves immediately when voices are already loaded", async () => {
      const promise = ensureVoicesReady();
      // No need to advance timers — voices are already available
      await promise;
      expect(mockSynthesis.addEventListener).not.toHaveBeenCalled();
    });

    it("waits for voiceschanged event when voices are empty", async () => {
      mockSynthesis.getVoices.mockReturnValue([]);

      const promise = ensureVoicesReady();

      expect(mockSynthesis.addEventListener).toHaveBeenCalledWith(
        "voiceschanged",
        expect.any(Function),
      );

      // Simulate voiceschanged firing
      const callback = mockSynthesis.addEventListener.mock.calls[0][1] as () => void;
      callback();

      await promise;
      expect(mockSynthesis.removeEventListener).toHaveBeenCalledWith(
        "voiceschanged",
        expect.any(Function),
      );
    });

    it("resolves after timeout when voiceschanged never fires", async () => {
      mockSynthesis.getVoices.mockReturnValue([]);

      const promise = ensureVoicesReady();

      // Advance past the 2-second timeout
      vi.advanceTimersByTime(2000);

      await promise;
      expect(mockSynthesis.removeEventListener).toHaveBeenCalled();
    });
  });

  describe("speak", () => {
    it("calls speechSynthesis.speak with correct lang tag after delay", async () => {
      // Make speak fire onend so the promise resolves
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("こんにちは", { lang: "ja" });
      vi.advanceTimersByTime(50);
      await promise;

      expect(mockSynthesis.speak).toHaveBeenCalledOnce();
      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.lang).toBe("ja-JP");
      expect(utterance.text).toBe("こんにちは");
    });

    it("calls speechSynthesis.speak with Spanish lang tag", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("hola", { lang: "es" });
      vi.advanceTimersByTime(50);
      await promise;

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.lang).toBe("es-ES");
    });

    it("calls speechSynthesis.speak with Portuguese lang tag", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("olá", { lang: "pt-BR" });
      vi.advanceTimersByTime(50);
      await promise;

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.lang).toBe("pt-BR");
    });

    it("calls speechSynthesis.speak with French lang tag", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("bonjour", { lang: "fr" });
      vi.advanceTimersByTime(50);
      await promise;

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.lang).toBe("fr-FR");
      expect(utterance.text).toBe("bonjour");
    });

    it("uses default rate of 1.0 when not specified", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("test", { lang: "ja" });
      vi.advanceTimersByTime(50);
      await promise;

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.rate).toBe(1.0);
    });

    it("clamps rate to minimum 0.5", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("test", { lang: "ja", rate: 0.1 });
      vi.advanceTimersByTime(50);
      await promise;

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.rate).toBe(0.5);
    });

    it("clamps rate to maximum 2.0", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("test", { lang: "ja", rate: 5.0 });
      vi.advanceTimersByTime(50);
      await promise;

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.rate).toBe(2.0);
    });

    it("accepts rate within valid range", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("test", { lang: "ja", rate: 1.5 });
      vi.advanceTimersByTime(50);
      await promise;

      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.rate).toBe(1.5);
    });

    it("cancels current speech before speaking new text", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("test", { lang: "ja" });
      vi.advanceTimersByTime(50);
      await promise;

      expect(mockSynthesis.cancel).toHaveBeenCalledOnce();
      expect(mockSynthesis.speak).toHaveBeenCalledOnce();
    });

    it("adds a delay between cancel and speak to avoid browser bug", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      speak("test", { lang: "ja" });

      // cancel is called synchronously
      expect(mockSynthesis.cancel).toHaveBeenCalledOnce();
      // speak is NOT called yet (delayed by 50ms)
      expect(mockSynthesis.speak).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      // Now speak should have been called
      await vi.runAllTimersAsync();

      expect(mockSynthesis.speak).toHaveBeenCalledOnce();
    });

    it("resolves when utterance ends", async () => {
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        // Simulate async completion
        setTimeout(() => utterance.onend?.(), 100);
      });

      const promise = speak("test", { lang: "ja" });
      vi.advanceTimersByTime(50); // past the cancel delay
      vi.advanceTimersByTime(100); // past the onend delay
      await promise;
      // If we get here, the promise resolved successfully
    });

    it("rejects when utterance errors", async () => {
      const mockError = { error: "synthesis-failed" };
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        setTimeout(() => utterance.onerror?.(mockError), 100);
      });

      const promise = speak("test", { lang: "ja" });
      vi.advanceTimersByTime(50);
      vi.advanceTimersByTime(100);
      await expect(promise).rejects.toEqual(mockError);
    });

    it("works when voices are not yet loaded (empty voice list)", async () => {
      mockSynthesis.getVoices.mockReturnValue([]);
      mockSynthesis.speak.mockImplementation((utterance: MockSpeechSynthesisUtterance) => {
        utterance.onend?.();
      });

      const promise = speak("test", { lang: "ja" });
      vi.advanceTimersByTime(50);
      await promise;

      // Should still speak even without a matched voice
      expect(mockSynthesis.speak).toHaveBeenCalledOnce();
      const utterance = mockSynthesis.speak.mock
        .calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.voice).toBeNull();
      expect(utterance.lang).toBe("ja-JP");
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
