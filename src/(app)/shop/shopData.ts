// shopData.ts — A+++++ Central Pricing + Metadata

export const COIN_PACKS = [
  { id: "coins_small",    amount: 500,   price: "$0.99" },
  { id: "coins_medium",   amount: 1200,  price: "$2.49" },
  { id: "coins_large",    amount: 2500,  price: "$4.99" },
  { id: "coins_ultra",    amount: 6000,  price: "$9.99" },
];

export const GEM_PACKS = [
  { id: "gems_small",    amount: 10,   price: "$1.99" },
  { id: "gems_medium",   amount: 25,   price: "$4.49" },
  { id: "gems_large",    amount: 60,   price: "$9.99" },
  { id: "gems_ultra",    amount: 150,  price: "$19.99" },
];

export const VIP_SUBSCRIPTIONS = [
  {
    id: "vip_1",
    tier: 1,
    benefits: ["+10% XP", "Remove Ads"],
    price: "$1.99 / month",
  },
  {
    id: "vip_2",
    tier: 2,
    benefits: ["+20% XP", "+5 Coins per game", "Remove Ads"],
    price: "$3.99 / month",
  },
  {
    id: "vip_3",
    tier: 3,
    benefits: ["+30% XP", "+10 Coins per game", "Free Boosters", "Remove Ads"],
    price: "$6.99 / month",
  },
  {
    id: "vip_4",
    tier: 4,
    benefits: [
      "+50% XP",
      "+20 Coins per game",
      "+1 Gem per day",
      "All Categories Unlocked",
      "Remove Ads",
    ],
    price: "$9.99 / month",
  },
];

export const BOOSTER_PACKS = [
  { id: "xp_boost",    label: "XP Boost",    desc: "+50% XP for 1 hour",   price: "$0.99" },
  { id: "coin_boost",  label: "Coin Boost",  desc: "+50% Coins for 1 hour", price: "$0.99" },
  { id: "retry_token", label: "Retry Token", desc: "Retry one wrong answer", price: "$0.49" },
];

export const CATEGORY_PACKS = [
  {
    id: "geography_premium",
    category: "geography",
    label: "Geography Premium Pack",
    price: "$1.49",
  },
  {
    id: "science_premium",
    category: "science",
    label: "Science Premium Pack",
    price: "$1.49",
  },
  {
    id: "movies_premium",
    category: "movies",
    label: "Movies Premium Pack",
    price: "$1.49",
  },
];






