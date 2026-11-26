import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { KanjiBrowser } from "./kanji-browser";

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
