import type { DailyState } from "@/daily/types";
import { clampBalance } from "@/economy/economyRules";
import type { WeeklyState } from "./player.types";

type DailyLike = Partial<DailyState> | null | undefined;
type WeeklyLike = Partial<WeeklyState> | null | undefined;

export const normalizeDaily = (daily: DailyLike): DailyState => ({
  lastClaimDate: typeof daily?.lastClaimDate === "string" ? daily.lastClaimDate : null,
  streak: clampBalance(daily?.streak ?? 0),
  totalClaims: clampBalance(daily?.totalClaims ?? 0),
});

export const normalizeWeekly = (weekly: WeeklyLike): WeeklyState => ({
  weekKey: typeof weekly?.weekKey === "string" ? weekly.weekKey : "",
  progress: clampBalance(weekly?.progress ?? 0),
  claimed: weekly?.claimed === true,
  lastDailyPlayDate: typeof weekly?.lastDailyPlayDate === "string" ? weekly.lastDailyPlayDate : null,
});

