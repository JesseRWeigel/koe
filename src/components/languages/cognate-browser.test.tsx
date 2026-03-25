import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CognateBrowser } from "./cognate-browser";

function getSearchInput(): HTMLInputElement {
  return screen.getAllByPlaceholderText(/search cognates/i)[0] as HTMLInputElement;
}

describe("CognateBrowser", () => {
  it("renders the tabs and search input", () => {
    render(<CognateBrowser />);
    expect(getSearchInput()).toBeInTheDocument();
    expect(screen.getByText(/all cognates/i)).toBeInTheDocument();
    expect(screen.getByText(/false friends/i)).toBeInTheDocument();
  });

  it("shows cognate cards on initial render", () => {
    render(<CognateBrowser />);
    const casaElements = screen.getAllByText("casa");
    expect(casaElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows both Spanish and Portuguese words in cards", () => {
    render(<CognateBrowser />);
    const libroElements = screen.getAllByText("libro");
    const livroElements = screen.getAllByText("livro");
    expect(libroElements.length).toBeGreaterThanOrEqual(1);
    expect(livroElements.length).toBeGreaterThanOrEqual(1);
  });

  it("displays True Cognate badges", () => {
    render(<CognateBrowser />);
    const badges = screen.getAllByText("True Cognate");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("displays False Friend badges", () => {
    render(<CognateBrowser />);
    const badges = screen.getAllByText("False Friend");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("filters results when searching", async () => {
    const user = userEvent.setup();
    render(<CognateBrowser />);
    const input = getSearchInput();
    await user.clear(input);
    await user.type(input, "embarazada");
    const matches = screen.queryAllByText("embarazada");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    // Unrelated cognates should not appear
    expect(screen.queryAllByText("agua")).toHaveLength(0);
  });

  it("shows false friend notes/explanations", async () => {
    const user = userEvent.setup();
    render(<CognateBrowser />);
    const input = getSearchInput();
    await user.clear(input);
    await user.type(input, "embarazada");
    const notes = screen.getAllByText(/in spanish this means pregnant/i);
    expect(notes.length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when search has no results", async () => {
    const user = userEvent.setup();
    render(<CognateBrowser />);
    const input = getSearchInput();
    await user.clear(input);
    await user.type(input, "xyznonexistent");
    expect(screen.getByText(/no cognates found/i)).toBeInTheDocument();
  });
});
