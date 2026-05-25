export type ArenaRankLike = {
  minSR: number;
  maxSR: number;
};

export function getSRPercent(sr: number, rank: ArenaRankLike) {
  const range = rank.maxSR - rank.minSR;
  const current = sr - rank.minSR;
  if (range <= 0) return 0;
  return Math.min(100, Math.max(0, (current / range) * 100));
}


