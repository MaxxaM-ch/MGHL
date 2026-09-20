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
});

describe("formatDateKey", () => {
  it("formats a date as its UTC calendar day", () => {
    expect(formatDateKey(new Date("2026-09-15T23:59:00Z"))).toBe("2026-09-15");
  });

  it("does not shift across a UTC day boundary", () => {
    expect(formatDateKey(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01-01");
  });
});
