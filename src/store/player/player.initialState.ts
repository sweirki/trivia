import type { DailyState } from "@/daily/types";
import { DEFAULT_PLAYER_COSMETICS_STATE } from "@/cosmetics/playerCosmetics";
import type { PlayerCosmeticsState } from "@/cosmetics/playerCosmetics";
import type { WeeklyState } from "./player.types";

export const defaultDaily: DailyState = {
  lastClaimDate: null,
  streak: 0,
  totalClaims: 0,
};

export const defaultWeekly: WeeklyState = {
  weekKey: "",
  progress: 0,
  claimed: false,
  lastDailyPlayDate: null,
};

export const defaultInventory: Record<string, number> = {
  xpBoost1: 0,
  xpBoost2: 0,
  coinBoost1: 0,
  gemPack1: 0,
  timeBooster: 0,
};

export const defaultCosmetics: PlayerCosmeticsState = DEFAULT_PLAYER_COSMETICS_STATE;



