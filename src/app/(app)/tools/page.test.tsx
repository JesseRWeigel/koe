import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import ToolsPage from "./page";

// Mock the language context
const mockLanguage = vi.fn<() => string>().mockReturnValue("ja");
vi.mock("@/lib/context/language-context", () => ({
  useLanguage: () => ({ language: mockLanguage(), setLanguage: vi.fn() }),
}));

// Mock the child components to isolate page-level logic
vi.mock("@/components/tools/content-grader", () => ({
  ContentGrader: () => <div data-testid="content-grader">ContentGrader</div>,
}));

vi.mock("@/components/languages/cognate-browser", () => ({
  CognateBrowser: () => (
    <div data-testid="cognate-browser">CognateBrowser</div>
  ),
}));

// Mock sidebar components that need a SidebarProvider
vi.mock("@/components/ui/sidebar", () => ({
  SidebarTrigger: () => <button>menu</button>,
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

// Stub fetch for any child components that might call it
vi.stubGlobal("fetch", vi.fn());

describe("ToolsPage language filtering", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockLanguage.mockReturnValue("ja");
  });

  it("always shows the Content Difficulty Grader regardless of language", () => {
    for (const lang of ["ja", "es", "pt-BR", "fr"]) {
      mockLanguage.mockReturnValue(lang);
      const { unmount } = render(<ToolsPage />);
      expect(screen.getByTestId("content-grader")).toBeInTheDocument();
      unmount();
    }
  });

  it("shows Cognates Browser when Spanish is active", () => {
    mockLanguage.mockReturnValue("es");
    render(<ToolsPage />);
    expect(screen.getByTestId("cognate-browser")).toBeInTheDocument();
    expect(screen.getByText(/Spanish .* Portuguese Cognates/)).toBeInTheDocument();
  });

  it("shows Cognates Browser when Portuguese is active", () => {
    mockLanguage.mockReturnValue("pt-BR");
    render(<ToolsPage />);
    expect(screen.getByTestId("cognate-browser")).toBeInTheDocument();
  });

  it("hides Cognates Browser when Japanese is active", () => {
    mockLanguage.mockReturnValue("ja");
    render(<ToolsPage />);
    expect(screen.queryByTestId("cognate-browser")).not.toBeInTheDocument();
  });

  it("hides Cognates Browser when French is active", () => {
    mockLanguage.mockReturnValue("fr");
    render(<ToolsPage />);
    expect(screen.queryByTestId("cognate-browser")).not.toBeInTheDocument();
  });

  it("shows a note when no language-specific tools are available", () => {
    mockLanguage.mockReturnValue("ja");
    render(<ToolsPage />);
    expect(
      screen.getByText(/language-specific tools/i),
    ).toBeInTheDocument();
  });
});
