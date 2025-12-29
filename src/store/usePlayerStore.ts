// /store/usePlayerStore.ts
import { create } from "zustand";
import { getAuthInstance } from "@/firebase/firebase";

import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "../../firebase/firebase";
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
  // CORE
  xp: number;
  level: number;
  coins: number;
  gems: number;
  tickets: number;

  vipTier: number;
  ownedPacks: string[];
  inventory: Record<string, number>;

  streak: number;
  lastDailyClaim: number;

  justLeveledUp: boolean;
  clearLevelUpFlag: () => void;

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

  // DAILY (this already exists in your store object, so it MUST be in the type)
  claimDaily: () => void;

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
  // PLAYER IDENTITY (PHASE C)
  // ----------------------------
  tournamentsPlayed: number;
  tournamentsWon: number;
  bestTournamentFinish: number | null;
  titles: string[];

  recordTournamentResult: (result: {
    position: number;
    totalPlayers: number;
  }) => void;

  tournamentHistory: {
    tournamentId: string;
    position: number;
    totalPlayers: number;
    timestamp: number;
  }[];
}
// Player Store
export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set, get) => ({
      // ---------------------------------------------------------
      // CORE STATS
      // ---------------------------------------------------------
      xp: 0,
      level: 1,
      coins: 500,
      gems: 20,
      tickets: 3,

      // ---------------------------------------------------------
      // ECONOMY SYSTEM
      // ---------------------------------------------------------
      vipTier: 0,
      ownedPacks: [],
      inventory: defaultInventory,

      // ---------------------------------------------------------
      // DAILY + STREAK
      // ---------------------------------------------------------
      streak: 0,
      lastDailyClaim: 0,

      // ---------------------------------------------------------
      // PLAYER IDENTITY (PHASE C)
      // ---------------------------------------------------------
      tournamentsPlayed: 0,
      tournamentsWon: 0,
      bestTournamentFinish: null,
       tournamentHistory: [],
      titles: [],

      // ---------------------------------------------------------
      // SYSTEM FLAGS
      // ---------------------------------------------------------
      justLeveledUp: false,
      clearLevelUpFlag: () => set({ justLeveledUp: false }),

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
      // DAILY CLAIM + STREAK
      // ---------------------------------------------------------
      claimDaily: () => {
        const now = Date.now();
        const last = get().lastDailyClaim;
        if (now - last < 86400000) return;

        let streak = get().streak + 1;
        if (streak > 7) streak = 1;

        const dailyXP = 50 * streak;
        const dailyCoins = 20 * streak;
        const dailyGems = streak === 7 ? 5 : 0;

        let totalXP = get().xp + dailyXP;
        let level = get().level;
        let leveled = false;
        let req = xpCurve(level);

        while (totalXP >= req) {
          totalXP -= req;
          level++;
          leveled = true;
          req = xpCurve(level);
        }

        set({
          xp: totalXP,
          level,
          coins: get().coins + dailyCoins,
          gems: get().gems + dailyGems,
          streak,
          lastDailyClaim: now,
          justLeveledUp: leveled,
        });
      },

      // ---------------------------------------------------------
      // REWARD ENGINE — XP / COINS / GEMS / BOOSTS / VIP
      // ---------------------------------------------------------
      applyReward: (rawXP, rawCoins = 0, rawGems = 0) => {
        const vip = vipMulti(get().vipTier);

        let xp = clamp(rawXP);
        let coins = clamp(rawCoins);
        let gems = clamp(rawGems);

        xp = Math.floor(xp * vip + xp * (get().activeBoosts.xp || 0));
        coins = Math.floor(coins + coins * (get().activeBoosts.coins || 0));
        gems = Math.floor(gems + gems * (get().activeBoosts.gems || 0));

        const queue = [...get().offlineQueue, { xp, coins, gems }];

        let totalXP = get().xp;
        let totalCoins = get().coins;
        let totalGems = get().gems;

        for (let i = 0; i < queue.length; i++) {
          totalXP += queue[i].xp;
          totalCoins += queue[i].coins;
          totalGems += queue[i].gems;
        }

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
          coins: totalCoins,
          gems: totalGems,
          offlineQueue: queue,
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
          const auth = getAuthInstance();
          userId = auth.currentUser?.uid ?? null;
        } catch {
          return;
        }

        if (!userId) return;

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
            coins: cloud.coins ?? 0,
            gems: cloud.gems ?? 0,
            tickets: cloud.tickets ?? 0,
            vipTier: cloud.vipTier ?? 0,
            ownedPacks: cloud.ownedPacks ?? [],
            inventory: cloud.inventory ?? defaultInventory,
            streak: cloud.streak ?? 0,
            lastDailyClaim: cloud.lastDailyClaim ?? 0,

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
          gems: get().gems,
          tickets: get().tickets,
          vipTier: get().vipTier,
          ownedPacks: get().ownedPacks,
          inventory: get().inventory,
          streak: get().streak,
          lastDailyClaim: get().lastDailyClaim,

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
          const auth = getAuthInstance();
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
        set({
          streak: 0,
          lastDailyClaim: 0,
        });
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
      version: 1,
    }
  )
);
