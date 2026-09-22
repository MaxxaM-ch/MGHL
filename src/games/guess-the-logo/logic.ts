export function isWinningGuess(guess: string, target: string): boolean {
  return guess === target;
}

export interface ContentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function hashToUnitFloat(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash % 10000) / 10000;
}

export function pickDailyFocusPoint(
  dateKey: string,
  abbrev: string,
  bounds: ContentBounds,
): { x: number; y: number } {
  const fracX = hashToUnitFloat(`${dateKey}:${abbrev}:x`);
  const fracY = hashToUnitFloat(`${dateKey}:${abbrev}:y`);
  return {
    x: bounds.x + fracX * bounds.width,
    y: bounds.y + fracY * bounds.height,
  };
}

const START_SCALE = 5;
const END_SCALE = 0.9; // the logo fills 90% of its box at the final attempt, not 100%

export function computeZoomTransform(
  attemptIndex: number,
  maxAttempts: number,
  focusPoint: { x: number; y: number },
): { scale: number; translateXPercent: number; translateYPercent: number } {
  const t = maxAttempts > 1 ? Math.min(Math.max(attemptIndex / (maxAttempts - 1), 0), 1) : 1;
  const scale = START_SCALE + (END_SCALE - START_SCALE) * t;
  const effectiveX = focusPoint.x + (0.5 - focusPoint.x) * t;
  const effectiveY = focusPoint.y + (0.5 - focusPoint.y) * t;
  const translateXPercent = (0.5 - effectiveX) * 100;
  const translateYPercent = (0.5 - effectiveY) * 100;
  return { scale, translateXPercent, translateYPercent };
}

const MAX_BLUR_PX = 24;

// Uses attemptCount (0 before any guess), not attemptIndex — unlike
// computeZoomTransform, there's no "current attempt slot" here, just how
// many guesses have been used so far.
export function getBlurLevel(attemptCount: number, maxAttempts: number): number {
  const remainingRatio = (maxAttempts - attemptCount) / maxAttempts;
  return MAX_BLUR_PX * remainingRatio;
}

// Fully grayscale before any guess, ramping up to full color by the last
// attempt — removes the "distinctive team color" shortcut alongside the
// blur, so an early guess can't be based on color alone.
export function getSaturationLevel(attemptCount: number, maxAttempts: number): number {
  return (attemptCount / maxAttempts) * 100;
}

export function buildShareGrid(attemptCount: number, won: boolean): string {
  return Array.from({ length: attemptCount }, (_, i) => (won && i === attemptCount - 1 ? "🟩" : "🟥")).join("\n");
}
