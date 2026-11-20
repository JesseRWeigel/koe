import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Flashcard } from "./flashcard";
import { RatingBar } from "./rating-bar";
import { createNewCard, Rating } from "@/lib/srs";

const card = {
  id: "sample-es-cafe",
  word: "café",
  reading: "",
  meaning: "coffee",
  exampleSentence: "Pido un café.",
  srsCard: createNewCard(),
};

function Review({ onOther, onRate }: { onOther?: () => void; onRate?: (rating: number) => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <>
      <button onClick={onOther}>Other action</button>
      <Flashcard card={card} revealed={revealed} onReveal={() => setRevealed(true)} />
      <RatingBar card={card.srsCard} visible={revealed} onRate={(rating) => onRate?.(rating)} />
    </>
  );
}

afterEach(cleanup);

describe("review flashcard keyboard flow", () => {
  it("tabs to the card, reveals with Enter, announces the example and tabs into ratings", async () => {
    const user = userEvent.setup();
    const onRate = vi.fn();
    render(<Review onRate={onRate} />);
    await user.tab();
    await user.tab();
    const reveal = screen.getByRole("button", { name: /reveal.*café/i });
    expect(reveal).toHaveFocus();
    expect(reveal).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Pido un café.")).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(reveal).toHaveFocus();
    expect(reveal).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("status")).toHaveTextContent("coffee. Pido un café.");
    await user.tab();
    const again = screen.getByRole("button", { name: /again/i });
    expect(again).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onRate).toHaveBeenCalledExactlyOnceWith(Rating.Again);
  });

  it("does not hijack Space when another action has keyboard focus", async () => {
    const user = userEvent.setup();
    const onOther = vi.fn();
    render(<Review onOther={onOther} />);
    await user.tab();
    await user.keyboard(" ");
    expect(onOther).toHaveBeenCalledOnce();
    expect(screen.queryByText("Pido un café.")).not.toBeInTheDocument();
  });

  it("keeps the existing Space shortcut when the page background has focus", async () => {
    const user = userEvent.setup();
    render(<Review />);
    expect(document.body).toHaveFocus();
    await user.keyboard("[Space]");
    expect(screen.getByRole("button", { name: /good/i })).toBeInTheDocument();
  });

  it("preserves pointer reveal", async () => {
    const user = userEvent.setup();
    render(<Review />);
    await user.click(screen.getByText("café"));
    expect(screen.getByRole("button", { name: /good/i })).toBeInTheDocument();
  });

  it("reveals with a single normal Space on the focused native button", async () => {
    const user = userEvent.setup();
    const onReveal = vi.fn();
    render(<Flashcard card={card} revealed={false} onReveal={onReveal} />);
    await user.tab();
    await user.keyboard(" ");
    expect(onReveal).toHaveBeenCalledOnce();
  });
});
