export type SeasonBadge = {
  id: string;
  label: string;
  color: string;
};

export const SEASON_BADGES: Record<string, SeasonBadge> = {
  season_bronze: {
    id: "season_bronze",
    label: "Bronze Season",
    color: "#CD7F32",
  },
  season_silver: {
    id: "season_silver",
    label: "Silver Season",
    color: "#C0C0C0",
  },
  season_gold: {
    id: "season_gold",
    label: "Gold Season",
    color: "#FFD700",
  },
  season_platinum: {
    id: "season_platinum",
    label: "Platinum Season",
    color: "#8BE9FD",
  },
};
