import { CURRENT_SEASON } from "../seasonDefinitions";

/**
 * Returns ms until season end (never negative).
 */
export function getSeasonTimeLeftMs(nowMs: number = Date.now()): number {
  const endMs = Date.parse(CURRENT_SEASON.end);
  return Math.max(0, endMs - nowMs);
}

/**
 * True if the current season has ended.
 */
export function isSeasonEnded(nowMs: number = Date.now()): boolean {
  return getSeasonTimeLeftMs(nowMs) === 0;
}

/**
 * Formats a duration in ms to: "12d 04h 21m 09s"
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad2 = (n: number) => String(n).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${pad2(hours)}h ${pad2(mins)}m ${pad2(secs)}s`;
  }
  return `${pad2(hours)}h ${pad2(mins)}m ${pad2(secs)}s`;
}




