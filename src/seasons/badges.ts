export type SeasonBadge = {
  id: string;
  label: string;
};

export const SEASON_BADGES: Record<string, SeasonBadge> = {
  season_bronze: { id: "season_bronze", label: "Bronze" },
  season_silver: { id: "season_silver", label: "Silver" },
  season_gold: { id: "season_gold", label: "Gold" },
  season_platinum: { id: "season_platinum", label: "Platinum" },
};

export function badgeLabel(badgeId: string | null | undefined): string | null {
  if (!badgeId) return null;
  return SEASON_BADGES[badgeId]?.label ?? null;
}




