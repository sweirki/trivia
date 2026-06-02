export const RANK_TIERS = [
  { name: "Bronze", min: 0, max: 2999 },
  { name: "Silver", min: 3000, max: 7999 },
  { name: "Gold", min: 8000, max: 17999 },
  { name: "Platinum", min: 18000, max: 34999 },
  { name: "Diamond", min: 35000, max: 59999 },
  { name: "Master", min: 60000, max: Infinity },
];

export type HubModeTone = {
  accent: string;
  glow: string;
  artOpacity: number;
  sheen: [string, string, string];
  shade: [string, string, string];
};

export const HUB_MODE_TONES: Record<
  "quick" | "arena" | "daily" | "challenges" | "lobby" | "shop",
  HubModeTone
> = {
  quick: {
    accent: "#BEE7FF",
    glow: "#24C8FF",
    artOpacity: 1,
    sheen: [
      "rgba(255,255,255,0.20)",
      "rgba(104,211,255,0.08)",
      "rgba(0,0,0,0.02)",
    ],
    shade: ["rgba(3,10,22,0.02)", "rgba(3,10,22,0.20)", "rgba(3,10,22,0.58)"],
  },
  arena: {
    accent: "#D7ECFF",
    glow: "#3F8CFF",
    artOpacity: 1,
    sheen: [
      "rgba(255,255,255,0.17)",
      "rgba(79,151,255,0.08)",
      "rgba(0,0,0,0.04)",
    ],
    shade: ["rgba(3,8,18,0.01)", "rgba(3,8,18,0.18)", "rgba(3,8,18,0.60)"],
  },
  daily: {
    accent: "#A9FFD9",
    glow: "#28F2A6",
    artOpacity: 1,
    sheen: [
      "rgba(255,255,255,0.17)",
      "rgba(40,242,166,0.08)",
      "rgba(0,0,0,0.04)",
    ],
    shade: ["rgba(2,14,18,0.01)", "rgba(3,14,18,0.18)", "rgba(3,10,18,0.58)"],
  },
  challenges: {
    accent: "#FFD6F3",
    glow: "#F46DFF",
    artOpacity: 1,
    sheen: [
      "rgba(255,255,255,0.17)",
      "rgba(244,109,255,0.08)",
      "rgba(0,0,0,0.04)",
    ],
    shade: ["rgba(18,3,22,0.01)", "rgba(18,6,22,0.18)", "rgba(8,3,16,0.60)"],
  },
  lobby: {
    accent: "#D7D8FF",
    glow: "#A179FF",
    artOpacity: 1,
    sheen: [
      "rgba(255,255,255,0.17)",
      "rgba(161,121,255,0.08)",
      "rgba(0,0,0,0.04)",
    ],
    shade: ["rgba(6,7,22,0.01)", "rgba(6,8,22,0.18)", "rgba(3,7,16,0.60)"],
  },
  shop: {
    accent: "#FFE2A1",
    glow: "#FFB84D",
    artOpacity: 1,
    sheen: [
      "rgba(255,255,255,0.16)",
      "rgba(255,184,77,0.08)",
      "rgba(0,0,0,0.04)",
    ],
    shade: ["rgba(18,10,3,0.01)", "rgba(15,10,6,0.16)", "rgba(5,7,14,0.56)"],
  },
};

export function getRankProgress(xp: number) {
  const currentIndex = RANK_TIERS.findIndex(
    (tier) => xp >= tier.min && xp <= tier.max,
  );

  const current = RANK_TIERS[currentIndex] ?? RANK_TIERS[0];
  const next = RANK_TIERS[currentIndex + 1] ?? null;

  if (!next) {
    return {
      current,
      next: null,
      progress: 1,
      remaining: 0,
    };
  }

  const progress = (xp - current.min) / (next.min - current.min);
  const remaining = next.min - xp;

  return {
    current,
    next,
    progress: Math.max(0, Math.min(1, progress)),
    remaining,
  };
}


