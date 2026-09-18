export interface GameStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
}

const ZERO_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
};

function storageKey(gameId: string): string {
  return `mghl:stats:${gameId}`;
}

export function getStats(gameId: string): GameStats {
  const raw = localStorage.getItem(storageKey(gameId));
  if (!raw) return { ...ZERO_STATS };
  try {
    return JSON.parse(raw) as GameStats;
  } catch {
    return { ...ZERO_STATS };
  }
}

export function recordResult(gameId: string, won: boolean): void {
  const stats = getStats(gameId);

  stats.gamesPlayed += 1;
  if (won) {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  localStorage.setItem(storageKey(gameId), JSON.stringify(stats));
}
