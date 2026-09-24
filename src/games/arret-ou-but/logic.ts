export type Answer = "but" | "arret" | "none";

export function isCorrectGuess(answer: Answer, reponse: "but" | "arret"): boolean {
  return answer === reponse;
}

export function buildShareGrid(results: boolean[]): string {
  return results.map((correct) => (correct ? "✅" : "❌")).join("");
}

// The clip resumes from "gel" on submission and plays uninterrupted through
// "guessReveal" (the real resolution moment) to "fin" — the "Suivant"
// button's fill animation is timed to this exact gap, so it finishes right
// as the clip's own aftermath footage runs out, instead of an arbitrary
// fixed duration disconnected from what's actually on screen.
export function computeNextButtonDurationMs(guessReveal: number, fin: number): number {
  return Math.max(fin - guessReveal, 0) * 1000;
}
