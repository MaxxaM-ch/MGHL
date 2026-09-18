// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { getDailyProgress, saveDailyProgress } from "./daily-progress";

const GAME_ID = "devine-le-joueur";
const TODAY = "2026-09-15";
const YESTERDAY = "2026-09-14";

beforeEach(() => {
  localStorage.clear();
});

describe("getDailyProgress", () => {
  it("returns null when nothing has been saved yet", () => {
    expect(getDailyProgress(GAME_ID, TODAY)).toBeNull();
  });

  it("returns the saved progress when it matches today's date", () => {
    saveDailyProgress(GAME_ID, TODAY, [1, 2, 3]);

    expect(getDailyProgress(GAME_ID, TODAY)).toEqual({
      date: TODAY,
      guessedPlayerIds: [1, 2, 3],
    });
  });

  it("returns null when the saved progress is from a previous day", () => {
    saveDailyProgress(GAME_ID, YESTERDAY, [1, 2, 3]);

    expect(getDailyProgress(GAME_ID, TODAY)).toBeNull();
  });

  it("keeps progress for different games separate", () => {
    saveDailyProgress(GAME_ID, TODAY, [1]);
    saveDailyProgress("devine-le-logo", TODAY, [9]);

    expect(getDailyProgress(GAME_ID, TODAY)?.guessedPlayerIds).toEqual([1]);
    expect(getDailyProgress("devine-le-logo", TODAY)?.guessedPlayerIds).toEqual([9]);
  });

  it("returns null when the stored value is corrupted", () => {
    localStorage.setItem("mghl:progress:devine-le-joueur", "{not valid json");

    expect(getDailyProgress(GAME_ID, TODAY)).toBeNull();
  });
});
