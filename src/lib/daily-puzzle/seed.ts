function hashDateString(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash * 31 + dateString.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickDailyItem<T>(items: T[], date: Date): T {
  if (items.length === 0) {
    throw new Error("Cannot pick a daily item from an empty list");
  }

  const dateString = date.toISOString().slice(0, 10);
  const index = hashDateString(dateString) % items.length;
  return items[index];
}
