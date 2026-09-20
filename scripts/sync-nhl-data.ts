import { mkdirSync, writeFileSync } from "node:fs";
import {
  fetchAllTeamAbbreviations,
  fetchPlayerLanding,
  fetchTeamRoster,
  sleep,
} from "../src/lib/nhl-api/client.ts";
import { normalizePlayer } from "../src/lib/nhl-api/normalize.ts";
import type { NormalizedPlayer } from "../src/lib/nhl-api/types.ts";

// The NHL CDN never 404s for a missing headshot: it silently serves a generic
// placeholder silhouette instead. Detect it by content-length instead of status.
const PLACEHOLDER_PHOTO_URL = "https://assets.nhle.com/mugs/nhl/20262027/ANA/1.png";

// Rosters are cheap (32 small requests total), so they get their own light
// concurrency. Player landing + photo checks are the expensive part (~1200
// requests): they run through a single flat pool sized to what the
// unofficial API tolerates before responding 429 — measured empirically,
// since processing teams one at a time (effectively 3 concurrent requests)
// was safe but too slow to finish inside Netlify's build time limit, while
// a naive team-level x player-level multiply (36 concurrent) got rate-limited
// within a minute.
const ROSTER_CONCURRENCY = 4;
const PLAYER_CONCURRENCY = 8;
const REQUEST_SPACING_MS = 300;

const HEAD_MAX_ATTEMPTS = 2;
const HEAD_RETRY_DELAY_MS = 300;

// Retries only on network-level failures, not on a clean non-2xx response
// (which means the URL legitimately doesn't resolve to a photo).
async function getContentLength(url: string): Promise<number | null> {
  for (let attempt = 1; attempt <= HEAD_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok) return null;
      const length = res.headers.get("content-length");
      return length ? Number(length) : null;
    } catch {
      if (attempt < HEAD_MAX_ATTEMPTS) {
        await sleep(HEAD_RETRY_DELAY_MS);
      }
    }
  }
  return null;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await fn(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function collectPlayers(
  teams: string[],
  placeholderSize: number | null,
): Promise<{ players: NormalizedPlayer[]; skippedWithoutPhoto: number }> {
  const rosters = await mapWithConcurrency(teams, ROSTER_CONCURRENCY, async (team) => {
    const roster = await fetchTeamRoster(team);
    console.log(`Fetched ${team} roster: ${roster.length} players`);
    return { team, roster };
  });

  const entries = rosters.flatMap(({ team, roster }) =>
    roster.map((rosterPlayer) => ({ team, rosterPlayer })),
  );

  const results = await mapWithConcurrency(entries, PLAYER_CONCURRENCY, async ({ team, rosterPlayer }) => {
    // landing and the photo HEAD check both only need the roster entry, so
    // they run together instead of one waiting on the other.
    const [landing, photoSize] = await Promise.all([
      fetchPlayerLanding(rosterPlayer.id),
      getContentLength(rosterPlayer.headshot),
    ]);
    await sleep(REQUEST_SPACING_MS);

    const player = normalizePlayer({ roster: rosterPlayer, landing, team });
    const hasRealPhoto = photoSize !== null && photoSize !== placeholderSize;
    return hasRealPhoto ? player : null;
  });

  const players: NormalizedPlayer[] = [];
  let skippedWithoutPhoto = 0;

  for (const player of results) {
    if (player) {
      players.push(player);
    } else {
      skippedWithoutPhoto += 1;
    }
  }

  return { players, skippedWithoutPhoto };
}

function writePlayerData(players: NormalizedPlayer[]): void {
  // The game island fetches this client-side on mount, rather than the data
  // being embedded in the page bundle.
  mkdirSync("public/data", { recursive: true });
  writeFileSync("public/data/players.json", JSON.stringify(players));
}

async function main() {
  const placeholderSize = await getContentLength(PLACEHOLDER_PHOTO_URL);
  const teams = await fetchAllTeamAbbreviations();

  const { players, skippedWithoutPhoto } = await collectPlayers(teams, placeholderSize);
  console.log(`Skipped ${skippedWithoutPhoto} players without a photo.`);

  writePlayerData(players);
  console.log(`Done. ${players.length} players written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
