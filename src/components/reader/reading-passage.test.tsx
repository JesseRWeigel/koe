import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReadingPassage } from "./reading-passage";
import { addWord, getWords, resetStore } from "@/lib/vocabulary/store";
import { getDueVocabCards, updateSrsCardState } from "@/lib/srs/srs-storage";
import { createNewCard } from "@/lib/srs";

describe("Spanish reader vocabulary handoff", () => {
  afterEach(cleanup);
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it("keeps punctuation readable and saves exactly the clicked word's sentence for review", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ReadingPassage content={"Una visita\n\n¿Dónde está el café? El museo está lejos."} canSaveSpanish />
    );
    expect(container.querySelector("p")?.textContent)
      .toBe("¿Dónde está el café? El museo está lejos.");
    await user.click(screen.getByRole("button", { name: "café" }));
    const form = screen.getByRole("dialog");
    await user.type(within(form).getByLabelText("Meaning"), "coffee");
    await user.click(within(form).getByRole("button", { name: "Save to vocabulary" }));
    expect(within(form).getByRole("status")).toHaveTextContent("Saved with its sentence.");
    await user.click(within(form).getByRole("button", { name: "Save to vocabulary" }));
    expect(within(form).getByRole("status")).toHaveTextContent("Already saved with this sentence.");

    resetStore();
    const saved = getWords("es");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ word: "café", meaning: "coffee", contextSentences: ["¿Dónde está el café?"] });
    expect(getWords("ja")).toEqual([]);
    expect(getDueVocabCards(saved).map(({ id }) => id)).toEqual([saved[0].id]);
  });

  it("merges a later sentence without replacing an existing gloss, language, ID or review schedule", async () => {
    const user = userEvent.setup();
    const base = addWord({
      word: "Cafe\u0301", languageCode: "es", meaning: "coffee shop", partOfSpeech: "noun",
      reading: null, contextSentences: ["Voy al café."], tags: ["food"],
    });
    addWord({
      word: "café", languageCode: "pt-BR", meaning: "coffee", partOfSpeech: "noun",
      reading: null, contextSentences: ["Bebo café."], tags: [],
    });
    const future = new Date("2099-01-01T00:00:00Z");
    updateSrsCardState(base.id, { ...createNewCard(), due: future });

    render(<ReadingPassage content={"Una visita\n\n¿Dónde está el café?"} canSaveSpanish />);
    await user.click(screen.getByRole("button", { name: "café" }));
    await user.type(screen.getByLabelText("Meaning"), "unused replacement");
    await user.click(screen.getByRole("button", { name: "Save to vocabulary" }));

    resetStore();
    expect(getWords("es")).toEqual([{ ...base, contextSentences: ["Voy al café.", "¿Dónde está el café?"] }]);
    expect(getWords("pt-BR")[0].contextSentences).toEqual(["Bebo café."]);
    expect(getDueVocabCards(getWords("es"))).toEqual([]);
  });

  it("does not report success or create an in-memory card when storage fails, then retries once", async () => {
    const user = userEvent.setup();
    render(<ReadingPassage content={"Una visita\n\nUn café."} canSaveSpanish />);
    await user.click(screen.getByRole("button", { name: "café" }));
    await user.type(screen.getByLabelText("Meaning"), "coffee");
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    try {
      const save = screen.getByRole("button", { name: "Save to vocabulary" });
      await user.click(save);
      expect(screen.getByRole("alert")).toHaveTextContent("Try again");
      expect(getWords("es")).toEqual([]);
      await user.click(save);
      expect(screen.getByRole("status")).toHaveTextContent("Saved");
      resetStore();
      expect(getWords("es")).toHaveLength(1);
    } finally {
      write.mockRestore();
    }
  });

  it("preserves unreadable storage rather than overwriting it with a new word", async () => {
    const user = userEvent.setup();
    localStorage.setItem("koe-vocabulary", "{corrupt");
    render(<ReadingPassage content={"Una visita\n\nUn café."} canSaveSpanish />);
    await user.click(screen.getByRole("button", { name: "café" }));
    await user.type(screen.getByLabelText("Meaning"), "coffee");
    await user.click(screen.getByRole("button", { name: "Save to vocabulary" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
    expect(localStorage.getItem("koe-vocabulary")).toBe("{corrupt");
  });

  it("offers no vocabulary capture for passages outside the Spanish slice", async () => {
    const user = userEvent.setup();
    render(<ReadingPassage content={"Café\n\nUm café."} />);
    await user.click(screen.getByRole("button", { name: "café." }));
    expect(screen.getByRole("dialog")).toHaveTextContent(/dictionary coming soon/i);
    expect(screen.queryByRole("button", { name: "Save to vocabulary" })).toBeNull();
  });
});
