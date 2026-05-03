// /store/usePlayerStore.ts
import { create } from "zustand";
import { getAuthInstance } from "@/firebase/firebase";
import { onGameFinished } from '../achievements/achievementHooks';
import { getAuth } from "firebase/auth";
import { app } from "@/firebase/firebase";
import { DailyState } from "@/daily/types";
import { PlayerCosmetics } from "@/cosmetics/playerCosmetics";
import { COSMETIC_CATALOG } from "@/cosmetics/catalog";
import { useSeasonStore } from "@/seasons/store/useSeasonStore";
import { SEASON_XP } from "@/seasons/seasonXpRules";

import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import NetInfo from "@react-native-community/netinfo";

// XP curve
const xpCurve = (lvl: number) => lvl * 150 + lvl * lvl * 6;

// Normalizer
const clamp = (n: number) => Math.max(0, Math.min(n, 9999999));

// VIP Economy
const vipMulti = (tier: number) =>
  tier === 0 ? 1 : tier === 1 ? 1.25 : tier === 2 ? 1.5 : tier === 3 ? 2 : 3;

// Inventory defaults
const defaultInventory = {
  xpBoost1: 0,
  xpBoost2: 0,
  coinBoost1: 0,
  gemPack1: 0,
  timeBooster: 0,
  

};

export interface PlayerStoreState {
daily: DailyState;
streak: number;

setDaily: (daily: DailyState) => void;
weekly: {
  weekKey: string;
  progress: number;
  claimed: boolean;
};
setWeekly: (weekly: {
  weekKey: string;
  progress: number;
  claimed: boolean;
}) => void;
claimWeeklyReward: (reward: { xp: number; coins: number }) => void;

// ----------------------------
// COSMETICS — STORE ENGINE (C3.2)
// ----------------------------
purchaseCosmetic: (id: string) => {
  success: boolean;
  reason?: "ALREADY_OWNED" | "INSUFFICIENT_COINS" | "NOT_FOUND";
};
isCosmeticOwned: (id: string) => boolean;

// ----------------------------
// COSMETICS — EQUIP (C3.4)
// ----------------------------
equipCosmetic: (id: string) => boolean;
unequipCosmetic: (
  type: "avatar" | "frame" | "badge" | "theme"
) => void;
justLeveledUp: boolean;
clearLevelUpFlag: () => void;

// ----------------------------
// LIFETIME STATS (Phase C1)
// ----------------------------
totalGamesPlayed: number;
totalWins: number;

incrementGamesPlayed: () => void;
incrementWins: () => void;
incrementDailyStreak: () => void;
resetDailyStreak: () => void;


// ----------------------------
// COSMETICS (Phase C3)
// ----------------------------
cosmetics: PlayerCosmetics;
setCosmetics: (cosmetics: PlayerCosmetics) => void;



// ----------------------------
// AUTH IDENTITY (Phase C1)
// ----------------------------
userId: string | null;
setUserId: (id: string | null) => void;

  // CORE
  xp: number;
  level: number;
  coins: number;
  gems: number;
  tickets: number;

  vipTier: number;
  setVIPTier: (tier: number) => void;
  ownedPacks: string[];
  inventory: Record<string, number>;


  // CLOUD / OFFLINE
  offlineQueue: { xp: number; coins: number; gems: number }[];
  syncing: boolean;
  version: number;
  lastSync: number;

  // BOOSTS
  activeBoosts: {
    xp: number;
    coins: number;
    gems: number;
  };

  // ECONOMY CORE
  applyReward: (xp: number, coins?: number, gems?: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addTickets: (amount: number) => void;

  spendCoins: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;
  spendTickets: (amount: number) => boolean;

  // SYNC
  syncNow: () => Promise<void>;
  flushQueue: (userId: string) => Promise<void>;
  loadCloudProfile: () => Promise<void>;
  clearOfflineQueue: () => void;

  // SHOP / INVENTORY
  purchaseCoinsPack: (coins: number) => void;
  purchaseGemsPack: (gems: number) => void;
  purchaseVIPTier: (tier: number) => void;
  purchaseInventoryItem: (id: string, qty: number) => void;

  grantItem: (id: string, qty: number) => void;
  addBooster: (id: string) => void;

  consumeItem: (id: string) => void;
  purchasePack: (id: string) => void;
  upgradeVIP: (tier: number) => void;
  activateBoost: (type: string, value: number, duration: number) => void;
  useBoost: (type: string) => void;

  // ARENA / SEASON
  awardArenaBonus: (xp: number, coins: number, gems: number) => void;
  awardSeasonXP: (xp: number) => void;
  resetSeasonProgress: () => void;
  grantSeasonalItem: (id: string, qty: number) => void;

  // DIRECT XP
  addXPDirect: (amount: number) => void;


  
  // ----------------------------
// PLAYER IDENTITY (PHASE 10B)
// ----------------------------
nickname: string | null;
avatarId: string | null;

setNickname: (name: string) => void;
setAvatar: (id: string) => void;

  // ---------------------------------------------------------
// PLAYER IDENTITY (PHASE C)
// ---------------------------------------------------------
tournamentsPlayed: number;
tournamentsWon: number;
bestTournamentFinish: number | null;
titles: string[];

tournamentHistory: {
  tournamentId: string;
  position: number;
  totalPlayers: number;
  timestamp: number;
}[];

  recordTournamentResult: (result: {
    position: number;
    totalPlayers: number;
  }) => void;

}
// Player Store
export const usePlayerStore = create<PlayerStoreState>()(

  persist(
    (set, get) => ({

streak: 0,


      
      // ---------------------------------------------------------
      // CORE STATS
      // ---------------------------------------------------------
      xp: 0,
      level: 1,
      coins: 500,
      daily: {
    lastClaimDate: null,
    streak: 0,
    totalClaims: 0,
  },
weekly: {
  weekKey: "",
  progress: 0,
  claimed: false,
},

 setDaily: (daily) =>
  set({
    daily,
    streak: daily.streak,
  }),

setWeekly: (weekly) => set({ weekly }),


claimWeeklyReward: (reward) => {
  const { weekly, applyReward } = get();

  if (weekly.claimed) return;

  applyReward(reward.xp, reward.coins);

  set({
    weekly: {
      ...weekly,
      claimed: true,
    },
    
  });
  const uid = get().userId;
if (uid) {
  void useSeasonStore.getState().addSeasonXp(uid, SEASON_XP.WEEKLY_CLAIM);
}

},

      gems: 20,
      tickets: 3,

// ----------------------------
// LIFETIME STATS (Phase C1)
// ----------------------------
totalGamesPlayed: 0,
totalWins: 0,


      // ---------------------------------------------------------
      // ECONOMY SYSTEM
      // ---------------------------------------------------------
      vipTier: 0,
      ownedPacks: [],
      inventory: defaultInventory,

// ---------------------------------------------------------
// PLAYER IDENTITY (PHASE 10B)
// ---------------------------------------------------------
nickname: null,
avatarId: null,

userId: null,
setUserId: (id) => set({ userId: id }),


      // ---------------------------------------------------------
      // PLAYER IDENTITY (PHASE C)
      // ---------------------------------------------------------
      tournamentsPlayed: 0,
      tournamentsWon: 0,
      bestTournamentFinish: null,
      tournamentHistory: [],
      titles: [],
// ----------------------------
// COSMETICS (Phase C3)
// ----------------------------
cosmetics: {
  owned: ["avatar_basic_1"], // default free avatar
  equipped: {
    avatar: "avatar_basic_1",
    frame: null,
    badge: null,
    theme: null,
  },
},
setCosmetics: (cosmetics) => set({ cosmetics }),

// ----------------------------
// COSMETICS — STORE ENGINE (C3.2)
// ----------------------------
isCosmeticOwned: (id) => {
  return get().cosmetics.owned.includes(id);
},

purchaseCosmetic: (id) => {
  const catalogItem = COSMETIC_CATALOG.find(
    (item) => item.id === id
  );

  if (!catalogItem) {
    return { success: false, reason: "NOT_FOUND" };
  }

  const { coins, cosmetics } = get();

  if (cosmetics.owned.includes(id)) {
    return { success: false, reason: "ALREADY_OWNED" };
  }

  if (coins < catalogItem.price) {
    return { success: false, reason: "INSUFFICIENT_COINS" };
  }

 set({
  coins: coins - catalogItem.price,
  cosmetics: {
    ...cosmetics,
    owned: [...cosmetics.owned, id],
  },
  
  version: get().version + 1,
});
get().syncNow();


  return { success: true };
},

// ----------------------------
// COSMETICS — EQUIP (C3.4)
// ----------------------------
equipCosmetic: (id) => {
  const { cosmetics } = get();

  if (!cosmetics.owned.includes(id)) {
    return false;
  }

  const item = COSMETIC_CATALOG.find((c) => c.id === id);
  if (!item) return false;

  set({
    cosmetics: {
      ...cosmetics,
      equipped: {
        ...cosmetics.equipped,
        [item.type]: id,
      },
    },
    version: get().version + 1,
  });
get().syncNow();
  return true;
},

unequipCosmetic: (type) => {
  const { cosmetics } = get();

  set({
    cosmetics: {
      ...cosmetics,
      equipped: {
        ...cosmetics.equipped,
        [type]: null,
      },
    },
    version: get().version + 1,
  });
},



      // ---------------------------------------------------------
      // SYSTEM FLAGS
      // ---------------------------------------------------------
      justLeveledUp: false,
      clearLevelUpFlag: () => set({ justLeveledUp: false }),

// ---------------------------------------------------------
// PLAYER IDENTITY ACTIONS (PHASE 10B)
// ---------------------------------------------------------
setNickname: (name: string) =>
  set({
    nickname: name.trim().length > 0 ? name.trim() : null,
  }),

setAvatar: (id: string) =>
  set({
    avatarId: id,
  }),

      // ---------------------------------------------------------
      // CLOUD SYNC CORE DATA
      // ---------------------------------------------------------
      offlineQueue: [],
      syncing: false,
      version: 0,
      lastSync: 0,
      clearOfflineQueue: () => set({ offlineQueue: [] }),

      // ---------------------------------------------------------
      // ECONOMY MODIFIERS
      // ---------------------------------------------------------
      activeBoosts: {
        xp: 0,
        coins: 0,
        gems: 0,
      },

      // ---------------------------------------------------------
      // INVENTORY OPERATIONS
      // ---------------------------------------------------------
      grantItem: (id, qty) => {
        const inv = { ...get().inventory };
        inv[id] = (inv[id] || 0) + qty;
        set({ inventory: inv });
      },
addBooster: (id) => {
  get().grantItem(id, 1);
},

      consumeItem: (id) => {
        const inv = { ...get().inventory };
        if (!inv[id] || inv[id] <= 0) return;
        inv[id] -= 1;
        set({ inventory: inv });
      },

      purchasePack: (id) => {
        const owned = new Set(get().ownedPacks);
        owned.add(id);
        set({ ownedPacks: [...owned] });
      },

      upgradeVIP: (tier) => {
        const t = Math.max(0, Math.min(4, tier));
        set({ vipTier: t });
      },
setVIPTier: (tier) => {
  const t = Math.max(0, Math.min(4, tier));
  set({ vipTier: t });
},

      activateBoost: (type, value, duration) => {
        const boosts = { ...get().activeBoosts } as any;
        boosts[type] = value;
        set({ activeBoosts: boosts });

        setTimeout(() => {
          const b = { ...get().activeBoosts } as any;
          b[type] = 0;
          set({ activeBoosts: b });
        }, duration);
      },


      // ---------------------------------------------------------
      // REWARD ENGINE — XP / COINS / GEMS / BOOSTS / VIP
      // ---------------------------------------------------------
     applyReward: (rawXP, rawCoins = 0, rawGems = 0) => {
  const vip = vipMulti(get().vipTier);

 let xpGain = clamp(rawXP);


  let coinsGain = clamp(rawCoins);
  let gemsGain = clamp(rawGems);

  xpGain = Math.floor(xpGain * vip + xpGain * (get().activeBoosts.xp || 0));
  coinsGain = Math.floor(coinsGain + coinsGain * (get().activeBoosts.coins || 0));
  gemsGain = Math.floor(gemsGain + gemsGain * (get().activeBoosts.gems || 0));

  // ✅ apply ONLY this reward to local totals
  const nextCoins = get().coins + coinsGain;
  const nextGems = get().gems + gemsGain;

  // ✅ level progression from current xp + this xpGain
  let remainingXP = get().xp + xpGain;
  let level = get().level;
  let leveled = false;

  let req = xpCurve(level);
  while (remainingXP >= req) {
    remainingXP -= req;
    level++;
    leveled = true;
    req = xpCurve(level);
  }

  // ✅ queue deltas for later cloud sync
  const nextQueue = [...get().offlineQueue, { xp: xpGain, coins: coinsGain, gems: gemsGain }];

  set({
    xp: remainingXP,
    level,
    coins: nextCoins,
    gems: nextGems,
    offlineQueue: nextQueue,
    justLeveledUp: leveled,
  });

  get().syncNow();
},
      // ---------------------------------------------------------
      // DIRECT AWARD FUNCTIONS (SHOP, EVENTS, ARENA)
      // ---------------------------------------------------------
      addCoins: (amount) => set({ coins: get().coins + clamp(amount) }),
      addGems: (amount) => set({ gems: get().gems + clamp(amount) }),
      addTickets: (amount) => set({ tickets: get().tickets + clamp(amount) }),

      // Arena bonus placeholder — future expansion
      awardArenaBonus: (xp, coins, gems) => {
        get().applyReward(xp, coins, gems);
      },

      // ---------------------------------------------------------
      // CLOUD: LOAD PROFILE
      // ---------------------------------------------------------
      loadCloudProfile: async () => {
        let userId: string | null = null;

        try {
          const { getAuthInstance } = await import("@/firebase/firebase");
          const auth = auth;
          userId = auth.currentUser?.uid ?? null;
        } catch {
        
          return;
        }

        if (!userId) return;

set({ userId });


        const ref = doc(db, "players", userId);

        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const cloud: any = snap.data();
        const localVer = get().version;
        const cloudVer = cloud.version ?? 0;

        if (cloudVer > localVer) {
          set({
            xp: cloud.xp ?? 0,
            level: cloud.level ?? 1,
          
           
           
            vipTier: cloud.vipTier ?? 0,
            ownedPacks: cloud.ownedPacks ?? [],
            inventory: cloud.inventory ?? defaultInventory,
         

cosmetics: cloud.cosmetics ?? get().cosmetics,

            // PHASE C identity load
            tournamentsPlayed: cloud.tournamentsPlayed ?? 0,
            tournamentsWon: cloud.tournamentsWon ?? 0,
            bestTournamentFinish: cloud.bestTournamentFinish ?? null,
            titles: cloud.titles ?? [],

            version: cloudVer,
            offlineQueue: [],
            lastSync: Date.now(),
            justLeveledUp: false,
          });
        }
       // ⬇️ THIS MUST BE A NEW set() CALL
const dailyData =
  cloud.daily ?? {
    lastClaimDate: null,
    streak: 0,
    totalClaims: 0,
  };

set({
  daily: dailyData,
  streak: dailyData.streak,
  weekly: cloud.weekly ?? {
    weekKey: "",
    progress: 0,
    claimed: false,
  },
});

      },

      // ---------------------------------------------------------
      // CLOUD: FLUSH OFFLINE QUEUE
      // ---------------------------------------------------------
      flushQueue: async (userId: string) => {
        if (!userId) return;

        const queue = get().offlineQueue;
        if (queue.length === 0) return;

        const payload = {
          xp: get().xp,
          level: get().level,
          coins: get().coins,
          daily: get().daily,
          weekly: get().weekly,

cosmetics: get().cosmetics,

          gems: get().gems,
          totalGamesPlayed: get().totalGamesPlayed,
totalWins: get().totalWins,

          tickets: get().tickets,
          vipTier: get().vipTier,
          ownedPacks: get().ownedPacks,
          inventory: get().inventory,
      
          // PHASE C identity persist
          tournamentsPlayed: get().tournamentsPlayed,
          tournamentsWon: get().tournamentsWon,
          bestTournamentFinish: get().bestTournamentFinish,
          titles: get().titles,

          version: get().version + 1,
          updatedAt: serverTimestamp(),
        };

        const ref = doc(db, "players", userId);

        await setDoc(ref, payload, { merge: true });

        set({
          offlineQueue: [],
          version: payload.version,
          lastSync: Date.now(),
        });
      },

      // ---------------------------------------------------------
      // CLOUD: SYNC NOW (FIXED)
      // ---------------------------------------------------------
      syncNow: async () => {
        let userId: string | null = null;

        try {
          const { getAuthInstance } = await import("@/firebase/firebase");
          const auth = auth;
          userId = auth.currentUser?.uid ?? null;
        } catch {
          return;
        }

        if (!userId) return;

        const net = await NetInfo.fetch();
        if (!net.isConnected) return;

        if (get().syncing) return;

        set({ syncing: true });

        try {
          await get().flushQueue(userId);
        } finally {
          set({ syncing: false });
        }
      },

      // ---------------------------------------------------------
      // SHOP OPERATIONS (FULL ECONOMY)
      // ---------------------------------------------------------
      purchaseCoinsPack: (coins) => {
        const amt = clamp(coins);
        set({ coins: get().coins + amt });
      },

      purchaseGemsPack: (gems) => {
        const amt = clamp(gems);
        set({ gems: get().gems + amt });
      },

      purchaseVIPTier: (tier) => {
        const t = clamp(tier);
        set({ vipTier: Math.max(get().vipTier, t) });
      },

      purchaseInventoryItem: (id, qty) => {
        const inv = { ...get().inventory };
        inv[id] = (inv[id] || 0) + qty;
        set({ inventory: inv });
      },

      useBoost: (type) => {
        if (!get().inventory[type] || get().inventory[type] <= 0) return;

        const inv = { ...get().inventory };
        inv[type] -= 1;
        set({ inventory: inv });

        if (type === "xpBoost1") get().activateBoost("xp", 0.5, 60000);
        if (type === "xpBoost2") get().activateBoost("xp", 1.0, 120000);
        if (type === "coinBoost1") get().activateBoost("coins", 0.5, 60000);
        if (type === "gemPack1") set({ gems: get().gems + 5 });
      },

      // ---------------------------------------------------------
      // SEASON SYSTEM HOOKS (FUTURE EXPANSION)
      // ---------------------------------------------------------
      awardSeasonXP: (xp) => {
        get().applyReward(xp, 0, 0);
      },

      resetSeasonProgress: () => {
  set({});
},


      grantSeasonalItem: (id, qty) => {
        get().grantItem(id, qty);
      },

      // ---------------------------------------------------------
      // DIRECT ECONOMY MUTATIONS
      // ---------------------------------------------------------
      addXPDirect: (amount) => {
        let totalXP = get().xp + clamp(amount);
        let level = get().level;
        let leveled = false;
        let req = xpCurve(level);

        let remainingXP = totalXP;
        while (remainingXP >= req) {
          remainingXP -= req;
          level++;
          leveled = true;
          req = xpCurve(level);
        }

        set({
          xp: remainingXP,
          level,
          justLeveledUp: leveled,
        });
      },
// ----------------------------
// LIFETIME STATS MUTATORS
// ----------------------------
incrementGamesPlayed: () =>
  set({ totalGamesPlayed: get().totalGamesPlayed + 1 }),

incrementWins: () =>
  set({ totalWins: get().totalWins + 1 }),
incrementDailyStreak: () => {
  const d = get().daily;

  const next = {
    ...d,
    streak: d.streak + 1,
    totalClaims: d.totalClaims + 1,
    lastClaimDate: new Date().toISOString(),
  };

  set({
    daily: next,
    streak: next.streak,
  });
},

resetDailyStreak: () => {
  const next = {
    lastClaimDate: null,
    streak: 0,
    totalClaims: 0,
  };

  set({
    daily: next,
    streak: 0,
  });
},

      // ---------------------------------------------------------
      // PLAYER IDENTITY — TOURNAMENT RESULTS (PHASE C)
      // ---------------------------------------------------------
      recordTournamentResult: ({ position, totalPlayers }) => {
        const played = get().tournamentsPlayed + 1;
        const won =
          position === 1
            ? get().tournamentsWon + 1
            : get().tournamentsWon;

        const best =
          get().bestTournamentFinish === null
            ? position
            : Math.min(get().bestTournamentFinish, position);

        const titles = new Set(get().titles);

        if (position === 1) titles.add("Champion");
        if (position === 2) titles.add("Finalist");
        if (position <= 3 && totalPlayers >= 8) titles.add("Top 3 Finisher");

                set({
          tournamentsPlayed: played,
          tournamentsWon: won,
          bestTournamentFinish: best,
          titles: Array.from(titles),
          tournamentHistory: [
            {
              tournamentId: `t-${Date.now()}`,
              position,
              totalPlayers,
              timestamp: Date.now(),
            },
            ...get().tournamentHistory,
          ].slice(0, 50),
        });

      },

      spendCoins: (amount) => {
        const a = clamp(amount);
        if (get().coins < a) return false;
        set({ coins: get().coins - a });
        return true;
      },

      spendGems: (amount) => {
        const a = clamp(amount);
        if (get().gems < a) return false;
        set({ gems: get().gems - a });
        return true;
      },

      spendTickets: (amount) => {
        const a = clamp(amount);
        if (get().tickets < a) return false;
        set({ tickets: get().tickets - a });
        return true;
      },
    }),
   {
  name: "player-store",
  storage: createJSONStorage(() => AsyncStorage),
  version: 2,

  migrate: (persistedState: any, version: number) => {
    return {
      ...persistedState,
      daily: {
        lastClaimDate: null,
        streak: 0,
          totalClaims: 0,
        },
      };
    },
  }
)
);
