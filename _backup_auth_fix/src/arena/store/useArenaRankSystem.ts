import { create } from "zustand";

// ------------------------------------
// TYPES
// ------------------------------------
export interface RankInfo {
  league: string;
  division: number | null; // 3,2,1 or null for elite ranks
  minSR: number;
  maxSR: number;
  icon: string;
}

interface ArenaRankState {
  sr: number;
  rank: RankInfo;
  winStreak: number;
  season: number;

  addWin: (opponentSR: number) => void;
  addLoss: (opponentSR: number) => void;
  resetSeason: () => void;
}

// ------------------------------------
// RANK TABLE (UNCHANGED DESIGN)
// ------------------------------------
export const RANK_TABLE: RankInfo[] = [
  { league: "Bronze", division: 3, minSR: 0, maxSR: 133, icon: "bronze3" },
  { league: "Bronze", division: 2, minSR: 134, maxSR: 266, icon: "bronze2" },
  { league: "Bronze", division: 1, minSR: 267, maxSR: 399, icon: "bronze1" },

  { league: "Silver", division: 3, minSR: 400, maxSR: 533, icon: "silver3" },
  { league: "Silver", division: 2, minSR: 534, maxSR: 666, icon: "silver2" },
  { league: "Silver", division: 1, minSR: 667, maxSR: 799, icon: "silver1" },

  { league: "Gold", division: 3, minSR: 800, maxSR: 933, icon: "gold3" },
  { league: "Gold", division: 2, minSR: 934, maxSR: 1066, icon: "gold2" },
  { league: "Gold", division: 1, minSR: 1067, maxSR: 1199, icon: "gold1" },

  { league: "Platinum", division: 3, minSR: 1200, maxSR: 1333, icon: "plat3" },
  { league: "Platinum", division: 2, minSR: 1334, maxSR: 1466, icon: "plat2" },
  { league: "Platinum", division: 1, minSR: 1467, maxSR: 1599, icon: "plat1" },

  { league: "Diamond", division: 3, minSR: 1600, maxSR: 1733, icon: "diamond3" },
  { league: "Diamond", division: 2, minSR: 1734, maxSR: 1866, icon: "diamond2" },
  { league: "Diamond", division: 1, minSR: 1867, maxSR: 1999, icon: "diamond1" },

  { league: "Master", division: null, minSR: 2000, maxSR: 2399, icon: "master" },
  { league: "Grandmaster", division: null, minSR: 2400, maxSR: 2699, icon: "grandmaster" },
  { league: "Legendary", division: null, minSR: 2700, maxSR: 9999, icon: "legendary" },
];

// ------------------------------------
// PURE HELPER (SAFE, OUTSIDE STORE)
// ------------------------------------
const getRankFromSR = (sr: number): RankInfo => {
  return (
    RANK_TABLE.find((r) => sr >= r.minSR && sr <= r.maxSR) ||
    RANK_TABLE[0]
  );
};

// ------------------------------------
// STORE
// ------------------------------------
export const useArenaRankSystem = create<ArenaRankState>((set, get) => ({
  sr: 0,
  rank: RANK_TABLE[0],
  winStreak: 0,
  season: 1,

  // --------------------------------
  // WIN
  // --------------------------------
  addWin: (opponentSR: number) => {
    const { sr, winStreak } = get();

    let newWinStreak = winStreak + 1;

    let gain = 18;
    if (newWinStreak >= 3) gain += 2;
    if (newWinStreak >= 5) gain += 3;
    if (opponentSR > sr) gain += 4;

    const newSR = sr + gain;

    set({
      sr: newSR,
      rank: getRankFromSR(newSR),
      winStreak: newWinStreak,
    });
  },

  // --------------------------------
  // LOSS
  // --------------------------------
  addLoss: (opponentSR: number) => {
    const { sr } = get();

    let loss = 16;
    if (opponentSR < sr) loss += 4;

    const newSR = Math.max(0, sr - loss);

    set({
      sr: newSR,
      rank: getRankFromSR(newSR),
      winStreak: 0,
    });
  },

  // --------------------------------
  // SEASON RESET
  // --------------------------------
  resetSeason: () => {
    const { sr, season } = get();

    const newSR = Math.max(0, Math.floor(sr * 0.65));

    set({
      sr: newSR,
      rank: getRankFromSR(newSR),
      winStreak: 0,
      season: season + 1,
    });
  },
}));
