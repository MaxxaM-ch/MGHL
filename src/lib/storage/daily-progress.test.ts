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
      guessedIds: [1, 2, 3],
    });
  });

  it("also accepts non-numeric ids, for games that guess by string (e.g. a team abbreviation)", () => {
    saveDailyProgress(GAME_ID, TODAY, ["TOR", "EDM"]);

    expect(getDailyProgress(GAME_ID, TODAY)).toEqual({
      date: TODAY,
      guessedIds: ["TOR", "EDM"],
    });
  });

  it("returns null when the saved progress is from a previous day", () => {
    saveDailyProgress(GAME_ID, YESTERDAY, [1, 2, 3]);

    expect(getDailyProgress(GAME_ID, TODAY)).toBeNull();
  });

  it("keeps progress for different games separate", () => {
    saveDailyProgress(GAME_ID, TODAY, [1]);
    saveDailyProgress("devine-le-logo", TODAY, [9]);

    expect(getDailyProgress(GAME_ID, TODAY)?.guessedIds).toEqual([1]);
    expect(getDailyProgress("devine-le-logo", TODAY)?.guessedIds).toEqual([9]);
  });

  it("returns null when the stored value is corrupted", () => {
    localStorage.setItem("mghl:progress:devine-le-joueur", "{not valid json");

    expect(getDailyProgress(GAME_ID, TODAY)).toBeNull();
  });

  it("returns null when the stored value has an outdated shape (e.g. a pre-rename field name)", () => {
    localStorage.setItem(
      "mghl:progress:devine-le-joueur",
      JSON.stringify({ date: TODAY, guessedPlayerIds: [1, 2, 3] }),
    );

    expect(getDailyProgress(GAME_ID, TODAY)).toBeNull();
  });
});
