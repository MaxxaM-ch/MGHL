import { useState } from "react";
import { getStats, type GameStats } from "../lib/storage/stats";
import "../styles/components/streak-badge.scss";

interface StreakBadgeProps {
  gameId: string;
}

export default function StreakBadge({ gameId }: StreakBadgeProps) {
  // Read once on mount: this badge always mounts after recordResult() has
  // already run for the game, so there's nothing to subscribe to afterwards.
  const [stats] = useState<GameStats>(() => getStats(gameId));

  if (stats.gamesPlayed === 0) return null;

  return (
    <div className="streak-badge">
      <span className="streak-badge__item">Série en cours : {stats.currentStreak}</span>
      <span className="streak-badge__item">Meilleure série : {stats.bestStreak}</span>
    </div>
  );
}
