export interface RawRosterPlayer {
  id: number;
  headshot: string;
  firstName: { default: string };
  lastName: { default: string };
  sweaterNumber: number;
  positionCode: string;
  heightInCentimeters: number;
  birthDate: string;
  birthCountry: string;
}

export interface RawPlayerLanding {
  draftDetails?: {
    year: number;
    round: number;
    overallPick: number;
  };
}

export interface NormalizedPlayer {
  id: number;
  firstName: string;
  lastName: string;
  team: string;
  position: string;
  jerseyNumber: number;
  nationality: string;
  birthDate: string;
  heightCm: number;
  draftYear: number | null;
  headshotUrl: string;
}
