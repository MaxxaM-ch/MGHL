import type { NormalizedPlayer, RawPlayerLanding, RawRosterPlayer } from "./types";

export function normalizePlayer(params: {
  roster: RawRosterPlayer;
  landing: RawPlayerLanding;
  team: string;
}): NormalizedPlayer {
  const { roster, landing, team } = params;

  return {
    id: roster.id,
    firstName: roster.firstName.default,
    lastName: roster.lastName.default,
    team,
    position: roster.positionCode,
    // The roster endpoint's sweaterNumber is sometimes missing (e.g. recent
    // call-ups); fall back to the player-landing endpoint, which is more complete.
    jerseyNumber: roster.sweaterNumber ?? landing.sweaterNumber ?? null,
    nationality: roster.birthCountry,
    birthDate: roster.birthDate,
    heightCm: roster.heightInCentimeters,
    draftYear: landing.draftDetails?.year ?? null,
    headshotUrl: roster.headshot,
    heroImageUrl: landing.heroImage,
  };
}
