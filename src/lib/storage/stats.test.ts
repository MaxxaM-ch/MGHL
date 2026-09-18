// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { getStats, recordResult } from "./stats";

const GAME_ID = "devine-le-joueur";

beforeEach(() => {
  localStorage.clear();
});

describe("getStats", () => {
  it("returns zeroed stats when nothing has been recorded yet", () => {
    expect(getStats(GAME_ID)).toEqual({
      gamesPlayed: 0,
      wins: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
  });

  it("returns zeroed stats when the stored value is corrupted", () => {
    localStorage.setItem("mghl:stats:devine-le-joueur", "{not valid json");

    expect(getStats(GAME_ID)).toEqual({
      gamesPlayed: 0,
      wins: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
  });
});

describe("recordResult", () => {
  it("increments games played and wins on a win", () => {
    recordResult(GAME_ID, true);

    expect(getStats(GAME_ID)).toEqual({
      gamesPlayed: 1,
      wins: 1,
      currentStreak: 1,
      bestStreak: 1,
    });
  });

  it("increments games played but not wins on a loss, and resets the streak", () => {
    recordResult(GAME_ID, true);
    recordResult(GAME_ID, false);

    expect(getStats(GAME_ID)).toEqual({
      gamesPlayed: 2,
      wins: 1,
      currentStreak: 0,
      bestStreak: 1,
    });
  });

  it("keeps the best streak even after the current streak is broken", () => {
    recordResult(GAME_ID, true);
    recordResult(GAME_ID, true);
    recordResult(GAME_ID, true);
    recordResult(GAME_ID, false);
    recordResult(GAME_ID, true);

    expect(getStats(GAME_ID)).toEqual({
      gamesPlayed: 5,
      wins: 4,
      currentStreak: 1,
      bestStreak: 3,
    });
  });

  it("keeps stats for different games separate", () => {
    recordResult(GAME_ID, true);
    recordResult("devine-le-logo", false);

    expect(getStats(GAME_ID).gamesPlayed).toBe(1);
    expect(getStats("devine-le-logo").gamesPlayed).toBe(1);
    expect(getStats("devine-le-logo").wins).toBe(0);
  });
});
