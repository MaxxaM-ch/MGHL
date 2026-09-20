import { describe, expect, it } from "vitest";
import { buildShareGrid, calculateAge, compareGuess, getBlurLevel, isWinningGuess } from "./logic";
import type { GuessFeedback } from "./logic";
import type { NormalizedPlayer } from "../../lib/nhl-api/types";

describe("calculateAge", () => {
  it("computes full years elapsed since the birth date", () => {
    expect(calculateAge("1997-01-13", new Date("2026-09-15T00:00:00Z"))).toBe(29);
  });

  it("does not count the birthday year until it has passed this year", () => {
    expect(calculateAge("1997-12-25", new Date("2026-09-15T00:00:00Z"))).toBe(28);
  });
});

function makePlayer(overrides: Partial<NormalizedPlayer>): NormalizedPlayer {
  return {
    id: 1,
    firstName: "Connor",
    lastName: "McDavid",
    team: "EDM",
    position: "C",
    jerseyNumber: 97,
    nationality: "CAN",
    birthDate: "1997-01-13",
    heightCm: 185,
    draftYear: 2015,
    headshotUrl: "https://example.com/photo.png",
    heroImageUrl: "https://example.com/hero.jpg",
    ...overrides,
  };
}

describe("compareGuess", () => {
  const referenceDate = new Date("2026-09-15T00:00:00Z");

  it("marks categorical attributes as exact when they match", () => {
    const target = makePlayer({ team: "EDM", position: "C", nationality: "CAN" });
    const guess = makePlayer({ team: "EDM", position: "C", nationality: "CAN" });

    const result = compareGuess(guess, target, referenceDate);

    expect(result.team).toEqual({ type: "exact" });
    expect(result.position).toEqual({ type: "exact" });
    expect(result.nationality).toEqual({ type: "exact" });
  });

  it("marks categorical attributes as no-match when they differ", () => {
    const target = makePlayer({ team: "EDM", position: "C", nationality: "CAN" });
    const guess = makePlayer({ team: "TOR", position: "D", nationality: "USA" });

    const result = compareGuess(guess, target, referenceDate);

    expect(result.team).toEqual({ type: "no-match" });
    expect(result.position).toEqual({ type: "no-match" });
    expect(result.nationality).toEqual({ type: "no-match" });
  });

  it("tells the guess to go higher when the target's number is bigger", () => {
    const target = makePlayer({ jerseyNumber: 97 });
    const guess = makePlayer({ jerseyNumber: 10 });

    expect(compareGuess(guess, target, referenceDate).jerseyNumber).toEqual({ type: "higher" });
  });

  it("tells the guess to go lower when the target's number is smaller", () => {
    const target = makePlayer({ jerseyNumber: 10 });
    const guess = makePlayer({ jerseyNumber: 97 });

    expect(compareGuess(guess, target, referenceDate).jerseyNumber).toEqual({ type: "lower" });
  });

  it("marks jersey number exact when equal", () => {
    const target = makePlayer({ jerseyNumber: 97 });
    const guess = makePlayer({ jerseyNumber: 97 });

    expect(compareGuess(guess, target, referenceDate).jerseyNumber).toEqual({ type: "exact" });
  });

  it("marks jersey number as exact when neither player has one", () => {
    const target = makePlayer({ jerseyNumber: null });
    const guess = makePlayer({ jerseyNumber: null });

    expect(compareGuess(guess, target, referenceDate).jerseyNumber).toEqual({ type: "exact" });
  });

  it("marks jersey number as no-match when only one player has one", () => {
    const target = makePlayer({ jerseyNumber: null });
    const guess = makePlayer({ jerseyNumber: 97 });

    expect(compareGuess(guess, target, referenceDate).jerseyNumber).toEqual({ type: "no-match" });
  });

  it("compares age using the older/younger direction of the target", () => {
    const target = makePlayer({ birthDate: "1990-01-01" }); // older
    const guess = makePlayer({ birthDate: "2000-01-01" }); // younger

    expect(compareGuess(guess, target, referenceDate).age).toEqual({ type: "higher" });
  });

  it("compares height with higher/lower/exact", () => {
    const target = makePlayer({ heightCm: 200 });
    const tallerGuess = makePlayer({ heightCm: 180 });
    const shorterGuess = makePlayer({ heightCm: 210 });
    const sameGuess = makePlayer({ heightCm: 200 });

    expect(compareGuess(tallerGuess, target, referenceDate).heightCm).toEqual({ type: "higher" });
    expect(compareGuess(shorterGuess, target, referenceDate).heightCm).toEqual({ type: "lower" });
    expect(compareGuess(sameGuess, target, referenceDate).heightCm).toEqual({ type: "exact" });
  });

  it("compares draft year with higher/lower/exact when both players were drafted", () => {
    const target = makePlayer({ draftYear: 2015 });
    const earlierGuess = makePlayer({ draftYear: 2010 });
    const laterGuess = makePlayer({ draftYear: 2020 });
    const sameGuess = makePlayer({ draftYear: 2015 });

    expect(compareGuess(earlierGuess, target, referenceDate).draftYear).toEqual({ type: "higher" });
    expect(compareGuess(laterGuess, target, referenceDate).draftYear).toEqual({ type: "lower" });
    expect(compareGuess(sameGuess, target, referenceDate).draftYear).toEqual({ type: "exact" });
  });

  it("marks draft year as exact when both players were never drafted", () => {
    const target = makePlayer({ draftYear: null });
    const guess = makePlayer({ draftYear: null });

    expect(compareGuess(guess, target, referenceDate).draftYear).toEqual({ type: "exact" });
  });

  it("marks draft year as no-match when only one of the two was drafted", () => {
    const target = makePlayer({ draftYear: null });
    const guess = makePlayer({ draftYear: 2015 });

    expect(compareGuess(guess, target, referenceDate).draftYear).toEqual({ type: "no-match" });
  });
});

describe("getBlurLevel", () => {
  it("is at its maximum before any attempt", () => {
    expect(getBlurLevel(0, 6)).toBe(24);
  });

  it("reaches zero once all attempts are used", () => {
    expect(getBlurLevel(6, 6)).toBe(0);
  });

  it("decreases linearly between the first and last attempt", () => {
    expect(getBlurLevel(3, 6)).toBe(12);
  });
});

describe("buildShareGrid", () => {
  it("renders one line of colored squares per attempt", () => {
    const exactRow: GuessFeedback = {
      team: { type: "exact" },
      position: { type: "exact" },
      nationality: { type: "exact" },
      jerseyNumber: { type: "exact" },
      age: { type: "exact" },
      heightCm: { type: "exact" },
      draftYear: { type: "exact" },
    };
    const mixedRow: GuessFeedback = {
      team: { type: "no-match" },
      position: { type: "higher" },
      nationality: { type: "lower" },
      jerseyNumber: { type: "exact" },
      age: { type: "no-match" },
      heightCm: { type: "higher" },
      draftYear: { type: "lower" },
    };

    const result = buildShareGrid([mixedRow, exactRow]);

    expect(result).toBe("⬛🟨🟨🟩⬛🟨🟨\n🟩🟩🟩🟩🟩🟩🟩");
  });
});

describe("isWinningGuess", () => {
  it("is true when the guessed player is the target", () => {
    const target = makePlayer({ id: 42 });
    const guess = makePlayer({ id: 42 });

    expect(isWinningGuess(guess, target)).toBe(true);
  });

  it("is false when the guessed player is not the target", () => {
    const target = makePlayer({ id: 42 });
    const guess = makePlayer({ id: 7 });

    expect(isWinningGuess(guess, target)).toBe(false);
  });
});
