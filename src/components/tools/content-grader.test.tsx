import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ContentGrader } from "./content-grader";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// base-ui Button renders two <button> elements in jsdom; grab the first.
function getGradeButton() {
  return screen.getAllByTestId("grade-button")[0];
}

describe("ContentGrader", () => {
  afterEach(() => {
    mockFetch.mockReset();
  });

  it("renders the textarea, language selector, and grade button", () => {
    render(<ContentGrader />);
    expect(screen.getByLabelText(/paste text/i)).toBeInTheDocument();
    expect(getGradeButton()).toBeInTheDocument();
    expect(getGradeButton()).toHaveTextContent(/grade/i);
  });

  it("disables grade button when textarea is empty", () => {
    render(<ContentGrader />);
    expect(getGradeButton()).toBeDisabled();
  });

  it("enables grade button when text is entered", () => {
    render(<ContentGrader />);
    fireEvent.change(screen.getByLabelText(/paste text/i), {
      target: { value: "テスト文章" },
    });
    expect(getGradeButton()).not.toBeDisabled();
  });

  it("displays results after successful grading", async () => {
    const analysis = {
      level: "N4",
      estimatedComprehension: 65,
      wordCount: 42,
      uniqueWords: 30,
      difficultWords: [{ word: "勉強", meaning: "study" }],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(analysis),
    });

    render(<ContentGrader />);
    fireEvent.change(screen.getByLabelText(/paste text/i), {
      target: { value: "日本語のテスト文" },
    });
    fireEvent.click(getGradeButton());

    await waitFor(() => {
      expect(screen.getByText("N4")).toBeInTheDocument();
    });
    expect(screen.getByText(/65%/)).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("勉強")).toBeInTheDocument();
    expect(screen.getByText("study")).toBeInTheDocument();
  });

  it("shows loading state while grading", async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockFetch.mockReturnValueOnce(pendingPromise);

    render(<ContentGrader />);
    fireEvent.change(screen.getByLabelText(/paste text/i), {
      target: { value: "test" },
    });
    fireEvent.click(getGradeButton());

    expect(screen.getByText(/grading/i)).toBeInTheDocument();

    // Clean up
    resolvePromise!({
      ok: true,
      json: () =>
        Promise.resolve({
          level: "A1",
          estimatedComprehension: 90,
          wordCount: 1,
          uniqueWords: 1,
          difficultWords: [],
        }),
    });
    await waitFor(() => {
      expect(screen.queryByText(/grading/i)).not.toBeInTheDocument();
    });
  });

  it("displays an error message when the API call fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Failed to parse analysis" }),
    });

    render(<ContentGrader />);
    fireEvent.change(screen.getByLabelText(/paste text/i), {
      target: { value: "test" },
    });
    fireEvent.click(getGradeButton());

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it("sends correct payload to the API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          level: "A1",
          estimatedComprehension: 90,
          wordCount: 2,
          uniqueWords: 2,
          difficultWords: [],
        }),
    });

    render(<ContentGrader />);
    fireEvent.change(screen.getByLabelText(/paste text/i), {
      target: { value: "hola mundo" },
    });
    fireEvent.click(getGradeButton());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      });
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.text).toBe("hola mundo");
    expect(callBody.language).toBeDefined();
  });
});
