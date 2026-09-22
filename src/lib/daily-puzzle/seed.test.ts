import { describe, expect, it } from "vitest";
import { formatDateKey, pickDailyItem } from "./seed";

describe("pickDailyItem", () => {
  it("returns the same item for the same date across multiple calls", () => {
    const items = ["a", "b", "c", "d", "e"];
    const date = new Date("2026-09-15T00:00:00Z");

    const first = pickDailyItem(items, date);
    const second = pickDailyItem(items, date);

    expect(first).toBe(second);
  });

  it("returns an item that belongs to the list", () => {
    const items = ["a", "b", "c", "d", "e"];
    const date = new Date("2026-09-15T00:00:00Z");

    const result = pickDailyItem(items, date);

    expect(items).toContain(result);
  });

  it("returns different items for different dates (over a large enough list)", () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const dateA = new Date("2026-09-15T00:00:00Z");
    const dateB = new Date("2026-09-16T00:00:00Z");

    const resultA = pickDailyItem(items, dateA);
    const resultB = pickDailyItem(items, dateB);

    expect(resultA).not.toBe(resultB);
  });

  it("throws when given an empty list", () => {
    expect(() => pickDailyItem([], new Date("2026-09-15T00:00:00Z"))).toThrow();
  });

  it("distributes picks roughly uniformly over a year on a small list", () => {
    const items = Array.from({ length: 32 }, (_, i) => i);
    const counts = new Array(items.length).fill(0);

    let date = new Date("2026-01-01T00:00:00Z");
    const end = new Date("2027-01-01T00:00:00Z");
    let dayCount = 0;
    while (date < end) {
      const result = pickDailyItem(items, date);
      counts[result] += 1;
      dayCount += 1;
      date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    }

    const average = dayCount / items.length;

    expect(Math.min(...counts)).toBeGreaterThan(0);
    expect(Math.max(...counts)).toBeLessThan(average * 3);
  });

  it("does not walk the list sequentially on consecutive days", () => {
    const items = Array.from({ length: 32 }, (_, i) => i);
    const dateA = new Date("2026-09-15T00:00:00Z");
    const dateB = new Date("2026-09-16T00:00:00Z");

    const indexA = items.indexOf(pickDailyItem(items, dateA));
    const indexB = items.indexOf(pickDailyItem(items, dateB));

    expect(Math.abs(indexB - indexA)).not.toBe(1);
  });
});

describe("formatDateKey", () => {
  it("formats a date as its UTC calendar day", () => {
    expect(formatDateKey(new Date("2026-09-15T23:59:00Z"))).toBe("2026-09-15");
  });

  it("does not shift across a UTC day boundary", () => {
    expect(formatDateKey(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01-01");
  });
});
