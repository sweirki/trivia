import type { ArenaPrestigeItem, ArenaPrestigeItemId } from "@/arena/store/useArenaShopStore";

type RotationTheme = "rival" | "survival" | "power" | "champion";

export type ArenaTokenRotation = {
  rotationId: string;
  title: string;
  subtitle: string;
  theme: RotationTheme;
  featuredItemIds: ArenaPrestigeItemId[];
  leavingSoon: boolean;
  endsAt: number;
  rewardBoostLabel: string;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ROTATIONS: Omit<ArenaTokenRotation, "rotationId" | "endsAt" | "leavingSoon">[] = [
  {
    title: "Rivalry Week",
    subtitle: "Ranked identity items are featured for duel grinders and rematch hunters.",
    theme: "rival",
    featuredItemIds: ["ranked_rival_frame", "arena_champion_banner"],
    rewardBoostLabel: "Featured: Ranked prestige",
  },
  {
    title: "Survival Records",
    subtitle: "Personal-best hunters get the spotlight with record-focused prestige rewards.",
    theme: "survival",
    featuredItemIds: ["survival_record_badge", "arena_champion_banner"],
    rewardBoostLabel: "Featured: Survival milestones",
  },
  {
    title: "Power Strategy Lab",
    subtitle: "Efficient Power Arena players can lock in strategy identity rewards.",
    theme: "power",
    featuredItemIds: ["power_strategist_title", "ranked_rival_frame"],
    rewardBoostLabel: "Featured: Power mastery",
  },
  {
    title: "Champion Vault",
    subtitle: "Top Arena identity rewards rotate through the prestige vault this week.",
    theme: "champion",
    featuredItemIds: ["arena_champion_banner", "ranked_rival_frame", "power_strategist_title"],
    rewardBoostLabel: "Featured: Champion collection",
  },
];

export function getArenaTokenRotation(now = Date.now()): ArenaTokenRotation {
  const weekIndex = Math.floor(now / WEEK_MS);
  const rotation = ROTATIONS[weekIndex % ROTATIONS.length];
  const weekStart = weekIndex * WEEK_MS;
  const endsAt = weekStart + WEEK_MS;
  const remaining = endsAt - now;

  return {
    ...rotation,
    rotationId: `arena-token-rotation-${weekIndex}`,
    endsAt,
    leavingSoon: remaining <= 24 * 60 * 60 * 1000,
  };
}

export function formatArenaTokenRotationTime(endsAt: number, now = Date.now()) {
  const remaining = Math.max(0, endsAt - now);
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) return `${days}D ${String(hours).padStart(2, "0")}H`;

  const minutes = Math.max(1, Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)));
  return `${hours}H ${String(minutes).padStart(2, "0")}M`;
}

export function isArenaPrestigeItemFeatured(item: ArenaPrestigeItem, rotation = getArenaTokenRotation()) {
  return rotation.featuredItemIds.includes(item.id);
}

export function sortArenaPrestigeItemsForRotation(items: ArenaPrestigeItem[], rotation = getArenaTokenRotation()) {
  return [...items].sort((a, b) => {
    const aFeatured = rotation.featuredItemIds.includes(a.id);
    const bFeatured = rotation.featuredItemIds.includes(b.id);
    if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
    return a.price - b.price;
  });
}
