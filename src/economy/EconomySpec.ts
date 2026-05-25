// src/economy/EconomySpec.ts
/**
 * ============================================================
 * ECONOMY SPEC — PHASE D1 (LOCKED CONTRACT)
 * ============================================================
 *
 * This file is the single source of truth for the game's economy.
 * - NO UI in Phase D1.
 * - NO logic changes in Phase D1.
 * - Later phases (D2/D3/D4) MUST obey this contract.
 *
 * If we ever change economy rules, we do it ONLY by editing this file
 * intentionally and explicitly.
 */

/**
 * ------------------------------------------------------------
 * 1) CURRENCIES (GLOBAL)
 * ------------------------------------------------------------
 *
 * Notes from current codebase:
 * - coins, gems, tickets, vipTier exist in src/store/usePlayerStore.ts
 * - VIP currently affects reward gain multiplier (xp + coins) via vipMulti()
 * - Tickets are currently granted by DAILY_CHALLENGE_REWARD (challenges/dailyReward.ts)
 */

export type Currency = "COINS" | "GEMS" | "TICKETS";

/**
 * What each currency means (design contract).
 *
 * IMPORTANT: ArenaTokens currently exist but are NOT a global currency.
 * They live in src/arena/store/useArenaEconomyStore.ts and are Arena-only.
 * We treat them as "mode currency" and do NOT mix them into global economy
 * unless Phase D3 explicitly expands economy scope.
 */
export const CURRENCY_PURPOSE = {
  COINS: {
    name: "Coins",
    type: "soft",
    purpose:
      "Primary earnable currency. Used for cosmetic purchases and non-power progression convenience (not gameplay power).",
    canBuy: [
      "Cosmetics (avatars, frames, backgrounds, badges)",
      "Non-gameplay convenience items ONLY (visual, cosmetic, or time-saving that does NOT change outcomes)",
      "Arena entry fees only if explicitly allowed in Economy Rules",
    ],
    cannotBuy: [
      "Correct answers",
      "Damage / power boosts that change win probability",
      "Any direct gameplay advantage (pay-to-win)",
    ],
  },

  GEMS: {
    name: "Gems",
    type: "premium",
    purpose:
      "Premium currency. Rarely earned. Used for premium cosmetics and premium convenience, but never gameplay power.",
    canBuy: [
      "Premium cosmetics / limited cosmetics",
      "Premium convenience (strictly non-competitive, non-power)",
    ],
    cannotBuy: [
      "Competitive advantage",
      "Guaranteed wins",
      "Answer reveals in competitive modes (unless very carefully limited later)",
    ],
  },

  TICKETS: {
    name: "Tickets",
    type: "entry",
    purpose:
      "Entry / retry currency. Used to participate in gated content (Arena, tournaments, special events).",
    canBuy: ["Entry into special modes/events", "Retries where allowed"],
    cannotBuy: [
      "Cosmetics (keep separate for clarity)",
      "Direct power",
      "Guaranteed rewards",
    ],
  },
} as const;

/**
 * ------------------------------------------------------------
 * 2) VIP (STATUS, NOT A CURRENCY)
 * ------------------------------------------------------------
 *
 * Current implementation (usePlayerStore.ts):
 * tier 0 => 1.0
 * tier 1 => 1.25
 * tier 2 => 1.5
 * tier 3 => 2.0
 * tier 4 => 3.0   (upgradeVIP clamps to 4)
 *
 * D1 contract: VIP may multiply *earned rewards*, but must NOT unlock gameplay power.
 */
export type VipTier = 0 | 1 | 2 | 3 | 4;

export const VIP_MULTIPLIERS: Record<VipTier, number> = {
  0: 1,
  1: 1.25,
  2: 1.5,
  3: 2,
  4: 3,
};

/**
 * ------------------------------------------------------------
 * 3) REWARD SOURCES AUDIT (CURRENT REAL VALUES)
 * ------------------------------------------------------------
 *
 * This section documents what the app currently gives.
 * We are NOT changing these values in D1—only documenting them.
 */

export type RewardSourceId =
  | "DAILY_LOGIN_STREAK"
  | "DAILY_CHALLENGE"
  | "WEEKLY_CHALLENGE"
  | "SEASON_TIER_REWARD"
  | "ARENA_RANKED_MATCH"
  | "ARENA_SURVIVAL_RUN"
  | "ARENA_POWER_MATCH"
  | "ACHIEVEMENTS"; // mostly future-ready in current code

export type RewardFrequency =
  | "ONCE_PER_DAY"
  | "ONCE_PER_WEEK"
  | "ONCE_PER_SEASON_TIER"
  | "PER_MATCH"
  | "PER_RUN"
  | "EVENT_DRIVEN";

export type RewardAuditRow = {
  id: RewardSourceId;
  title: string;
  frequency: RewardFrequency;
  gives: {
    xp?: string; // string because some are tables/formulas
    coins?: string;
    gems?: string;
    tickets?: string;
    notes?: string;
  };
  codeRefs: string[]; // file paths that define/implement the reward
};

export const REWARD_SOURCES_AUDIT: RewardAuditRow[] = [
  {
    id: "DAILY_LOGIN_STREAK",
    title: "Daily Login Streak Reward",
    frequency: "ONCE_PER_DAY",
    gives: {
      xp: "Day 1–6: 20,25,30,40,50,65; Day 7+: 100",
      coins: "Day 1–6: 50,60,75,90,120,150; Day 7+: 250",
      notes: "Table is streak-based. After streak>=7, fixed reward.",
    },
    codeRefs: ["src/daily/rewardTable.ts"],
  },
  {
    id: "DAILY_CHALLENGE",
    title: "Daily Challenge Reward",
    frequency: "ONCE_PER_DAY",
    gives: {
      xp: "25",
      coins: "50",
      tickets: "1",
      notes: "This is the 'daily challenge reward' constant.",
    },
    codeRefs: ["src/challenges/dailyReward.ts"],
  },
  {
    id: "WEEKLY_CHALLENGE",
    title: "Weekly Challenge Reward (complete 5 dailies)",
    frequency: "ONCE_PER_WEEK",
    gives: {
      xp: "300",
      coins: "100",
      notes: "Weekly target currently = 5 Daily games.",
    },
    codeRefs: ["app/(app)/hub/index.tsx", "src/seasons/seasonXpRules.ts"],
  },
  {
    id: "SEASON_TIER_REWARD",
    title: "Season Tier Claim Reward (coins only)",
    frequency: "ONCE_PER_SEASON_TIER",
    gives: {
      coins: "Tier 1: 50, Tier 2: 100, Tier 3: 200, Tier 4: 400",
      notes: "Claimed tiers are one-time per season.",
    },
    codeRefs: ["src/seasons/store/useSeasonStore.ts", "src/seasons/seasonDefinitions.ts"],
  },
  {
    id: "ARENA_RANKED_MATCH",
    title: "Arena Ranked Reward",
    frequency: "PER_MATCH",
    gives: {
      coins: "coins = 20 + playerScore * 5",
      notes: "Also grants ArenaTokens on win (Arena-only currency).",
    },
    codeRefs: ["src/arena/store/useArenaRewardsEngine.ts", "src/arena/store/useArenaEconomyStore.ts"],
  },
  {
    id: "ARENA_SURVIVAL_RUN",
    title: "Arena Survival Reward",
    frequency: "PER_RUN",
    gives: {
      coins: "coins = min(150, rounds * 6)",
      notes: "Also grants ArenaTokens at rounds>=10 and >=20.",
    },
    codeRefs: ["src/arena/store/useArenaRewardsEngine.ts", "src/arena/store/useArenaEconomyStore.ts"],
  },
  {
    id: "ARENA_POWER_MATCH",
    title: "Arena Power Match Reward",
    frequency: "PER_MATCH",
    gives: {
      coins: "coins = score * 8",
      notes: "Also grants ArenaTokens based on efficiency/perfect play.",
    },
    codeRefs: ["src/arena/store/useArenaRewardsEngine.ts", "src/arena/store/useArenaEconomyStore.ts"],
  },
  {
    id: "ACHIEVEMENTS",
    title: "Achievements",
    frequency: "EVENT_DRIVEN",
    gives: {
      xp: "Defined per achievement (currently mostly none)",
      coins: "Defined per achievement (currently mostly none)",
      notes: "Achievement definitions support rewards but most are not populated yet.",
    },
    codeRefs: ["src/achievements/achievementDefinitions.ts"],
  },
];

/**
 * ------------------------------------------------------------
 * 4) ECONOMY RULES (HARD INVARIANTS)
 * ------------------------------------------------------------
 *
 * These are the guardrails to prevent inflation and pay-to-win.
 * If a future feature conflicts with these, the feature changes—not the rules.
 */
export const ECONOMY_RULES = {
  // ----- Anti Pay-to-Win -----
  gameplayPowerIsForbidden: true,
  "coins/gems_must_not_buy_gameplay_advantage": true,

  // ----- VIP Rules -----
  vipCanMultiplyEarnings: true,
  vipCannotUnlockPower: true,

  // ----- Caps (Design Targets) -----
  /**
   * These are design caps used to judge future rewards.
   * They are NOT enforced in code in D1.
   * (Enforcement can be added later if needed.)
   */
  maxDailyCoinIncomeTarget: 800,
  maxWeeklyGemIncomeTarget: 30,

  // ----- Tickets -----
  ticketsAreForEntryOnly: true,

  // ----- Cosmetics -----
  cosmeticsAreCosmeticOnly: true,

  // ----- Notes -----
  notes: [
    "ArenaTokens remain Arena-only; do not leak into global economy unless Phase D3 explicitly upgrades the economy scope.",
    "If we add new reward sources, they must be listed in REWARD_SOURCES_AUDIT first (documentation before implementation).",
  ],
} as const;

/**
 * ------------------------------------------------------------
 * 5) SINKS (WHERE CURRENCY LEAVES THE ECONOMY)
 * ------------------------------------------------------------
 *
 * Current observed sinks:
 * - Cosmetic purchases (coins) — src/cosmetics/types.ts + playerStore.purchaseCosmetic()
 * - Offer purchases (coins) — src/store/offers.ts (coins -> packs/tickets/boosts)
 * - Arena shop purchases (coins) via ArenaEconomyStore.spendCoins()
 *
 * Phase D2 will formalize cosmetics pricing by rarity. Phase D1 only documents.
 */
export type SinkAuditRow = {
  title: string;
  spends: Partial<Record<Currency, string>>;
  notes?: string;
  codeRefs: string[];
};

export const SINKS_AUDIT: SinkAuditRow[] = [
  {
    title: "Cosmetics purchase (coins)",
    spends: { COINS: "price per catalog item" },
    notes: "Currently cosmetics catalog uses coins pricing.",
    codeRefs: ["src/store/usePlayerStore.ts", "src/cosmetics/catalog.ts", "src/cosmetics/types.ts"],
  },
  {
    title: "Offer purchases (coins -> packs/tickets/boosts)",
    spends: { COINS: "prices: 500..1600 (varies by offer)" },
    notes: "These are convenience items; must remain non-power per D1 rules.",
    codeRefs: ["src/store/offers.ts"],
  },
  {
    title: "Arena shop spending (coins, arena tokens)",
    spends: { COINS: "varies", TICKETS: "entry if implemented later" },
    notes: "ArenaTokens are separate; not included as global currency in this spec.",
    codeRefs: ["src/arena/store/useArenaEconomyStore.ts", "src/arena/shop/index.tsx"],
  },
];




