import { describe, expect, it } from "vitest";
import { normalizePlayer } from "./normalize";
import type { RawRosterPlayer } from "./types";
import rosterPlayer from "./__fixtures__/roster-player.json";
import landingDrafted from "./__fixtures__/player-landing-drafted.json";
import landingUndrafted from "./__fixtures__/player-landing-undrafted.json";

describe("normalizePlayer", () => {
  it("maps roster and landing data into our internal shape", () => {
    const result = normalizePlayer({
      roster: rosterPlayer,
      landing: landingDrafted,
      team: "EDM",
    });

    expect(result).toEqual({
      id: 8478402,
      firstName: "Connor",
      lastName: "McDavid",
      team: "EDM",
      position: "C",
      jerseyNumber: 97,
      nationality: "CAN",
      birthDate: "1997-01-13",
      heightCm: 185,
      draftYear: 2015,
      headshotUrl: "https://assets.nhle.com/mugs/nhl/20262027/EDM/8478402.png",
      heroImageUrl: "https://assets.nhle.com/mugs/actionshots/1296x729/8478402.jpg",
    });
  });

  it("returns a null draft year when the player was never drafted", () => {
    const result = normalizePlayer({
      roster: rosterPlayer,
      landing: landingUndrafted,
      team: "EDM",
    });

    expect(result.draftYear).toBeNull();
  });

  it("returns a null jersey number when the roster data omits it", () => {
    const rosterWithoutNumber: RawRosterPlayer = { ...rosterPlayer };
    delete rosterWithoutNumber.sweaterNumber;

    const result = normalizePlayer({
      roster: rosterWithoutNumber,
      landing: landingDrafted,
      team: "EDM",
    });

    expect(result.jerseyNumber).toBeNull();
  });
});
