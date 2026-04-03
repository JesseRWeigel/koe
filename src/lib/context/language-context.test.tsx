import { render, screen, act, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { LanguageProvider, useLanguage } from "./language-context";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

function TestConsumer() {
  const { language, setLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <button onClick={() => setLanguage("fr")}>Set French</button>
      <button onClick={() => setLanguage("es")}>Set Spanish</button>
    </div>
  );
}

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("provides default language 'ja'", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );
    expect(screen.getByTestId("language").textContent).toBe("ja");
  });

  it("updates language when setLanguage is called", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    act(() => {
      screen.getByText("Set French").click();
    });

    expect(screen.getByTestId("language").textContent).toBe("fr");
  });

  it("persists language to localStorage on set", () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    act(() => {
      screen.getByText("Set Spanish").click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "koe-language",
      "es",
    );
  });

  it("reads language from localStorage on mount", async () => {
    localStorageMock.getItem.mockReturnValue("fr");

    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("language").textContent).toBe("fr");
    });
  });

  it("falls back to 'ja' when localStorage has invalid value", async () => {
    localStorageMock.getItem.mockReturnValue("invalid-code");

    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>,
    );

    // Should remain "ja" since the stored value is invalid
    await waitFor(() => {
      expect(screen.getByTestId("language").textContent).toBe("ja");
    });
  });
});
