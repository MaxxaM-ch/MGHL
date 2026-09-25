import { hashString } from "../hash";

// Always UTC, not local time: this is the shared day boundary used to pick
// the daily target and to key/restore each player's saved daily progress.
export function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function pickDailyItem<T>(items: T[], date: Date): T {
  if (items.length === 0) {
    throw new Error("Cannot pick a daily item from an empty list");
  }

  const index = hashString(formatDateKey(date)) % items.length;
  return items[index];
}

// Deterministic per date, distinct within one call (sampling without
// replacement). Clamps rather than throwing when count exceeds the pool
// size, since a game asking for more items than currently exist should
// degrade to "use everything available" rather than break entirely.
export function pickDailyItems<T>(items: T[], date: Date, count: number): T[] {
  if (items.length === 0) {
    throw new Error("Cannot pick daily items from an empty list");
  }

  const clampedCount = Math.min(count, items.length);
  const pool = [...items];
  const picked: T[] = [];
  const dateKey = formatDateKey(date);

  for (let i = 0; i < clampedCount; i++) {
    const index = hashString(`${dateKey}:${i}`) % pool.length;
    picked.push(pool[index]);
    pool.splice(index, 1);
  }

  return picked;
}
