import { describe, expect, it } from "vitest";
import { formatDateKey, pickDailyItem, pickDailyItems } from "./seed";

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

describe("pickDailyItems", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g", "h"];

  it("is deterministic for the same date", () => {
    const date = new Date("2026-09-23T00:00:00Z");
    expect(pickDailyItems(items, date, 5)).toEqual(pickDailyItems(items, date, 5));
  });

  it("returns the requested number of items", () => {
    const date = new Date("2026-09-23T00:00:00Z");
    expect(pickDailyItems(items, date, 5)).toHaveLength(5);
  });

  it("returns distinct items, never repeating one within the same pick", () => {
    const date = new Date("2026-09-23T00:00:00Z");
    const picked = pickDailyItems(items, date, 5);
    expect(new Set(picked).size).toBe(5);
  });

  it("differs between two different dates", () => {
    const dateA = new Date("2026-09-23T00:00:00Z");
    const dateB = new Date("2026-09-24T00:00:00Z");
    expect(pickDailyItems(items, dateA, 5)).not.toEqual(pickDailyItems(items, dateB, 5));
  });

  it("clamps to the pool size when count exceeds the number of available items", () => {
    const date = new Date("2026-09-23T00:00:00Z");
    expect(pickDailyItems(items, date, 20)).toHaveLength(items.length);
  });

  it("throws when given an empty list", () => {
    expect(() => pickDailyItems([], new Date("2026-09-23T00:00:00Z"), 5)).toThrow();
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
