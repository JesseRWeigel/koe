import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { KanjiBrowser } from "./kanji-browser";

afterEach(cleanup);
it("returns to the selected JLPT level after clearing a search", () => {
  render(<KanjiBrowser />);
  fireEvent.click(screen.getByRole("tab", { name: "N4" }));
  expect(screen.getByRole("tab", { name: "N4", selected: true })).toBeTruthy();

  const search = screen.getByRole("textbox", { name: "Search kanji" });
  fireEvent.change(search, { target: { value: "水" } });
  expect(screen.getByRole("heading", { name: /^[1-9]\d* results?$/ })).toBeTruthy();

  fireEvent.change(search, { target: { value: "" } });
  expect(screen.getByRole("tab", { name: "N4", selected: true })).toBeTruthy();

  fireEvent.change(search, { target: { value: "　" } });
  expect(screen.getByRole("tab", { name: "N4", selected: true })).toBeTruthy();

  fireEvent.change(search, { target: { value: "" } });
  expect(screen.getByRole("tab", { name: "N4", selected: true })).toBeTruthy();
});

it("marks Japanese text for speech and makes a missing reading explicit", () => {
  render(<KanjiBrowser />);
  fireEvent.change(screen.getByRole("textbox", { name: "Search kanji" }), {
    target: { value: "百" },
  });

  const card = screen.getByText("百", { exact: true }).closest("button")!;
  expect(card.textContent).not.toContain("/");
  expect(within(card).getByText("百")).toHaveAttribute("lang", "ja");
  expect(within(card).getByText("ヒャク")).toHaveAttribute("lang", "ja");

  fireEvent.click(card);
  const detail = screen.getByRole("dialog");
  const inDetail = within(detail);
  expect(inDetail.getByText("ヒャク, ビャク")).toHaveAttribute("lang", "ja");
  expect(inDetail.getByText("Not listed")).not.toHaveAttribute("lang");
  expect(inDetail.getByText("三百")).toHaveAttribute("lang", "ja");
  expect(inDetail.getByText("(さんびゃく)")).toHaveAttribute("lang", "ja");
  expect(inDetail.getByText(/three hundred/i)).not.toHaveAttribute("lang");
});
