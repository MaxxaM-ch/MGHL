function hashDateString(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash * 31 + dateString.charCodeAt(i)) >>> 0;
  }

  // Murmur3-style finalizer: the polynomial hash above changes by a small,
  // predictable amount between consecutive dates, which skews the modulo
  // result badly on small arrays. This avalanches the bits so nearby inputs
  // produce unrelated outputs.
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b) >>> 0;
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35) >>> 0;
  hash ^= hash >>> 16;

  return hash >>> 0;
}

// Always UTC, not local time: this is the shared day boundary used to pick
// the daily target and to key/restore each player's saved daily progress.
export function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function pickDailyItem<T>(items: T[], date: Date): T {
  if (items.length === 0) {
    throw new Error("Cannot pick a daily item from an empty list");
  }

  const index = hashDateString(formatDateKey(date)) % items.length;
  return items[index];
}
