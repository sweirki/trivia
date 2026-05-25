import { clampBalance, EconomyReward } from "./economyRules";

export type VipTier = 0 | 1;

export type VipPerks = {
  tier: VipTier;
  label: string;
  xpMultiplier: number;
  coinMultiplier: number;
  dailyBonusSlot: boolean;
  streakProtectionCharges: number;
  comebackBonusMultiplier: number;
  perks: string[];
};

export const FREE_PERKS: VipPerks = {
  tier: 0,
  label: "Free",
  xpMultiplier: 1,
  coinMultiplier: 1,
  dailyBonusSlot: false,
  streakProtectionCharges: 0,
  comebackBonusMultiplier: 1,
  perks: ["Core rewards", "Daily streak rewards", "Standard progression"],
};

export const VIP_TIER_1_PERKS: VipPerks = {
  tier: 1,
  label: "VIP",
  xpMultiplier: 1.2,
  coinMultiplier: 1.1,
  dailyBonusSlot: true,
  streakProtectionCharges: 1,
  comebackBonusMultiplier: 1.25,
  perks: [
    "+20% XP from gameplay rewards",
    "+10% coins from gameplay rewards",
    "Extra daily reward slot prepared",
    "1 streak protection buffer prepared",
    "Stronger comeback bonus prepared",
  ],
};

export function getVipPerks(isActive: boolean, tier: number | null | undefined): VipPerks {
  if (!isActive) return FREE_PERKS;
  return tier && tier >= 1 ? VIP_TIER_1_PERKS : FREE_PERKS;
}

export function applyVipRewardPerks(reward: Required<EconomyReward>, perks: VipPerks): Required<EconomyReward> {
  if (perks.tier <= 0) return reward;

  return {
    xp: clampBalance(reward.xp * perks.xpMultiplier),
    coins: clampBalance(reward.coins * perks.coinMultiplier),
    gems: clampBalance(reward.gems ?? 0),
    tickets: clampBalance(reward.tickets ?? 0),
  };
}

export function formatVipTimeLeft(expiresAt: number) {
  const diff = Math.max(0, expiresAt - Date.now());
  if (diff <= 0) return "Inactive";

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}



