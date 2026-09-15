import type { NormalizedPlayer } from "../../lib/nhl-api/types";

export function calculateAge(birthDate: string, referenceDate: Date): number {
  const birth = new Date(birthDate);
  let age = referenceDate.getUTCFullYear() - birth.getUTCFullYear();

  const hasHadBirthdayThisYear =
    referenceDate.getUTCMonth() > birth.getUTCMonth() ||
    (referenceDate.getUTCMonth() === birth.getUTCMonth() &&
      referenceDate.getUTCDate() >= birth.getUTCDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
}

const ATTRIBUTE_ORDER: (keyof GuessFeedback)[] = [
  "team",
  "position",
  "nationality",
  "jerseyNumber",
  "age",
  "heightCm",
  "draftYear",
];

function squareFor(comparison: AttributeComparison): string {
  switch (comparison.type) {
    case "exact":
      return "🟩";
    case "higher":
    case "lower":
      return "🟨";
    case "no-match":
      return "⬛";
  }
}

export function buildShareGrid(attempts: GuessFeedback[]): string {
  return attempts
    .map((feedback) => ATTRIBUTE_ORDER.map((key) => squareFor(feedback[key])).join(""))
    .join("\n");
}

export function isWinningGuess(guess: NormalizedPlayer, target: NormalizedPlayer): boolean {
  return guess.id === target.id;
}

const MAX_BLUR_PX = 24;

export function getBlurLevel(attemptNumber: number, maxAttempts: number): number {
  const remainingRatio = (maxAttempts - attemptNumber) / maxAttempts;
  return MAX_BLUR_PX * remainingRatio;
}

export type AttributeComparison =
  | { type: "exact" }
  | { type: "higher" }
  | { type: "lower" }
  | { type: "no-match" };

export interface GuessFeedback {
  team: AttributeComparison;
  position: AttributeComparison;
  nationality: AttributeComparison;
  jerseyNumber: AttributeComparison;
  age: AttributeComparison;
  heightCm: AttributeComparison;
  draftYear: AttributeComparison;
}

function compareCategorical(guessValue: string, targetValue: string): AttributeComparison {
  return guessValue === targetValue ? { type: "exact" } : { type: "no-match" };
}

function compareOrdinal(guessValue: number, targetValue: number): AttributeComparison {
  if (guessValue === targetValue) return { type: "exact" };
  return targetValue > guessValue ? { type: "higher" } : { type: "lower" };
}

function compareDraftYear(
  guessDraftYear: number | null,
  targetDraftYear: number | null,
): AttributeComparison {
  if (guessDraftYear === null && targetDraftYear === null) {
    return { type: "exact" };
  }
  if (guessDraftYear === null || targetDraftYear === null) {
    return { type: "no-match" };
  }
  return compareOrdinal(guessDraftYear, targetDraftYear);
}

export function compareGuess(
  guess: NormalizedPlayer,
  target: NormalizedPlayer,
  referenceDate: Date,
): GuessFeedback {
  return {
    team: compareCategorical(guess.team, target.team),
    position: compareCategorical(guess.position, target.position),
    nationality: compareCategorical(guess.nationality, target.nationality),
    jerseyNumber: compareOrdinal(guess.jerseyNumber, target.jerseyNumber),
    age: compareOrdinal(
      calculateAge(guess.birthDate, referenceDate),
      calculateAge(target.birthDate, referenceDate),
    ),
    heightCm: compareOrdinal(guess.heightCm, target.heightCm),
    draftYear: compareDraftYear(guess.draftYear, target.draftYear),
  };
}
