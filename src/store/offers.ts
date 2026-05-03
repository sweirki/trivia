// app/arena/shop/offers.ts
// ★ Arena Shop – Offer Definitions ★

export const ARENA_OFFERS = [
  {
    id: "coins_small",
    name: "Small Coin Pack",
    desc: "+500 Coins",
    price: 500,
    icon: require("@assets/images/shop_coins.png"),
    give: { coins: 500 },
  },
  {
    id: "coins_large",
    name: "Large Coin Pack",
    desc: "+2000 Coins",
    price: 1500,
    icon: require("@assets/images/shop_coins.png"),
    give: { coins: 2000 },
  },
  {
    id: "tickets_3",
    name: "3 Arena Tickets",
    desc: "Enter premium arenas",
    price: 900,
    icon: require("@assets/images/shop_ticket.png"),
    give: { tickets: 3 },
  },
  {
    id: "boost_xp",
    name: "XP Boost x2",
    desc: "Double XP for 1 hour",
    price: 1200,
    icon: require("@assets/images/shop_xp.png"),
    give: { xpBoost: 1 },
  },
  {
    id: "powerup_bundle",
    name: "Power-Up Bundle",
    desc: "50/50 + Freeze + Reveal",
    price: 1600,
    icon: require("@assets/images/shop_bundle.png"),
    give: { fifty: 1, freeze: 1, reveal: 1 },
  },
];



