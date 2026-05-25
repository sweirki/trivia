import type { DailyState } from "@/daily/types";
import type { PlayerCosmeticsState } from "@/cosmetics/playerCosmetics";
import type { RetentionGameInput, RetentionState } from "@/economy/retentionEngine";
import type { AdaptiveDifficultyState, AdaptiveQuestionResult } from "@/questions/adaptiveDifficulty";
import type { QuestionAnalyticsResult, QuestionAnalyticsState } from "@/questions/questionAnalytics";

export type WeeklyState = {
  weekKey: string;
  progress: number;
  claimed: boolean;
  lastDailyPlayDate: string | null;
};

export type RewardDelta = {
  xp: number;
  coins: number;
  gems: number;
  tickets: number;
};

export type PurchaseCosmeticResult = {
  success: boolean;
  reason?: "ALREADY_OWNED" | "INSUFFICIENT_COINS" | "INSUFFICIENT_GEMS" | "NOT_FOUND" | "VIP_REQUIRED";
};

export type TournamentHistoryEntry = {
  tournamentId: string;
  position: number;
  totalPlayers: number;
  timestamp: number;
};

export interface PlayerStoreState {
  daily: DailyState;
  streak: number;
  setDaily: (daily: DailyState) => void;
  weekly: WeeklyState;
  setWeekly: (weekly: WeeklyState) => void;
  claimWeeklyReward: (reward?: { xp: number; coins: number; gems?: number; tickets?: number }) => void;

  retention: RetentionState;
  recordGameCompletion: (input: RetentionGameInput) => RewardDelta;

  recentQuestionIds: string[];
  recordRecentQuestions: (ids: Array<string | number>) => void;
  clearRecentQuestions: () => void;

  questionSkill: AdaptiveDifficultyState;
  recordQuestionPerformance: (result: AdaptiveQuestionResult) => void;
  clearQuestionSkill: () => void;

  questionAnalytics: QuestionAnalyticsState;
  recordQuestionAnalytics: (result: QuestionAnalyticsResult) => void;
  clearQuestionAnalytics: () => void;

  purchaseCosmetic: (id: string) => PurchaseCosmeticResult;
  isCosmeticOwned: (id: string) => boolean;
  equipCosmetic: (id: string) => boolean;
  unequipCosmetic: (type: "avatar" | "frame" | "badge" | "theme" | string) => void;

  justLeveledUp: boolean;
  lastLevelRewardSummary: RewardDelta | null;
  claimedLevelRewards: number[];
  clearLevelUpFlag: () => void;

  totalGamesPlayed: number;
  totalWins: number;
  incrementGamesPlayed: () => void;
  incrementWins: () => void;
  incrementDailyStreak: () => void;
  resetDailyStreak: () => void;

  cosmetics: PlayerCosmeticsState;
  setCosmetics: (cosmetics: PlayerCosmeticsState) => void;

  userId: string | null;
  setUserId: (id: string | null) => void;

  xp: number;
  level: number;
  coins: number;
  gems: number;
  tickets: number;

  vipTier: number;
  setVIPTier: (tier: number) => void;
  ownedPacks: string[];
  inventory: Record<string, number>;

  offlineQueue: RewardDelta[];
  syncing: boolean;
  version: number;
  lastSync: number;
  activeBoosts: { xp: number; coins: number; gems: number };

  applyReward: (xp: number, coins?: number, gems?: number, tickets?: number) => void;
  applyDailyReward: (daily: DailyState, reward: RewardDelta) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addTickets: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;
  spendTickets: (amount: number) => boolean;

  syncNow: () => Promise<void>;
  flushQueue: (userId: string) => Promise<void>;
  loadCloudProfile: () => Promise<void>;
  clearOfflineQueue: () => void;

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

  awardArenaBonus: (xp: number, coins: number, gems: number) => void;
  awardSeasonXP: (xp: number) => void;
  resetSeasonProgress: () => void;
  grantSeasonalItem: (id: string, qty: number) => void;
  addXPDirect: (amount: number) => void;

  nickname: string | null;
  avatarId: string | null;
  avatarUri: string | null;
  setNickname: (name: string) => void;
  setAvatar: (id: string) => void;
  setAvatarUri: (uri: string | null) => void;
  resetGuestIdentity: () => void;

  tournamentsPlayed: number;
  tournamentsWon: number;
  bestTournamentFinish: number | null;
  titles: string[];
  tournamentHistory: TournamentHistoryEntry[];
  recordTournamentResult: (result: { position: number; totalPlayers: number }) => void;
}



