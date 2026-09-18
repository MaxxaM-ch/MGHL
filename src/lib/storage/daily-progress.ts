export interface DailyProgress {
  date: string;
  guessedIds: (string | number)[];
}

function storageKey(gameId: string): string {
  return `mghl:progress:${gameId}`;
}

export function getDailyProgress(gameId: string, today: string): DailyProgress | null {
  const raw = localStorage.getItem(storageKey(gameId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as DailyProgress;
    return parsed.date === today ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDailyProgress(gameId: string, today: string, guessedIds: (string | number)[]): void {
  const progress: DailyProgress = { date: today, guessedIds };
  localStorage.setItem(storageKey(gameId), JSON.stringify(progress));
}
