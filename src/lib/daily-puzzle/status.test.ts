import { describe, expect, it } from "vitest";
import { deriveGuessStatus } from "./status";

const isMatch = (guess: number, target: number) => guess === target;

describe("deriveGuessStatus", () => {
  it("is playing when no guess has matched and attempts remain", () => {
    expect(deriveGuessStatus([2, 3], 1, 6, isMatch)).toBe("playing");
  });

  it("is won when one of the guesses matches the target", () => {
    expect(deriveGuessStatus([2, 1], 1, 6, isMatch)).toBe("won");
  });

  it("is lost when the attempt limit is reached without a match", () => {
    expect(deriveGuessStatus([2, 3, 4, 5, 6, 7], 1, 6, isMatch)).toBe("lost");
  });

  it("prefers won over lost when the winning guess is also the last attempt", () => {
    expect(deriveGuessStatus([2, 3, 4, 5, 6, 1], 1, 6, isMatch)).toBe("won");
  });

  it("works with non-numeric guesses via the provided comparator", () => {
    const isSameTeam = (guess: string, target: string) => guess === target;
    expect(deriveGuessStatus(["TOR", "EDM"], "EDM", 6, isSameTeam)).toBe("won");
  });
});
