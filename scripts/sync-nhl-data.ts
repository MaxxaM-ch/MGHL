import { mkdirSync, writeFileSync } from "node:fs";
import {
  fetchAllTeamAbbreviations,
  fetchPlayerLanding,
  fetchTeamRoster,
} from "../src/lib/nhl-api/client.ts";
import { normalizePlayer } from "../src/lib/nhl-api/normalize.ts";
import type { NormalizedPlayer } from "../src/lib/nhl-api/types.ts";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const teams = await fetchAllTeamAbbreviations();
  const players: NormalizedPlayer[] = [];

  for (const team of teams) {
    const roster = await fetchTeamRoster(team);
    for (const rosterPlayer of roster) {
      const landing = await fetchPlayerLanding(rosterPlayer.id);
      players.push(normalizePlayer({ roster: rosterPlayer, landing, team }));
      await sleep(400);
    }
    console.log(`Synced ${team}: ${roster.length} players`);
  }

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
