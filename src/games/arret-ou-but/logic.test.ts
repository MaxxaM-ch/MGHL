import { describe, expect, it } from "vitest";
import { buildShareGrid, computeRevealStopSecond, isCorrectGuess } from "./logic";

describe("isCorrectGuess", () => {
  it("is correct when the answer matches the clip's response", () => {
    expect(isCorrectGuess("but", "but")).toBe(true);
  });

  it("is incorrect when the answer differs from the clip's response", () => {
    expect(isCorrectGuess("arret", "but")).toBe(false);
  });

  it("is incorrect when there was no answer at all (timeout with no selection)", () => {
    expect(isCorrectGuess("none", "but")).toBe(false);
  });
});

describe("buildShareGrid", () => {
  it("builds a checkmark/cross grid from a list of results", () => {
    expect(buildShareGrid([true, false, true, true, false])).toBe("✅❌✅✅❌");
  });

  it("returns an empty string for no results", () => {
    expect(buildShareGrid([])).toBe("");
  });
});

describe("computeRevealStopSecond", () => {
  it("stops one second before the clip's resolution timestamp", () => {
    expect(computeRevealStopSecond(21)).toBe(20);
  });

  it("never goes negative for a clip resolving in the first second", () => {
    expect(computeRevealStopSecond(0)).toBe(0);
  });
});
