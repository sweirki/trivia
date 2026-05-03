// src/liveops/utils/time.ts

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function getDayKey(date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getWeekKey(date = new Date()): string {
  const firstDayOfWeek = new Date(date);
  const day = firstDayOfWeek.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = firstDayOfWeek.getDate() - day;
  firstDayOfWeek.setDate(diff);

  return firstDayOfWeek.toISOString().split('T')[0];
}

export function hasDayReset(lastKey: string, now = new Date()): boolean {
  return lastKey !== getDayKey(now);
}

export function hasWeekReset(lastKey: string, now = new Date()): boolean {
  return lastKey !== getWeekKey(now);
}

export { DAY_MS, WEEK_MS };
export const getTodayKey = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
