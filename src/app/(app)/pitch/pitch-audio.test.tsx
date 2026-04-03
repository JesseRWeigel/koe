import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PitchPage from "./page";

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

  constructor(text = "") {
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
    ]),
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null,
  };
}

// Mock the SidebarTrigger since it requires SidebarProvider context
vi.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: ({ className }: { className?: string }) => (
    <button className={className} data-testid="sidebar-trigger" />
  ),
}));

describe("Pitch Page Audio", () => {
  let mockSynthesis: ReturnType<typeof createMockSpeechSynthesis>;

  beforeEach(() => {
    mockSynthesis = createMockSpeechSynthesis();
    Object.defineProperty(window, "speechSynthesis", {
      value: mockSynthesis,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a play button for each pitch example", () => {
    render(<PitchPage />);

    const playButtons = screen.getAllByRole("button", { name: "Play audio" });
    // There are 22 pitch entries total (6 heiban + 5 atamadaka + 5 nakadaka + 5 odaka = 21... let's just check > 0)
    expect(playButtons.length).toBeGreaterThan(0);
    // Each pitch entry should have one play button — we have 21 entries
    expect(playButtons).toHaveLength(21);
  });

  it("calls TTS speak with Japanese language when play button is clicked", () => {
    render(<PitchPage />);

    const playButtons = screen.getAllByRole("button", { name: "Play audio" });
    fireEvent.click(playButtons[0]);

    expect(mockSynthesis.cancel).toHaveBeenCalled();
    expect(mockSynthesis.speak).toHaveBeenCalledOnce();

    const utterance = mockSynthesis.speak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    expect(utterance.lang).toBe("ja-JP");
  });

  it("uses a slower rate (0.75) for pitch accent pronunciation", () => {
    render(<PitchPage />);

    const playButtons = screen.getAllByRole("button", { name: "Play audio" });
    fireEvent.click(playButtons[0]);

    const utterance = mockSynthesis.speak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    expect(utterance.rate).toBe(0.75);
  });

  it("speaks the reading (hiragana) not the kanji", () => {
    render(<PitchPage />);

    const playButtons = screen.getAllByRole("button", { name: "Play audio" });
    fireEvent.click(playButtons[0]);

    const utterance = mockSynthesis.speak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    // The spoken text should be a hiragana reading, not kanji
    // Hiragana range: \u3040-\u309F, plus small kana combinations
    expect(utterance.text).toMatch(/^[\u3040-\u309F]+$/);
  });
});
