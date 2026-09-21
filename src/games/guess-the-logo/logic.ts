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
): { scale: number; originXPercent: number; originYPercent: number } {
  const t = maxAttempts > 1 ? attemptIndex / (maxAttempts - 1) : 1;
  const scale = START_SCALE + (END_SCALE - START_SCALE) * t;
  const originXPercent = (focusPoint.x + (0.5 - focusPoint.x) * t) * 100;
  const originYPercent = (focusPoint.y + (0.5 - focusPoint.y) * t) * 100;
  return { scale, originXPercent, originYPercent };
}

export function buildShareGrid(attemptCount: number, won: boolean): string {
  return Array.from({ length: attemptCount }, (_, i) => (won && i === attemptCount - 1 ? "🟩" : "🟥")).join("\n");
}
