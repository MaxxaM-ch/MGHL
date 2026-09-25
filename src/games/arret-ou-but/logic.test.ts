import { describe, expect, it } from "vitest";
import {
  buildShareGrid,
  computeCountdownTickMs,
  computeNextButtonDurationMs,
  getTimerUrgency,
  isCorrectGuess,
} from "./logic";

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

describe("computeCountdownTickMs", () => {
  it("splits the total duration evenly across every tick", () => {
    expect(computeCountdownTickMs(2500, 3)).toBeCloseTo(833.33, 1);
  });

  it("returns the full duration when there is only one tick", () => {
    expect(computeCountdownTickMs(1000, 1)).toBe(1000);
  });
});

describe("getTimerUrgency", () => {
  it("is calm for the first 3 seconds of an 8-second timer", () => {
    expect(getTimerUrgency(8)).toBe("calm");
    expect(getTimerUrgency(7)).toBe("calm");
    expect(getTimerUrgency(6)).toBe("calm");
  });

  it("is a warning for the next 2 seconds", () => {
    expect(getTimerUrgency(5)).toBe("warning");
    expect(getTimerUrgency(4)).toBe("warning");
  });

  it("is urgent for the last 3 seconds", () => {
    expect(getTimerUrgency(3)).toBe("urgent");
    expect(getTimerUrgency(2)).toBe("urgent");
    expect(getTimerUrgency(1)).toBe("urgent");
    expect(getTimerUrgency(0)).toBe("urgent");
  });
});
