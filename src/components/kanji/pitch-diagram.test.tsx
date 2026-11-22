import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PitchDiagram } from "./pitch-diagram";

describe("PitchDiagram", () => {
  it.each([
    ["flat", 0, [45, 15, 15, 15], "high"],
    ["tail-high", 3, [45, 15, 15, 45], "low"],
    ["head-high", 1, [15, 45, 45, 45], "low"],
    ["middle-high", 2, [45, 15, 45, 45], "low"],
  ] as const)("shows the following particle for a %s word", (_, accentPosition, heights, particlePitch) => {
    const { container } = render(
      <PitchDiagram morae={["あ", "た", "ま"]} accentPosition={accentPosition} showExampleParticle />
    );
    const svg = within(container).getByRole("img", {
      name: `Pitch diagram: あたま. Following particle が: ${particlePitch}.`,
    });
    expect(Array.from(svg.querySelectorAll("circle"), dot => Number(dot.getAttribute("cy")))).toEqual(heights);
    expect(svg.querySelector("line:last-of-type")).toHaveAttribute("stroke-dasharray");
    expect(within(svg).getByText("が")).toBeInTheDocument();
  });
  it("does not add a particle to word-only diagrams", () => {
    const { getByRole } = render(
      <PitchDiagram morae={["あ", "た", "ま"]} accentPosition={3} />
    );
    const svg = getByRole("img", { name: "Pitch diagram: あたま" });
    expect(svg.querySelectorAll("circle")).toHaveLength(3);
    expect(within(svg).queryByText("が")).not.toBeInTheDocument();
  });
});
