// src/store/player/player.store.ts
// Phase 5A maintainability extraction applied.
// Phase 5A — rebuilt economy/player store. One source of truth for XP, level, coins, gems, tickets, daily and weekly.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { auth, db } from "@/firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { COSMETICS_CATALOG } from "@/cosmetics/catalog";
import { normalizePlayerCosmeticsState } from "@/cosmetics/playerCosmetics";

import { SEASON_XP } from "@/seasons/seasonXpRules";
import {
  STARTING_ECONOMY,
  WEEKLY_DAILY_REWARD,
  applyRewardMultipliers,
  applyXpProgress,
  clampBalance,
  getDayKeyUTC,
} from "@/economy/economyRules";
import { getLevelRewardsBetween, summarizeLevelRewards } from "@/economy/progressionRewards";
import { applyVipRewardPerks, getVipPerks } from "@/economy/vipPerks";
import { buildSyncDiagnostic, nextRevision, pickNewestRevision } from "./playerSync.helpers";
import { useEntitlementStore } from "@/store/entitlementStore";
import {
  DEFAULT_RETENTION_STATE,
  evaluateRetentionAfterGame,
  normalizeRetentionState,
} from "@/economy/retentionEngine";

import type { PlayerCosmeticsState } from "@/cosmetics/playerCosmetics";
import { defaultCosmetics, defaultDaily, defaultInventory, defaultWeekly } from "./player.initialState";
import { normalizeDaily, normalizeWeekly } from "./player.normalizers";
import {
  dailyStatesEqual,
  pickNewestDaily,
  readPlayerVersion,
  shouldUseCloudPlayerState,
} from "./player.syncPolicy";
import { recordSyncDiagnostic, recordSyncFailure } from "@/observability/syncDiagnostics";
import { mergeRecentQuestionIds, normalizeRecentQuestionIds } from "@/questions/questionMemory";
import {
  DEFAULT_ADAPTIVE_DIFFICULTY_STATE,
  normalizeAdaptiveDifficultyState,
  recordAdaptiveQuestionResult,
} from "@/questions/adaptiveDifficulty";
import {
  DEFAULT_QUESTION_ANALYTICS_STATE,
  normalizeQuestionAnalyticsState,
  recordQuestionAnalyticsResult,
} from "@/questions/questionAnalytics";
import type { PlayerStoreState, RewardDelta } from "./player.types";

type CloudPlayerState = Partial<PlayerStoreState> & {
  displayName?: string | null;
  photoURL?: string | null;
  updatedAt?: unknown;
};

let playerSyncPromise: Promise<void> | null = null;
let playerSyncPending = false;

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set, get) => {
      const markDirty = () => set({ version: get().version + 1 });

      const grantRaw = (delta: Partial<RewardDelta>, options: { sync?: boolean } = {}) => {
        const safe: RewardDelta = {
          xp: clampBalance(delta.xp ?? 0),
          coins: clampBalance(delta.coins ?? 0),
          gems: clampBalance(delta.gems ?? 0),
          tickets: clampBalance(delta.tickets ?? 0),
        };

        const previousLevel = get().level;
        const progress = applyXpProgress(get().xp, previousLevel, safe.xp);
        const levelRewards = getLevelRewardsBetween(previousLevel, progress.level, get().claimedLevelRewards);
        const levelRewardSummary = summarizeLevelRewards(levelRewards);
        const rewardDelta: RewardDelta = {
          xp: safe.xp,
          coins: clampBalance(safe.coins + levelRewardSummary.coins),
          gems: clampBalance(safe.gems + levelRewardSummary.gems),
          tickets: clampBalance(safe.tickets + levelRewardSummary.tickets),
        };

        set({
          xp: progress.xp,
          level: progress.level,
          coins: clampBalance(get().coins + rewardDelta.coins),
          gems: clampBalance(get().gems + rewardDelta.gems),
          tickets: clampBalance(get().tickets + rewardDelta.tickets),
          claimedLevelRewards: Array.from(
            new Set([...get().claimedLevelRewards, ...levelRewards.map((reward) => reward.level)])
          ),
          offlineQueue: [...get().offlineQueue, rewardDelta],
          justLeveledUp: progress.leveledUp,
          lastLevelRewardSummary: levelRewards.length ? levelRewardSummary : null,
          version: get().version + 1,
        });

        if (options.sync !== false) {
          void get().syncNow?.();
        }
      };

      return {
        daily: defaultDaily,
        streak: 0,
        weekly: defaultWeekly,
        retention: DEFAULT_RETENTION_STATE,

        xp: STARTING_ECONOMY.xp,
        level: STARTING_ECONOMY.level,
        coins: STARTING_ECONOMY.coins,
        gems: STARTING_ECONOMY.gems,
        tickets: STARTING_ECONOMY.tickets,

        vipTier: 0,
        ownedPacks: [],
        inventory: defaultInventory,
        offlineQueue: [],
        syncing: false,
        version: 0,
        lastSync: 0,
        activeBoosts: { xp: 0, coins: 0, gems: 0 },
        justLeveledUp: false,
        lastLevelRewardSummary: null,
        claimedLevelRewards: [],
        recentQuestionIds: [],
        questionSkill: DEFAULT_ADAPTIVE_DIFFICULTY_STATE,
        questionAnalytics: DEFAULT_QUESTION_ANALYTICS_STATE,

        totalGamesPlayed: 0,
        totalWins: 0,
        cosmetics: normalizePlayerCosmeticsState(defaultCosmetics),
        userId: null,
        nickname: null,
        avatarId: null,
        avatarUri: null,
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        bestTournamentFinish: null,
        tournamentHistory: [],
        titles: [],

        clearLevelUpFlag: () => set({ justLeveledUp: false, lastLevelRewardSummary: null }),
        clearOfflineQueue: () => set({ offlineQueue: [] }),
        setUserId: (id) => set({ userId: id }),

        setDaily: (daily) => {
          const normalized = normalizeDaily(daily);
          set({ daily: normalized, streak: normalized.streak, version: get().version + 1 });
          void get().syncNow?.();
        },

        setWeekly: (weekly) => {
          set({ weekly: normalizeWeekly(weekly), version: get().version + 1 });
          void get().syncNow?.();
        },

        claimWeeklyReward: (reward = WEEKLY_DAILY_REWARD) => {
          const weekly = get().weekly;
          if (weekly.claimed) return;
          grantRaw({ xp: reward.xp, coins: reward.coins, gems: reward.gems ?? 0, tickets: reward.tickets ?? 0 });
          set({ weekly: { ...weekly, claimed: true }, version: get().version + 1 });
          const uid = get().userId;
        if (uid) {
  void import("@/seasons/store/useSeasonStore").then(({ useSeasonStore }) =>
    useSeasonStore.getState().addSeasonXp(uid, SEASON_XP.WEEKLY_CLAIM)
  );
}
          void get().syncNow?.();
        },

        recordGameCompletion: (input) => {
          const result = evaluateRetentionAfterGame(get().retention, input);
          set({ retention: result.nextState, version: get().version + 1 });

          const reward = result.reward;
          if (reward.xp || reward.coins || reward.gems || reward.tickets) {
            grantRaw(reward);
          }

          return reward;
        },


        recordRecentQuestions: (ids) => {
          const nextRecentQuestionIds = mergeRecentQuestionIds(get().recentQuestionIds, ids);

          set({ recentQuestionIds: nextRecentQuestionIds, version: get().version + 1 });
          void get().syncNow?.();
        },

        clearRecentQuestions: () => {
          set({ recentQuestionIds: [], version: get().version + 1 });
          void get().syncNow?.();
        },

        recordQuestionPerformance: (result) => {
          const nextQuestionSkill = recordAdaptiveQuestionResult(get().questionSkill, result);

          set({ questionSkill: nextQuestionSkill, version: get().version + 1 });
          void get().syncNow?.();
        },

        clearQuestionSkill: () => {
          set({ questionSkill: DEFAULT_ADAPTIVE_DIFFICULTY_STATE, version: get().version + 1 });
          void get().syncNow?.();
        },

        recordQuestionAnalytics: (result) => {
          const nextQuestionAnalytics = recordQuestionAnalyticsResult(get().questionAnalytics, result);

          // Analytics is persisted locally and included in the next normal player sync.
          // Avoid triggering an extra network sync for every single answer.
          set({ questionAnalytics: nextQuestionAnalytics, version: get().version + 1 });
        },

        clearQuestionAnalytics: () => {
          set({ questionAnalytics: DEFAULT_QUESTION_ANALYTICS_STATE, version: get().version + 1 });
          void get().syncNow?.();
        },

        setCosmetics: (cosmetics) => {
          set({ cosmetics: normalizePlayerCosmeticsState(cosmetics), version: get().version + 1 });
          void get().syncNow?.();
        },

        isCosmeticOwned: (id) => normalizePlayerCosmeticsState(get().cosmetics).owned?.[id] === true,

        purchaseCosmetic: (id) => {
          const item = COSMETICS_CATALOG.find((c) => c.id === id);
          if (!item || !item.price) return { success: false, reason: "NOT_FOUND" };
          if (item.vipOnly && !useEntitlementStore.getState().isVIPActive()) {
            return { success: false, reason: "VIP_REQUIRED" };
          }

          const currentCosmetics = normalizePlayerCosmeticsState(get().cosmetics);
          if (currentCosmetics.owned?.[id] === true) return { success: false, reason: "ALREADY_OWNED" };

          if (item.price.currency === "COINS") {
            if (!get().spendCoins(item.price.amount)) return { success: false, reason: "INSUFFICIENT_COINS" };
          } else if (item.price.currency === "GEMS") {
            if (!get().spendGems(item.price.amount)) return { success: false, reason: "INSUFFICIENT_GEMS" };
          } else {
            return { success: false, reason: "NOT_FOUND" };
          }

          set({
            cosmetics: normalizePlayerCosmeticsState({
              owned: { ...currentCosmetics.owned, [id]: true },
              equipped: { ...currentCosmetics.equipped, [item.category]: id },
            }),
            version: get().version + 1,
          });
          void get().syncNow?.();
          return { success: true };
        },

        equipCosmetic: (id) => {
          const item = COSMETICS_CATALOG.find((c) => c.id === id);
          const currentCosmetics = normalizePlayerCosmeticsState(get().cosmetics);
          if (!item || currentCosmetics.owned?.[id] !== true) return false;
          if (item.vipOnly && !useEntitlementStore.getState().isVIPActive()) return false;
          set({
            cosmetics: normalizePlayerCosmeticsState({
              ...currentCosmetics,
              equipped: { ...currentCosmetics.equipped, [item.category]: id },
            }),
            version: get().version + 1,
          });
          void get().syncNow?.();
          return true;
        },

        unequipCosmetic: (type) => {
          const currentCosmetics = normalizePlayerCosmeticsState(get().cosmetics);
          const equipped = {
            ...(currentCosmetics.equipped ?? {}),
          } as unknown as Record<string, string | undefined>;
          delete equipped[type];
          set({
            cosmetics: normalizePlayerCosmeticsState({
              ...currentCosmetics,
              equipped: equipped as unknown as PlayerCosmeticsState["equipped"],
            }),
            version: get().version + 1,
          });
          void get().syncNow?.();
        },

        setNickname: (name) => {
          set({ nickname: name.trim().length ? name.trim() : null, version: get().version + 1 });
          void get().syncNow?.();
        },
        setAvatar: (id) => {
          set({ avatarId: id, avatarUri: null, version: get().version + 1 });
          void get().syncNow?.();
        },
        setAvatarUri: (uri) => {
          set({ avatarUri: uri, version: get().version + 1 });
          void get().syncNow?.();
        },
        resetGuestIdentity: () => set({ userId: null, nickname: null, avatarId: null, avatarUri: null }),

        applyReward: (xp, coins = 0, gems = 0, tickets = 0) => {
          const entitlements = useEntitlementStore.getState();
          entitlements.clearExpired();

          const boostAdjusted = applyRewardMultipliers(
            { xp, coins, gems, tickets },
            0,
            {
              xp: get().activeBoosts.xp + (entitlements.getActiveBoostMultiplier("xp") - 1),
              coins: get().activeBoosts.coins + (entitlements.getActiveBoostMultiplier("coins") - 1),
              gems: get().activeBoosts.gems,
            }
          );

          const vipPerks = getVipPerks(entitlements.isVIPActive(), entitlements.getVIPTier());
          grantRaw(applyVipRewardPerks(boostAdjusted, vipPerks));
        },

        applyDailyReward: (daily, reward) => {
          const entitlements = useEntitlementStore.getState();
          entitlements.clearExpired();

          const boostAdjusted = applyRewardMultipliers(
            reward,
            0,
            {
              xp: get().activeBoosts.xp + (entitlements.getActiveBoostMultiplier("xp") - 1),
              coins: get().activeBoosts.coins + (entitlements.getActiveBoostMultiplier("coins") - 1),
              gems: get().activeBoosts.gems,
            }
          );

          const vipPerks = getVipPerks(entitlements.isVIPActive(), entitlements.getVIPTier());
          grantRaw(applyVipRewardPerks(boostAdjusted, vipPerks), { sync: false });

          const normalizedDaily = normalizeDaily(daily);
          set({
            daily: normalizedDaily,
            streak: normalizedDaily.streak,
            version: get().version + 1,
          });

          void get().syncNow?.();
        },
        addCoins: (amount) => grantRaw({ coins: amount }),
        addGems: (amount) => grantRaw({ gems: amount }),
        addTickets: (amount) => grantRaw({ tickets: amount }),
        addXPDirect: (amount) => grantRaw({ xp: amount }),

        spendCoins: (amount) => {
          const safe = clampBalance(amount);
          if (get().coins < safe) return false;
          set({ coins: clampBalance(get().coins - safe), version: get().version + 1 });
          void get().syncNow?.();
          return true;
        },
        spendGems: (amount) => {
          const safe = clampBalance(amount);
          if (get().gems < safe) return false;
          set({ gems: clampBalance(get().gems - safe), version: get().version + 1 });
          void get().syncNow?.();
          return true;
        },
        spendTickets: (amount) => {
          const safe = clampBalance(amount);
          if (get().tickets < safe) return false;
          set({ tickets: clampBalance(get().tickets - safe), version: get().version + 1 });
          void get().syncNow?.();
          return true;
        },

        incrementGamesPlayed: () => { set({ totalGamesPlayed: get().totalGamesPlayed + 1, version: get().version + 1 }); void get().syncNow?.(); },
        incrementWins: () => { set({ totalWins: get().totalWins + 1, version: get().version + 1 }); void get().syncNow?.(); },
        incrementDailyStreak: () => {
          const d = get().daily;
          get().setDaily({ lastClaimDate: getDayKeyUTC(), streak: d.streak + 1, totalClaims: d.totalClaims + 1 });
        },
        resetDailyStreak: () => get().setDaily(defaultDaily),

        grantItem: (id, qty) => {
          const inv = { ...get().inventory };
          inv[id] = clampBalance((inv[id] || 0) + qty);
          set({ inventory: inv, version: get().version + 1 });
          void get().syncNow?.();
        },
        addBooster: (id) => get().grantItem(id, 1),
        consumeItem: (id) => {
          const inv = { ...get().inventory };
          if (!inv[id] || inv[id] <= 0) return;
          inv[id] = clampBalance(inv[id] - 1);
          set({ inventory: inv, version: get().version + 1 });
          void get().syncNow?.();
        },
        purchasePack: (id) => {
          const owned = Array.from(new Set([...get().ownedPacks, id]));
          set({ ownedPacks: owned, version: get().version + 1 });
          void get().syncNow?.();
        },
        upgradeVIP: (tier) => get().setVIPTier(tier),
        setVIPTier: (tier) => {
          set({ vipTier: Math.max(0, Math.min(4, Math.floor(tier || 0))), version: get().version + 1 });
          void get().syncNow?.();
        },
        activateBoost: (type, value, duration) => {
          if (type !== "xp" && type !== "coins" && type !== "gems") return;

          const boosts = { ...get().activeBoosts };
          boosts[type] = Math.max(0, value);

          set({ activeBoosts: boosts, version: get().version + 1 });

          setTimeout(() => {
            const activeBoosts = { ...get().activeBoosts };
            activeBoosts[type] = 0;
            set({ activeBoosts, version: get().version + 1 });
          }, duration);
        },
        useBoost: (type) => {
          if (!get().inventory[type] || get().inventory[type] <= 0) return;
          get().consumeItem(type);
          if (type === "xpBoost1") get().activateBoost("xp", 0.5, 60_000);
          if (type === "xpBoost2") get().activateBoost("xp", 1.0, 120_000);
          if (type === "coinBoost1") get().activateBoost("coins", 0.5, 60_000);
          if (type === "gemPack1") get().addGems(5);
        },

        purchaseCoinsPack: (coins) => get().addCoins(coins),
        purchaseGemsPack: (gems) => get().addGems(gems),
        purchaseVIPTier: (tier) => get().setVIPTier(Math.max(get().vipTier, tier)),
        purchaseInventoryItem: (id, qty) => get().grantItem(id, qty),
        awardArenaBonus: (xp, coins, gems) => get().applyReward(xp, coins, gems),
        awardSeasonXP: (xp) => get().applyReward(xp, 0, 0),
        resetSeasonProgress: () => set({}),
        grantSeasonalItem: (id, qty) => get().grantItem(id, qty),

        recordTournamentResult: ({ position, totalPlayers }) => {
          const titles = new Set(get().titles);
          if (position === 1) titles.add("Champion");
          if (position === 2) titles.add("Finalist");
          if (position <= 3 && totalPlayers >= 8) titles.add("Top 3 Finisher");
          set({
            tournamentsPlayed: get().tournamentsPlayed + 1,
            tournamentsWon: position === 1 ? get().tournamentsWon + 1 : get().tournamentsWon,
            bestTournamentFinish: get().bestTournamentFinish === null ? position : Math.min(get().bestTournamentFinish!, position),
            titles: Array.from(titles),
            tournamentHistory: [
              { tournamentId: `t-${Date.now()}`, position, totalPlayers, timestamp: Date.now() },
              ...get().tournamentHistory,
            ].slice(0, 50),
            version: get().version + 1,
          });
          void get().syncNow?.();
        },

        loadCloudProfile: async () => {
          const userId = auth.currentUser?.uid ?? null;
          if (!userId) return;
          set({ userId });

          const startedAt = Date.now();

          try {
            const snap = await getDoc(doc(db, "players", userId));
            if (!snap.exists()) {
              await recordSyncDiagnostic({
                area: "player",
                status: "skipped",
                userId,
                localVersion: readPlayerVersion(get().version),
                reason: "cloud_profile_missing",
              });
              await get().flushQueue(userId);
              return;
            }

            const cloud = snap.data() as CloudPlayerState;
            const local = get();
            const localVersion = readPlayerVersion(local.version);
            const cloudVersion = readPlayerVersion(cloud.version);
            const useCloud = shouldUseCloudPlayerState(localVersion, cloudVersion);
            const normalizedCloudDaily = normalizeDaily(cloud.daily);
            const selectedDaily = pickNewestDaily(local.daily, cloud.daily);

            await recordSyncDiagnostic({
              area: "player",
              status: useCloud ? "merged_cloud" : "merged_local",
              userId,
              localVersion,
              cloudVersion,
              durationMs: Date.now() - startedAt,
            });

            set({
            xp: clampBalance(useCloud ? cloud.xp ?? local.xp : local.xp),
            level: Math.max(1, Math.floor(useCloud ? cloud.level ?? local.level : local.level)),
            coins: clampBalance(useCloud ? cloud.coins ?? local.coins : local.coins),
            gems: clampBalance(useCloud ? cloud.gems ?? local.gems : local.gems),
            tickets: clampBalance(useCloud ? cloud.tickets ?? local.tickets : local.tickets),
            vipTier: Math.max(0, Math.min(4, Math.floor(useCloud ? cloud.vipTier ?? local.vipTier : local.vipTier))),
            ownedPacks: useCloud && Array.isArray(cloud.ownedPacks) ? cloud.ownedPacks : local.ownedPacks,
            inventory: { ...defaultInventory, ...(useCloud ? cloud.inventory ?? local.inventory : local.inventory) },
            daily: selectedDaily,
            streak: selectedDaily.streak,
            weekly: useCloud ? normalizeWeekly(cloud.weekly ?? local.weekly) : normalizeWeekly(local.weekly),
            retention: useCloud ? normalizeRetentionState(cloud.retention ?? local.retention) : normalizeRetentionState(local.retention),
            cosmetics: normalizePlayerCosmeticsState(useCloud ? cloud.cosmetics ?? local.cosmetics : local.cosmetics),
            nickname: useCloud ? cloud.nickname ?? cloud.displayName ?? local.nickname : local.nickname ?? cloud.nickname ?? cloud.displayName ?? null,
            avatarId: useCloud ? cloud.avatarId ?? local.avatarId : local.avatarId ?? cloud.avatarId ?? null,
            avatarUri: useCloud ? cloud.avatarUri ?? cloud.photoURL ?? local.avatarUri : local.avatarUri ?? cloud.avatarUri ?? cloud.photoURL ?? null,
            totalGamesPlayed: clampBalance(useCloud ? cloud.totalGamesPlayed ?? local.totalGamesPlayed : local.totalGamesPlayed),
            totalWins: clampBalance(useCloud ? cloud.totalWins ?? local.totalWins : local.totalWins),
            tournamentsPlayed: clampBalance(useCloud ? cloud.tournamentsPlayed ?? local.tournamentsPlayed : local.tournamentsPlayed),
            tournamentsWon: clampBalance(useCloud ? cloud.tournamentsWon ?? local.tournamentsWon : local.tournamentsWon),
            bestTournamentFinish: useCloud ? cloud.bestTournamentFinish ?? local.bestTournamentFinish : local.bestTournamentFinish,
            titles: useCloud && Array.isArray(cloud.titles) ? cloud.titles : local.titles,
            tournamentHistory: useCloud && Array.isArray(cloud.tournamentHistory) ? cloud.tournamentHistory.slice(0, 50) : local.tournamentHistory,
            version: Math.max(localVersion, cloudVersion),
            offlineQueue: useCloud ? [] : local.offlineQueue,
            lastSync: Date.now(),
            justLeveledUp: false,
            lastLevelRewardSummary: null,
            claimedLevelRewards: useCloud && Array.isArray(cloud.claimedLevelRewards) ? cloud.claimedLevelRewards : local.claimedLevelRewards,
            recentQuestionIds: normalizeRecentQuestionIds(useCloud ? cloud.recentQuestionIds ?? local.recentQuestionIds : local.recentQuestionIds),
            questionSkill: normalizeAdaptiveDifficultyState(useCloud ? cloud.questionSkill ?? local.questionSkill : local.questionSkill),
            questionAnalytics: normalizeQuestionAnalyticsState(useCloud ? cloud.questionAnalytics ?? local.questionAnalytics : local.questionAnalytics),
          });

            if (!useCloud || !dailyStatesEqual(selectedDaily, normalizedCloudDaily)) {
              void get().syncNow?.();
            }
          } catch (error) {
            await recordSyncFailure(error, {
              area: "player",
              userId,
              localVersion: readPlayerVersion(get().version),
              reason: "load_cloud_profile_failed",
              durationMs: Date.now() - startedAt,
            });
          }
        },

        flushQueue: async (userId: string) => {
          if (!userId) return;
          const startedAt = Date.now();
          const payload = {
            xp: get().xp,
            level: get().level,
            coins: get().coins,
            gems: get().gems,
            tickets: get().tickets,
            daily: get().daily,
            weekly: get().weekly,
            retention: get().retention,
            vipTier: get().vipTier,
            ownedPacks: get().ownedPacks,
            inventory: get().inventory,
            cosmetics: get().cosmetics,
            totalGamesPlayed: get().totalGamesPlayed,
            totalWins: get().totalWins,
            tournamentsPlayed: get().tournamentsPlayed,
            tournamentsWon: get().tournamentsWon,
            bestTournamentFinish: get().bestTournamentFinish,
            titles: get().titles,
            tournamentHistory: get().tournamentHistory,
            claimedLevelRewards: get().claimedLevelRewards,
            recentQuestionIds: get().recentQuestionIds,
            questionSkill: get().questionSkill,
            questionAnalytics: get().questionAnalytics,
            nickname: get().nickname,
            avatarId: get().avatarId,
            avatarUri: get().avatarUri,
            version: get().version + 1,
            updatedAt: serverTimestamp(),
          };
          await recordSyncDiagnostic({
            area: "player",
            status: "started",
            userId,
            localVersion: get().version,
            queueSize: get().offlineQueue.length,
          });

          await setDoc(doc(db, "players", userId), payload, { merge: true });
          set({ offlineQueue: [], version: payload.version, lastSync: Date.now() });

          await recordSyncDiagnostic({
            area: "player",
            status: "succeeded",
            userId,
            localVersion: payload.version,
            queueSize: 0,
            durationMs: Date.now() - startedAt,
          });
        },

        syncNow: async () => {
          const userId = auth.currentUser?.uid ?? null;
          if (!userId) return;

          if (playerSyncPromise) {
            playerSyncPending = true;
            await playerSyncPromise;
            return;
          }

          const net = await NetInfo.fetch();
          if (!net.isConnected) {
            await recordSyncDiagnostic({
              area: "player",
              status: "skipped",
              userId,
              localVersion: readPlayerVersion(get().version),
              queueSize: get().offlineQueue.length,
              reason: "offline",
            });
            return;
          }

          playerSyncPromise = (async () => {
            set({ syncing: true });
            try {
              do {
                playerSyncPending = false;
                await get().flushQueue(userId);
              } while (playerSyncPending && auth.currentUser?.uid === userId);
            } catch (error) {
              await recordSyncFailure(error, {
                area: "player",
                userId,
                localVersion: readPlayerVersion(get().version),
                queueSize: get().offlineQueue.length,
                reason: "sync_now_failed",
              });
            } finally {
              set({ syncing: false });
              playerSyncPromise = null;
            }
          })();

          await playerSyncPromise;
        },
      };
    },
    {
      name: "player-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<PlayerStoreState> | undefined;

        return {
          ...state,
          xp: clampBalance(state?.xp ?? STARTING_ECONOMY.xp),
          level: Math.max(1, Math.floor(state?.level ?? STARTING_ECONOMY.level)),
          coins: clampBalance(state?.coins ?? STARTING_ECONOMY.coins),
          gems: clampBalance(state?.gems ?? STARTING_ECONOMY.gems),
          tickets: clampBalance(state?.tickets ?? STARTING_ECONOMY.tickets),
          daily: normalizeDaily(state?.daily),
          streak: normalizeDaily(state?.daily).streak,
          weekly: normalizeWeekly(state?.weekly),
          retention: normalizeRetentionState(state?.retention),
          inventory: { ...defaultInventory, ...(state?.inventory ?? {}) },
          cosmetics: normalizePlayerCosmeticsState(state?.cosmetics ?? defaultCosmetics),
          offlineQueue: [],
          syncing: false,
          lastLevelRewardSummary: null,
          claimedLevelRewards: Array.isArray(state?.claimedLevelRewards) ? state.claimedLevelRewards : [],
          recentQuestionIds: normalizeRecentQuestionIds(state?.recentQuestionIds),
          questionSkill: normalizeAdaptiveDifficultyState(state?.questionSkill),
          questionAnalytics: normalizeQuestionAnalyticsState(state?.questionAnalytics),
        };
      },
    }
  )
);



