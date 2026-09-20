export type GuessStatus = "playing" | "won" | "lost";

export function deriveGuessStatus<T>(
  guesses: T[],
  target: T,
  maxAttempts: number,
  isMatch: (guess: T, target: T) => boolean,
): GuessStatus {
  if (guesses.some((guess) => isMatch(guess, target))) return "won";
  if (guesses.length >= maxAttempts) return "lost";
  return "playing";
}
