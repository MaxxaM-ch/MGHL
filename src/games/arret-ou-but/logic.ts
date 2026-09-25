export type Answer = "but" | "arret" | "none";

export interface ClipResult {
  youtubeId: string;
  answer: Answer;
  correct: boolean;
}

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

// Splits a total real duration evenly across a fixed number of displayed
// ticks (e.g. "3, 2, 1" shown over a shorter total than 3 real seconds) —
// dividing the two lets the pre-clip countdown feel snappier than a plain
// one-second-per-number timer while still showing a familiar 3/2/1 count.
export function computeCountdownTickMs(totalMs: number, tickCount: number): number {
  return totalMs / tickCount;
}

export type TimerUrgency = "calm" | "warning" | "urgent";

// Thresholds are absolute remaining-second values, not fractions of the
// timer's total duration — this game's answer timer is always 8 seconds,
// so a fixed 3/2/3 split (calm/warning/urgent) is simpler than a
// percentage-based one that would need the total passed in for no benefit.
export function getTimerUrgency(secondsLeft: number): TimerUrgency {
  if (secondsLeft >= 6) return "calm";
  if (secondsLeft >= 4) return "warning";
  return "urgent";
}
