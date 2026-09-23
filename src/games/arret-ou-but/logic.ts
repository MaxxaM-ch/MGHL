export type Answer = "but" | "arret" | "none";

export function isCorrectGuess(answer: Answer, reponse: "but" | "arret"): boolean {
  return answer === reponse;
}

export function buildShareGrid(results: boolean[]): string {
  return results.map((correct) => (correct ? "✅" : "❌")).join("");
}

// The clip resumes from "gel" on submission and plays until just before its
// real resolution, so the reveal badge (which appears on a fixed 2s timer,
// independent of this) never gets upstaged by the video itself showing the
// outcome first.
export function computeRevealStopSecond(fin: number): number {
  return Math.max(fin - 1, 0);
}
