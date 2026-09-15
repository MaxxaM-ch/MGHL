import { useRef, useSyncExternalStore } from "react";
import { getStats, type GameStats } from "../lib/storage/stats";

interface StreakBadgeProps {
  gameId: string;
}

const ZERO_STATS: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
};

function subscribe() {
  return () => {};
}

function getServerSnapshot(): GameStats {
  return ZERO_STATS;
}

function statsEqual(a: GameStats, b: GameStats): boolean {
  return (
    a.gamesPlayed === b.gamesPlayed &&
    a.wins === b.wins &&
    a.currentStreak === b.currentStreak &&
    a.bestStreak === b.bestStreak
  );
}

export default function StreakBadge({ gameId }: StreakBadgeProps) {
  const cachedRef = useRef<GameStats>(ZERO_STATS);

  const stats = useSyncExternalStore(
    subscribe,
    () => {
      const latest = getStats(gameId);
      if (!statsEqual(cachedRef.current, latest)) {
        cachedRef.current = latest;
      }
      return cachedRef.current;
    },
    getServerSnapshot,
  );

  if (stats.gamesPlayed === 0) return null;

  return (
    <div>
      <span>Série en cours : {stats.currentStreak}</span>
      <span> · Meilleure série : {stats.bestStreak}</span>
    </div>
  );
}
