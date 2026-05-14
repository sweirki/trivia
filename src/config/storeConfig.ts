export type StoreCurrency = "COINS" | "GEMS" | "REAL";
export type StoreSection = "PLAY_MORE" | "GEMS" | "BOOSTS" | "BUNDLES" | "VIP" | "COSMETICS";

export type GemProduct = {
  id: string;
  section: "GEMS";
  title: string;
  description: string;
  amount: number;
  bonusAmount: number;
  priceLabel: string;
  revenueCatId: string;
  enabled: boolean;
};

export type TicketProduct = {
  id: string;
  section: "PLAY_MORE";
  title: string;
  description: string;
  amount: number;
  cost: number;
  costCurrency: "COINS";
  enabled: boolean;
  badge?: string;
};


export type BundleProduct = {
  id: string;
  section: "BUNDLES";
  title: string;
  description: string;
  tickets: number;
  boostType?: "xp" | "coins";
  multiplier?: number;
  durationSeconds?: number;
  cost: number;
  costCurrency: "COINS" | "GEMS";
  enabled: boolean;
  badge?: string;
};

export type BoostProduct = {
  id: string;
  section: "BOOSTS";
  title: string;
  description: string;
  boostType: "xp" | "coins";
  multiplier: number;
  durationSeconds: number;
  cost: number;
  costCurrency: "GEMS";
  enabled: boolean;
  badge?: string;
};

export type VipProduct = {
  id: string;
  section: "VIP";
  title: string;
  description: string;
  priceLabel: string;
  revenueCatId: string;
  durationDays: number;
  enabled: boolean;
  perks: string[];
};

export const STORE_CONFIG = {
  gems: [
    {
      id: "gems_100",
      section: "GEMS",
      title: "Starter Gems",
      description: "A small premium boost for cosmetics and boosters.",
      amount: 100,
      bonusAmount: 0,
      priceLabel: "$0.99",
      revenueCatId: "gems_100",
      enabled: true,
    },
    {
      id: "gems_250",
      section: "GEMS",
      title: "Value Gems",
      description: "More gems with better value.",
      amount: 250,
      bonusAmount: 25,
      priceLabel: "$1.99",
      revenueCatId: "gems_250",
      enabled: true,
    },
    {
      id: "gems_700",
      section: "GEMS",
      title: "Power Gems",
      description: "Best for boosts, cosmetics, and future premium content.",
      amount: 700,
      bonusAmount: 140,
      priceLabel: "$4.99",
      revenueCatId: "gems_700",
      enabled: true,
    },
    {
      id: "gems_1500",
      section: "GEMS",
      title: "Legend Gems",
      description: "Largest gem bundle with the strongest value.",
      amount: 1500,
      bonusAmount: 600,
      priceLabel: "$9.99",
      revenueCatId: "gems_1500",
      enabled: true,
    },
  ] satisfies GemProduct[],

  tickets: [
    {
      id: "tickets_small",
      section: "PLAY_MORE",
      title: "5 Tickets",
      description: "Quick refill when you want a few more games.",
      amount: 5,
      cost: 150,
      costCurrency: "COINS",
      enabled: true,
    },
    {
      id: "tickets_medium",
      section: "PLAY_MORE",
      title: "15 Tickets",
      description: "Better value for a longer play session.",
      amount: 15,
      cost: 400,
      costCurrency: "COINS",
      enabled: true,
      badge: "VALUE",
    },
    {
      id: "tickets_large",
      section: "PLAY_MORE",
      title: "40 Tickets",
      description: "Best ticket value using coins.",
      amount: 40,
      cost: 900,
      costCurrency: "COINS",
      enabled: true,
      badge: "BEST",
    },
    {
      id: "tickets_marathon",
      section: "PLAY_MORE",
      title: "75 Tickets",
      description: "A deep refill for weekend sessions and category grinds.",
      amount: 75,
      cost: 1500,
      costCurrency: "COINS",
      enabled: true,
      badge: "MARATHON",
    },
  ] satisfies TicketProduct[],

  boosts: [
    {
      id: "boost_xp",
      section: "BOOSTS",
      title: "2x XP Boost",
      description: "Double XP rewards for 30 minutes.",
      boostType: "xp",
      multiplier: 2,
      durationSeconds: 1800,
      cost: 80,
      costCurrency: "GEMS",
      enabled: true,
    },
    {
      id: "boost_coins",
      section: "BOOSTS",
      title: "2x Coins Boost",
      description: "Double coin rewards for 30 minutes.",
      boostType: "coins",
      multiplier: 2,
      durationSeconds: 1800,
      cost: 80,
      costCurrency: "GEMS",
      enabled: true,
    },
    {
      id: "boost_xp_long",
      section: "BOOSTS",
      title: "2x XP Hour",
      description: "Double XP rewards for 60 minutes.",
      boostType: "xp",
      multiplier: 2,
      durationSeconds: 3600,
      cost: 140,
      costCurrency: "GEMS",
      enabled: true,
      badge: "LONG",
    },
    {
      id: "boost_coins_long",
      section: "BOOSTS",
      title: "2x Coins Hour",
      description: "Double coin rewards for 60 minutes.",
      boostType: "coins",
      multiplier: 2,
      durationSeconds: 3600,
      cost: 140,
      costCurrency: "GEMS",
      enabled: true,
      badge: "LONG",
    },
  ] satisfies BoostProduct[],

  bundles: [
    {
      id: "bundle_starter",
      section: "BUNDLES",
      title: "Starter Session Pack",
      description: "10 tickets plus a 15-minute 2x XP boost. Built as the first smart conversion offer.",
      tickets: 10,
      boostType: "xp",
      multiplier: 2,
      durationSeconds: 900,
      cost: 99,
      costCurrency: "COINS",
      enabled: true,
      badge: "FIRST OFFER",
    },
    {
      id: "bundle_warmup",
      section: "BUNDLES",
      title: "Warmup Bundle",
      description: "20 tickets plus a 30-minute 2x XP boost for a focused session.",
      tickets: 20,
      boostType: "xp",
      multiplier: 2,
      durationSeconds: 1800,
      cost: 220,
      costCurrency: "COINS",
      enabled: true,
      badge: "STARTER",
    },
    {
      id: "bundle_coin_grind",
      section: "BUNDLES",
      title: "Coin Grind Bundle",
      description: "25 tickets plus a 60-minute 2x coins boost for farming rewards.",
      tickets: 25,
      boostType: "coins",
      multiplier: 2,
      durationSeconds: 3600,
      cost: 45,
      costCurrency: "GEMS",
      enabled: true,
      badge: "GRIND",
    },
    {
      id: "bundle_weekend",
      section: "BUNDLES",
      title: "Weekend Trivia Kit",
      description: "60 tickets plus a 60-minute 2x XP boost for longer play sessions.",
      tickets: 60,
      boostType: "xp",
      multiplier: 2,
      durationSeconds: 3600,
      cost: 650,
      costCurrency: "COINS",
      enabled: true,
      badge: "BEST",
    },
  ] satisfies BundleProduct[],


  vip: {
    id: "vip_monthly",
    section: "VIP",
    title: "VIP Monthly",
    description: "A premium membership prepared for RevenueCat live purchase.",
    priceLabel: "$4.99 / month",
    revenueCatId: "vip_monthly",
    durationDays: 30,
    enabled: true,
    perks: [
      "VIP badge",
      "+20% gameplay XP",
      "+10% gameplay coins",
      "Extra daily reward slot prepared",
      "1 streak protection buffer prepared",
      "Stronger comeback bonus prepared",
      "Future VIP-only offers",
    ],
  } satisfies VipProduct,
} as const;

export type StoreProductId =
  | (typeof STORE_CONFIG.gems)[number]["id"]
  | (typeof STORE_CONFIG.tickets)[number]["id"]
  | (typeof STORE_CONFIG.boosts)[number]["id"]
  | (typeof STORE_CONFIG.bundles)[number]["id"]
  | typeof STORE_CONFIG.vip.id;

