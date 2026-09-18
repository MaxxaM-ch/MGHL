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

async function getContentLength(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return null;
    const length = res.headers.get("content-length");
    return length ? Number(length) : null;
  } catch {
    return null;
  }
}

async function main() {
  const placeholderSize = await getContentLength(PLACEHOLDER_PHOTO_URL);
  const teams = await fetchAllTeamAbbreviations();
  const players: NormalizedPlayer[] = [];
  let skippedWithoutPhoto = 0;

  for (const team of teams) {
    const roster = await fetchTeamRoster(team);
    for (const rosterPlayer of roster) {
      const landing = await fetchPlayerLanding(rosterPlayer.id);
      const player = normalizePlayer({ roster: rosterPlayer, landing, team });
      const photoSize = await getContentLength(player.headshotUrl);
      if (photoSize !== null && photoSize !== placeholderSize) {
        players.push(player);
      } else {
        skippedWithoutPhoto += 1;
      }
      await sleep(400);
    }
    console.log(`Synced ${team}: ${roster.length} players`);
  }

  console.log(`Skipped ${skippedWithoutPhoto} players without a photo.`);

  mkdirSync("src/data/generated", { recursive: true });
  writeFileSync("src/data/generated/players.json", JSON.stringify(players, null, 2));

  // Also expose the full dataset as a static asset: the game island fetches it
  // client-side on mount rather than embedding it in the page bundle.
  mkdirSync("public/data", { recursive: true });
  writeFileSync("public/data/players.json", JSON.stringify(players));

  console.log(`Done. ${players.length} players written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
