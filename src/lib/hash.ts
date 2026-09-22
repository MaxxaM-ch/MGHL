// Simple DJB2-style string hash, shared by anything that needs a
// deterministic pseudo-random number derived from a string (e.g. picking
// the day's puzzle, or a stable-but-arbitrary point within some bounds).
export function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}
