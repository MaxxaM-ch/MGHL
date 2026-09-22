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
