export type SmartOfferTab = "offers" | "economy" | "tickets" | "bundles" | "boosts" | "cosmetics" | "vip";

export type SmartOffer = {
  id: string;
  title: string;
  message: string;
  badge: string;
  primaryLabel: string;
  secondaryLabel?: string;
  storeTab: SmartOfferTab;
  productId?: string;
  priority: number;
};

export type StoreOfferInput = {
  coins: number;
  gems: number;
  tickets: number;
  level: number;
  dailyStreak: number;
  isVIPActive: boolean;
};

export type PostGameOfferInput = StoreOfferInput & {
  accuracy: number;
  earnedXP: number;
  earnedCoins: number;
};

const clamp = (value: number) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
const STARTER_BUNDLE_COST = 275;

export function getStoreSmartOffers(input: StoreOfferInput): SmartOffer[] {
  const coins = clamp(input.coins);
  const gems = clamp(input.gems);
  const tickets = clamp(input.tickets);
  const level = clamp(input.level);
  const dailyStreak = clamp(input.dailyStreak);
  const offers: SmartOffer[] = [];

  if (tickets <= 2) {
    offers.push({
      id: "tickets_low",
      title: "Keep Playing Pack",
      message: "Your tickets are low. Refill now so the next session does not stop early.",
      badge: "LOW TICKETS",
      primaryLabel: coins >= STARTER_BUNDLE_COST ? "Get Starter Pack" : "View Ticket Packs",
      storeTab: coins >= STARTER_BUNDLE_COST ? "offers" : "tickets",
      productId: coins >= STARTER_BUNDLE_COST ? "bundle_starter" : undefined,
      priority: 100,
    });
  }

  if (!input.isVIPActive) {
    offers.push({
      id: "vip_tease",
      title: "VIP Would Boost This Account",
      message: "+20% gameplay XP, +10% gameplay coins, +2 daily reward tickets, VIP badge, and future VIP-only offers.",
      badge: "VIP",
      primaryLabel: "Preview VIP",
      storeTab: "vip",
      priority: dailyStreak >= 3 ? 95 : 70,
    });
  }

  if (dailyStreak >= 3) {
    offers.push({
      id: "streak_protect",
      title: "Protect Your Streak Momentum",
      message: `You are on a ${dailyStreak}-day streak. Bundles and VIP perks are built around protecting high-value sessions.`,
      badge: "STREAK",
      primaryLabel: input.isVIPActive ? "View Bundles" : "View VIP Perks",
      storeTab: input.isVIPActive ? "bundles" : "vip",
      priority: 90,
    });
  }

  if (level >= 2 && gems >= 80) {
    offers.push({
      id: "boost_next_run",
      title: "Boost Your Next Run",
      message: "You have enough gems for a timed boost. Use it before a focused trivia session.",
      badge: "BOOST",
      primaryLabel: "View Boosts",
      storeTab: "boosts",
      priority: 60,
    });
  }

  offers.push({
    id: "starter_pack",
    title: "Starter Session Pack",
    message: "10 tickets plus a short 2x XP boost. Designed as the first smart offer for new and returning players.",
    badge: "STARTER",
    primaryLabel: coins >= STARTER_BUNDLE_COST ? `Buy for ${STARTER_BUNDLE_COST} Coins` : "Earn More Coins",
    storeTab: coins >= STARTER_BUNDLE_COST ? "offers" : "economy",
    productId: coins >= STARTER_BUNDLE_COST ? "bundle_starter" : undefined,
    priority: 50,
  });

  return offers.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

export function getPostGameSmartOffer(input: PostGameOfferInput): SmartOffer | null {
  const accuracy = clamp(input.accuracy);
  const tickets = clamp(input.tickets);
  const earnedXP = clamp(input.earnedXP);
  const earnedCoins = clamp(input.earnedCoins);

  if (!input.isVIPActive && (accuracy >= 80 || earnedXP >= 40)) {
    return {
      id: "postgame_vip_xp",
      title: "VIP Would Have Boosted This Run",
      message: `This run earned ${earnedXP} XP and ${earnedCoins} coins. VIP is prepared to add +20% XP and +10% coins once RevenueCat is connected.`,
      badge: "VIP TEASE",
      primaryLabel: "Preview VIP",
      secondaryLabel: "Not Now",
      storeTab: "vip",
      priority: 100,
    };
  }

  if (tickets <= 2) {
    return {
      id: "postgame_tickets",
      title: "Do Not End the Session Yet",
      message: "Your tickets are almost empty. Refill before the next round.",
      badge: "PLAY MORE",
      primaryLabel: "View Tickets",
      secondaryLabel: "Later",
      storeTab: "tickets",
      priority: 90,
    };
  }

  if (accuracy < 60) {
    return {
      id: "postgame_boost",
      title: "Try a Boosted Comeback",
      message: "Tough round. A timed XP boost can make the next session feel more rewarding while you recover momentum.",
      badge: "COMEBACK",
      primaryLabel: "View Boosts",
      secondaryLabel: "Later",
      storeTab: "boosts",
      priority: 70,
    };
  }

  return null;
}



