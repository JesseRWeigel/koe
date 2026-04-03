import { describe, it, expect } from "vitest";
import { getGuide } from "./index";

describe("getGuide", () => {
  it("returns Japanese guide sections with titles and content", () => {
    const guide = getGuide("ja");
    expect(guide).not.toBeNull();
    expect(guide!.length).toBeGreaterThan(0);
    for (const section of guide!) {
      expect(section.title).toBeTruthy();
      expect(typeof section.title).toBe("string");
      expect(section.content).toBeTruthy();
      expect(typeof section.content).toBe("string");
    }
  });

  it("returns Spanish guide", () => {
    const guide = getGuide("es");
    expect(guide).not.toBeNull();
    expect(guide!.length).toBeGreaterThan(0);
    expect(guide![0].title).toContain("Spanish");
  });

  it("returns French guide", () => {
    const guide = getGuide("fr");
    expect(guide).not.toBeNull();
    expect(guide!.length).toBeGreaterThan(0);
  });

  it("returns Portuguese guide", () => {
    const guide = getGuide("pt-BR");
    expect(guide).not.toBeNull();
    expect(guide!.length).toBeGreaterThan(0);
  });

  it("returns null for unknown language", () => {
    const guide = getGuide("xx");
    expect(guide).toBeNull();
  });

  it("Japanese guide has at least 4 sections", () => {
    const guide = getGuide("ja");
    expect(guide).not.toBeNull();
    expect(guide!.length).toBeGreaterThanOrEqual(4);
  });
});
