import { describe, it, expect } from "vitest";
import { render, screen, act, within } from "@testing-library/react";
import { CognateBrowser } from "./cognate-browser";

/**
 * React 19 + jsdom requires the native value setter + input event
 * to correctly trigger controlled input onChange handlers.
 */
function typeIntoInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("CognateBrowser", () => {
  it("renders the tabs and search input", () => {
    const { container } = render(<CognateBrowser />);
    expect(container.querySelector("input")).toBeInTheDocument();
    expect(screen.getByText(/all cognates/i)).toBeInTheDocument();
    expect(screen.getByText(/false friends/i)).toBeInTheDocument();
  });

  it("shows cognate cards on initial render", () => {
    const { container } = render(<CognateBrowser />);
    const view = within(container);
    const casaElements = view.getAllByText("casa");
    expect(casaElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows both Spanish and Portuguese words in cards", () => {
    const { container } = render(<CognateBrowser />);
    const view = within(container);
    const libroElements = view.getAllByText("libro");
    const livroElements = view.getAllByText("livro");
    expect(libroElements.length).toBeGreaterThanOrEqual(1);
    expect(livroElements.length).toBeGreaterThanOrEqual(1);
  });

  it("displays True Cognate badges", () => {
    const { container } = render(<CognateBrowser />);
    const view = within(container);
    const badges = view.getAllByText("True Cognate");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("displays False Friend badges", () => {
    const { container } = render(<CognateBrowser />);
    const view = within(container);
    const badges = view.getAllByText("False Friend");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("filters results when searching", () => {
    const { container } = render(<CognateBrowser />);
    const view = within(container);
    const input = container.querySelector("input")! as HTMLInputElement;
    act(() => {
      typeIntoInput(input, "embarazada");
    });
    const matches = view.queryAllByText("embarazada");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    // Unrelated cognates should not appear
    expect(view.queryAllByText("agua")).toHaveLength(0);
  });

  it("shows false friend notes/explanations", () => {
    const { container } = render(<CognateBrowser />);
    const view = within(container);
    const input = container.querySelector("input")! as HTMLInputElement;
    act(() => {
      typeIntoInput(input, "embarazada");
    });
    const notes = view.getAllByText(/in spanish this means pregnant/i);
    expect(notes.length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when search has no results", () => {
    const { container } = render(<CognateBrowser />);
    const view = within(container);
    const input = container.querySelector("input")! as HTMLInputElement;
    act(() => {
      typeIntoInput(input, "xyznonexistent");
    });
    expect(view.getByText(/no cognates found/i)).toBeInTheDocument();
  });
});
