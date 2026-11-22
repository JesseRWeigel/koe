import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
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

describe("Pitch Page", () => {
  let mockSynthesis: ReturnType<typeof createMockSpeechSynthesis>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSynthesis = createMockSpeechSynthesis();
    Object.defineProperty(window, "speechSynthesis", {
      value: mockSynthesis,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
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
    vi.advanceTimersByTime(100);

    expect(mockSynthesis.cancel).toHaveBeenCalled();
    expect(mockSynthesis.speak).toHaveBeenCalledOnce();

    const utterance = mockSynthesis.speak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    expect(utterance.lang).toBe("ja-JP");
  });

  it("uses a slower rate (0.75) for pitch accent pronunciation", () => {
    render(<PitchPage />);

    const playButtons = screen.getAllByRole("button", { name: "Play audio" });
    fireEvent.click(playButtons[0]);
    vi.advanceTimersByTime(100);

    const utterance = mockSynthesis.speak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    expect(utterance.rate).toBe(0.75);
  });

  it("speaks the reading (hiragana) not the kanji", () => {
    render(<PitchPage />);

    const playButtons = screen.getAllByRole("button", { name: "Play audio" });
    fireEvent.click(playButtons[0]);
    vi.advanceTimersByTime(100);

    const utterance = mockSynthesis.speak.mock.calls[0][0] as MockSpeechSynthesisUtterance;
    // The spoken text should be a hiragana reading, not kanji
    // Hiragana range: \u3040-\u309F, plus small kana combinations
    expect(utterance.text).toMatch(/^[\u3040-\u309F]+$/);
  });

  it("shows the fall after 頭 (あたま) and groups it under Odaka", () => {
    render(<PitchPage />);

    const name = "Pitch diagram: あたま. Following particle が: low.";
    const diagram = screen.getByRole("img", { name });
    const heights = Array.from(diagram.querySelectorAll("circle"), (dot) =>
      Number(dot.getAttribute("cy")),
    );
    expect(heights).toHaveLength(4);
    expect(heights[0]).toBeGreaterThan(heights[1]);
    expect(heights[1]).toBe(heights[2]);
    expect(heights[3]).toBe(heights[0]);

    fireEvent.click(screen.getByRole("button", { name: "Nakadaka" }));
    expect(screen.queryByRole("img", { name })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Odaka" }));
    expect(screen.getByRole("img", { name })).toBeInTheDocument();
  });
});
