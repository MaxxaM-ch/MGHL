import { describe, expect, it } from "vitest";
import { isWinningGuess, pickDailyFocusPoint, computeZoomTransform, buildShareGrid, type ContentBounds } from "./logic";

describe("isWinningGuess", () => {
  it("returns true when the guessed abbreviation matches the target", () => {
    expect(isWinningGuess("TOR", "TOR")).toBe(true);
  });

  it("returns false when the guessed abbreviation differs from the target", () => {
    expect(isWinningGuess("TOR", "MTL")).toBe(false);
  });
});

describe("pickDailyFocusPoint", () => {
  const bounds: ContentBounds = { x: 0.2, y: 0.3, width: 0.4, height: 0.5 };

  it("is deterministic for the same date and team", () => {
    const a = pickDailyFocusPoint("2026-09-21", "TOR", bounds);
    const b = pickDailyFocusPoint("2026-09-21", "TOR", bounds);
    expect(a).toEqual(b);
  });

  it("returns a point inside the given bounds", () => {
    const point = pickDailyFocusPoint("2026-09-21", "TOR", bounds);
    expect(point.x).toBeGreaterThanOrEqual(bounds.x);
    expect(point.x).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(point.y).toBeGreaterThanOrEqual(bounds.y);
    expect(point.y).toBeLessThanOrEqual(bounds.y + bounds.height);
  });

  it("returns a point inside the bounds across many date/team combinations", () => {
    const teams = ["TOR", "MTL", "BOS", "VAN", "UTA", "SEA"];
    for (let day = 1; day <= 28; day++) {
      const dateKey = `2026-01-${String(day).padStart(2, "0")}`;
      for (const team of teams) {
        const point = pickDailyFocusPoint(dateKey, team, bounds);
        expect(point.x).toBeGreaterThanOrEqual(bounds.x);
        expect(point.x).toBeLessThanOrEqual(bounds.x + bounds.width);
        expect(point.y).toBeGreaterThanOrEqual(bounds.y);
        expect(point.y).toBeLessThanOrEqual(bounds.y + bounds.height);
      }
    }
  });

  it("differs between two different teams on the same date", () => {
    const a = pickDailyFocusPoint("2026-09-21", "TOR", bounds);
    const b = pickDailyFocusPoint("2026-09-21", "MTL", bounds);
    expect(a).not.toEqual(b);
  });
});

describe("computeZoomTransform", () => {
  const focusPoint = { x: 0.3, y: 0.7 };

  it("scales at x5 with the focus point translated to center at the first attempt", () => {
    const result = computeZoomTransform(0, 6, focusPoint);
    expect(result.scale).toBe(5);
    expect(result.translateXPercent).toBeCloseTo(20);
    expect(result.translateYPercent).toBeCloseTo(-20);
  });

  it("scales to 0.9 with no translation (centered on the whole logo) at the last attempt", () => {
    const result = computeZoomTransform(5, 6, focusPoint);
    expect(result.scale).toBeCloseTo(0.9);
    expect(result.translateXPercent).toBeCloseTo(0);
    expect(result.translateYPercent).toBeCloseTo(0);
  });

  it("interpolates linearly between the first and last attempt", () => {
    const result = computeZoomTransform(2, 6, focusPoint);
    // t = 2/5 = 0.4 -> scale = 5 + (0.9 - 5) * 0.4 = 3.36
    expect(result.scale).toBeCloseTo(3.36);
    // effectiveX = 0.3 + (0.5-0.3)*0.4 = 0.38 -> translateX = (0.5-0.38)*100 = 12
    expect(result.translateXPercent).toBeCloseTo(12);
    // effectiveY = 0.7 + (0.5-0.7)*0.4 = 0.62 -> translateY = (0.5-0.62)*100 = -12
    expect(result.translateYPercent).toBeCloseTo(-12);
  });

  it("does not divide by zero when maxAttempts is 1", () => {
    const result = computeZoomTransform(0, 1, focusPoint);
    expect(Number.isFinite(result.scale)).toBe(true);
    expect(Number.isFinite(result.translateXPercent)).toBe(true);
    expect(Number.isFinite(result.translateYPercent)).toBe(true);
  });
});

describe("buildShareGrid", () => {
  it("marks every attempt as wrong except a winning last attempt", () => {
    expect(buildShareGrid(3, true)).toBe("🟥\n🟥\n🟩");
  });

  it("marks every attempt as wrong on a loss", () => {
    expect(buildShareGrid(6, false)).toBe("🟥\n🟥\n🟥\n🟥\n🟥\n🟥");
  });

  it("handles a first-attempt win", () => {
    expect(buildShareGrid(1, true)).toBe("🟩");
  });
});
