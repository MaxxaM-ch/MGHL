import { describe, expect, it } from "vitest";
import { buildShareGrid, computeNextButtonDurationMs, isCorrectGuess } from "./logic";

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

describe("computeNextButtonDurationMs", () => {
  it("converts the guessReveal-to-fin gap into milliseconds", () => {
    expect(computeNextButtonDurationMs(25, 28)).toBe(3000);
  });

  it("never goes negative if fin is at or before guessReveal", () => {
    expect(computeNextButtonDurationMs(25, 25)).toBe(0);
    expect(computeNextButtonDurationMs(25, 24)).toBe(0);
  });
});
