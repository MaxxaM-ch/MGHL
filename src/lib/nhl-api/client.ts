import type { RawPlayerLanding, RawRosterPlayer } from "./types";

const BASE_URL = "https://api-web.nhle.com/v1";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request to ${url} failed with status ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(`Request to ${url} failed after ${MAX_RETRIES} attempts: ${String(lastError)}`);
}

export async function fetchAllTeamAbbreviations(): Promise<string[]> {
  const data = await fetchJson<{ standings: { teamAbbrev: { default: string } }[] }>(
    `${BASE_URL}/standings/now`,
  );
  return data.standings.map((team) => team.teamAbbrev.default);
}

export async function fetchTeamRoster(team: string): Promise<RawRosterPlayer[]> {
  const data = await fetchJson<{
    forwards: RawRosterPlayer[];
    defensemen: RawRosterPlayer[];
    goalies: RawRosterPlayer[];
  }>(`${BASE_URL}/roster/${team}/current`);
  return [...data.forwards, ...data.defensemen, ...data.goalies];
}

export async function fetchPlayerLanding(playerId: number): Promise<RawPlayerLanding> {
  return fetchJson<RawPlayerLanding>(`${BASE_URL}/player/${playerId}/landing`);
}
