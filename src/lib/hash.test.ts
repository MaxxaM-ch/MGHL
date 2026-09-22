import { describe, expect, it } from "vitest";
import { hashString } from "./hash";

describe("hashString", () => {
  it("is deterministic for the same input", () => {
    expect(hashString("2026-09-21:TOR:x")).toBe(hashString("2026-09-21:TOR:x"));
  });

  it("differs between different inputs", () => {
    expect(hashString("2026-09-21")).not.toBe(hashString("2026-09-22"));
  });

  it("returns a non-negative integer", () => {
    const result = hashString("anything");
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("returns 0 for an empty string", () => {
    expect(hashString("")).toBe(0);
  });
});
