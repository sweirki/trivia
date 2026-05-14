export const RANK_TIERS = [
  { name: "Bronze", min: 0, max: 2999 },
  { name: "Silver", min: 3000, max: 7999 },
  { name: "Gold", min: 8000, max: 17999 },
  { name: "Platinum", min: 18000, max: 34999 },
  { name: "Diamond", min: 35000, max: 59999 },
  { name: "Master", min: 60000, max: Infinity },
];

export function getRankProgress(xp: number) {
  const currentIndex = RANK_TIERS.findIndex(
    (tier) => xp >= tier.min && xp <= tier.max
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
