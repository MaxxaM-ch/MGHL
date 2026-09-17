import { describe, expect, it } from "vitest";
import { formatCountdown, msUntilNextUtcMidnight } from "./countdown";

describe("msUntilNextUtcMidnight", () => {
  it("returns a full day when it is exactly midnight UTC", () => {
    const now = new Date("2026-09-17T00:00:00.000Z");
    expect(msUntilNextUtcMidnight(now)).toBe(24 * 60 * 60 * 1000);
  });

  it("returns the remaining time before the next UTC midnight", () => {
    const now = new Date("2026-09-17T23:59:00.000Z");
    expect(msUntilNextUtcMidnight(now)).toBe(60 * 1000);
  });

  it("rolls over to the next day at the end of the month", () => {
    const now = new Date("2026-09-30T22:00:00.000Z");
    expect(msUntilNextUtcMidnight(now)).toBe(2 * 60 * 60 * 1000);
  });
});

describe("formatCountdown", () => {
  it("formats hours, minutes and seconds with leading zeros", () => {
    expect(formatCountdown(3661 * 1000)).toBe("01:01:01");
  });

  it("formats zero as 00:00:00", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
  });

  it("clamps negative durations to 00:00:00", () => {
    expect(formatCountdown(-5000)).toBe("00:00:00");
  });
});
