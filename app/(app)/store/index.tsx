// app/(app)/store/index.tsx
// Phase 5.4 — Unified Store / Bazaar + Economy Engine preview.
// UI displays economy state only; purchases still route through purchaseStore.
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { STORE_CONFIG } from "@/config/storeConfig";
import { CosmeticCategory } from "@/cosmetics/types";
import { COSMETIC_CATEGORY_LABELS, COSMETIC_STORE_TABS, getCosmeticsByCategory } from "@/cosmetics/cosmeticSelectors";
import { getDailyStreakMultiplier } from "@/economy/economyRules";
import { formatVipTimeLeft, getVipPerks } from "@/economy/vipPerks";
import { getStoreSmartOffers } from "@/offers/smartOffers";
import { getEconomyStatus, getLevelReward } from "@/economy/progressionRewards";
import { useEntitlementStore } from "@/store/entitlementStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { usePurchaseStore } from "@/store/purchaseStore";
import { trackEvent, trackScreenView } from "@/observability";
import { getStoreHeroAsset } from "@/cosmetics/cosmeticAssets";
import { StoreCosmeticCard as CosmeticCard, StoreHeroPanel, StoreMessageBanner, StoreProductCard as ProductCard, StoreTabBar } from "@/screens/store/store.components";

type StoreTab = "offers" | "economy" | "gems" | "tickets" | "bundles" | "boosts" | "cosmetics" | "vip";

const STORE_TABS: { id: StoreTab; label: string }[] = [
  { id: "offers", label: "Offers" },
  { id: "economy", label: "Economy" },
  { id: "gems", label: "Gems" },
  { id: "tickets", label: "Tickets" },
  { id: "bundles", label: "Bundles" },
  { id: "boosts", label: "Boosts" },
  { id: "cosmetics", label: "Cosmetics" },
  { id: "vip", label: "VIP" },
];

const COSMETIC_TABS: CosmeticCategory[] = COSMETIC_STORE_TABS;


const STORE_HERO_BY_TAB: Record<StoreTab, {
  asset: string;
  eyebrow: string;
  title: string;
  body: string;
  accent?: string;
}> = {
  offers: {
    asset: "store_bazaar_hero",
    eyebrow: "SMART OFFERS",
    title: "Bazaar of Momentum",
    body: "Personalized boosts, VIP routes, and session-ready rewards tuned for your next run.",
    accent: "#FFD34D",
  },
  economy: {
    asset: "economy_engine_hero",
    eyebrow: "ECONOMY ENGINE",
    title: "Progression Core",
    body: "Track XP, streak multipliers, level rewards, and the long-term reward runway.",
    accent: "#9FE7FF",
  },
  gems: {
    asset: "gems_vault_hero",
    eyebrow: "PREMIUM CURRENCY",
    title: "Gem Vault",
    body: "Premium currency for boosts, cosmetics, bundles, and future elite content.",
    accent: "#74D9FF",
  },
  tickets: {
    asset: "session_bundles_hero",
    eyebrow: "PLAY MORE",
    title: "Ticket Reserve",
    body: "Refill your session runway and keep momentum alive across premium modes.",
    accent: "#FFD34D",
  },
  bundles: {
    asset: "session_bundles_hero",
    eyebrow: "SESSION LOADOUTS",
    title: "Bundle Prep",
    body: "Tickets and timed boosts packaged for focused competitive runs.",
    accent: "#FFD34D",
  },
  boosts: {
    asset: "boost_lab_hero",
    eyebrow: "POWER WINDOW",
    title: "Boost Lab",
    body: "Activate XP and coin multipliers before your next serious trivia session.",
    accent: "#9FE7FF",
  },
  cosmetics: {
    asset: "cosmetics_collection_hero",
    eyebrow: "COLLECTION VAULT",
    title: "Cosmetic Identity",
    body: "Avatars, frames, badges, banners, trails, and aura rewards for your profile legacy.",
    accent: "#C58CFF",
  },
  vip: {
    asset: "vip_prestige_hero",
    eyebrow: "VIP PRESTIGE",
    title: "Elite Access",
    body: "Preview the premium layer built for progression, identity, and exclusive rewards.",
    accent: "#FFD34D",
  },
};

const COSMETIC_HERO_BY_CATEGORY: Partial<Record<CosmeticCategory, {
  asset: string;
  eyebrow: string;
  title: string;
  body: string;
  accent?: string;
}>> = {
  [CosmeticCategory.AVATAR]: {
    asset: "cosmetics_avatar_hero",
    eyebrow: "AVATAR IDENTITY",
    title: "Choose Your Face",
    body: "Premium portraits that define how your arena identity appears across the ecosystem.",
    accent: "#9FE7FF",
  },
  [CosmeticCategory.AVATAR_FRAME]: {
    asset: "cosmetics_frames_hero",
    eyebrow: "PRESTIGE FRAMES",
    title: "Frame Your Legacy",
    body: "Elite borders and prestige rings for your profile presence.",
    accent: "#FFD34D",
  },
  [CosmeticCategory.PROFILE_BACKGROUND]: {
    asset: "cosmetics_backgrounds_hero",
    eyebrow: "PROFILE SCENES",
    title: "Set the Stage",
    body: "Cinematic backgrounds for your public identity and progression story.",
    accent: "#74D9FF",
  },
  [CosmeticCategory.BADGE]: {
    asset: "cosmetics_badges_hero",
    eyebrow: "STATUS BADGES",
    title: "Show the Proof",
    body: "Collectible prestige markers for mastery, loyalty, and elite accomplishments.",
    accent: "#FFD34D",
  },
  [CosmeticCategory.STREAK_AURA]: {
    asset: "cosmetics_streaks_hero",
    eyebrow: "STREAK AURAS",
    title: "Momentum Effects",
    body: "Visual energy for hot streaks, daily commitment, and competitive identity.",
    accent: "#FF8A5B",
  },
  [CosmeticCategory.ARENA_BANNER]: {
    asset: "cosmetics_banners_hero",
    eyebrow: "ARENA BANNERS",
    title: "Enter Like a Champion",
    body: "Tournament-ready banners for arena presentation and prestige moments.",
    accent: "#FFD34D",
  },
  [CosmeticCategory.ANSWER_TRAIL]: {
    asset: "cosmetics_trails_hero",
    eyebrow: "ANSWER TRAILS",
    title: "Leave a Signature",
    body: "Fast, premium trail effects for confident answers and high-energy play.",
    accent: "#9FE7FF",
  },
};



const COSMETIC_SPOTLIGHTS = [
  {
    asset: "featured_cosmetics_hero",
    eyebrow: "FEATURED",
    title: "Collector Spotlight",
    body: "Rotating prestige cosmetics and high-desire identity rewards.",
    accent: "#FFD34D",
  },
  {
    asset: "seasonal_cosmetics_hero",
    eyebrow: "SEASONAL",
    title: "Limited-Time Identity",
    body: "Event-ready cosmetics built for future seasons and reward moments.",
    accent: "#9FE7FF",
  },
  {
    asset: "tournament_cosmetics_hero",
    eyebrow: "TOURNAMENT",
    title: "Champion Rewards",
    body: "Prestige visuals for competitive status and arena glory.",
    accent: "#C58CFF",
  },
];

const formatTimeLeft = formatVipTimeLeft;


function BalanceChip({
  icon,
  value,
  label,
  tone = "blue",
}: {
  icon: string;
  value: string | number;
  label: string;
  tone?: "blue" | "gold" | "red" | "vip";
}) {
  return (
    <View style={[styles.balanceChip, styles[`balanceChip_${tone}`]]}>
      <View style={styles.balanceIconOrb}>
        <Text allowFontScaling maxFontSizeMultiplier={1.1} style={styles.balanceIcon}>{icon}</Text>
      </View>
      <View style={styles.balanceCopy}>
        <Text allowFontScaling maxFontSizeMultiplier={1.12} numberOfLines={1} style={styles.balanceValue}>{value}</Text>
        <Text allowFontScaling maxFontSizeMultiplier={1.08} numberOfLines={1} style={styles.balanceLabel}>{label}</Text>
      </View>
    </View>
  );
}

export default function StoreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();

  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);
  const tickets = usePlayerStore((s) => s.tickets);
  const xp = usePlayerStore((s) => s.xp);
  const level = usePlayerStore((s) => s.level);
  const daily = usePlayerStore((s) => s.daily);
  const lastLevelRewardSummary = usePlayerStore((s) => s.lastLevelRewardSummary);
  const cosmetics = usePlayerStore((s) => s.cosmetics);
  const equipCosmetic = usePlayerStore((s) => s.equipCosmetic);

  const boosts = useEntitlementStore((s) => s.boosts);
  const vipExpiresAt = useEntitlementStore((s) => s.vipExpiresAt);
  const vipTier = useEntitlementStore((s) => s.vipTier);

  const buy = usePurchaseStore((s) => s.buy);
  const buyCosmetic = usePurchaseStore((s) => s.buyCosmetic);
  const restorePurchases = usePurchaseStore((s) => s.restorePurchases);
  const isPurchasing = usePurchaseStore((s) => s.isPurchasing);

  const [activeTab, setActiveTab] = useState<StoreTab>(() =>
    STORE_TABS.some((tab) => tab.id === params.tab)
      ? (params.tab as StoreTab)
      : "offers"
  );
  const [cosmeticTab, setCosmeticTab] = useState<CosmeticCategory>(CosmeticCategory.AVATAR);
  const [message, setMessage] = useState<string | null>(null);

  const isVIPActive = Date.now() < (vipExpiresAt || 0);
  const vipStatusLabel = isVIPActive ? "VIP ACTIVE" : "VIP NOT ACTIVE";
  const vipStatusDetail = isVIPActive ? `${formatTimeLeft(vipExpiresAt)} left` : "Subscribe or restore purchases to activate";
  const vipPerks = getVipPerks(isVIPActive, vipTier);
  const economy = getEconomyStatus(level, xp);
  const dailyMultiplier = getDailyStreakMultiplier(daily?.streak || 0);
  const milestoneReward = getLevelReward(Math.max(5, Math.ceil((level + 1) / 5) * 5));
  const smartOffers = useMemo(
    () => getStoreSmartOffers({ coins, gems, tickets, level, dailyStreak: daily?.streak || 0, isVIPActive }),
    [coins, gems, tickets, level, daily?.streak, isVIPActive]
  );

  useEffect(() => {
    void trackScreenView("store", {
      activeTab,
      level,
      isVIPActive,
    });
    void trackEvent("store_opened", {
      activeTab,
      level,
      isVIPActive,
    });
  }, [activeTab, isVIPActive, level]);

  const filteredCosmetics = useMemo(
    () => getCosmeticsByCategory(cosmeticTab),
    [cosmeticTab]
  );

  const activeHero = activeTab === "cosmetics"
    ? (COSMETIC_HERO_BY_CATEGORY[cosmeticTab] ?? STORE_HERO_BY_TAB.cosmetics)
    : STORE_HERO_BY_TAB[activeTab];

  const activeHeroArt = getStoreHeroAsset(activeHero.asset);

  const runPurchase = async (productId: string) => {
    void trackEvent("purchase_started", { productId });

    const result = await buy(productId);
    setMessage(result.message);

    void trackEvent(result.success ? "purchase_completed" : "purchase_failed", {
      productId,
      message: result.message,
    });
  };

  const runCosmeticPurchase = (id: string) => {
    void trackEvent("cosmetic_purchase_started", { cosmeticId: id });

    const result = buyCosmetic(id);
    setMessage(result.message);

    void trackEvent("cosmetic_purchase_completed", {
      cosmeticId: id,
      success: result.success,
      message: result.message,
    });
  };

  return (
    <View testID="screen-store" style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity testID="store-back-button" accessibilityLabel="Back" onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Store / Bazaar</Text>
        <Text style={styles.subtitle}>Premium economy, VIP progression, boosts, bundles, and collectible identity.</Text>

        <View style={styles.balanceRow}>
          <BalanceChip icon="🪙" value={coins} label="Coins" tone="gold" />
          <BalanceChip icon="💎" value={gems} label="Gems" tone="blue" />
          <BalanceChip icon="🎟" value={tickets} label="Tickets" tone="red" />
          <BalanceChip icon="LV" value={level} label="Level" tone="blue" />
          <BalanceChip icon="VIP" value={isVIPActive ? "ON" : "OFF"} label={isVIPActive ? "Active" : "Locked"} tone="vip" />
        </View>
      </View>

      <StoreTabBar
        tabs={STORE_TABS}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          void trackEvent("store_tab_selected", { tab });
        }}
      />

      <StoreMessageBanner message={message} onDismiss={() => setMessage(null)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StoreHeroPanel
          art={activeHeroArt}
          eyebrow={activeHero.eyebrow}
          title={activeHero.title}
          body={activeHero.body}
          accent={activeHero.accent}
        />
        {activeTab === "offers" ? (
          <>
            <Text style={styles.sectionTitle}>Smart Offers</Text>
            <View style={styles.conversionBox}>
              <Text style={styles.conversionTitle}>Personalized for this player</Text>
              <Text style={styles.conversionText}>Offers change based on tickets, streaks, VIP state, and progression. Real-money products now route through RevenueCat.</Text>
            </View>

            {smartOffers.map((offer) => {
              const starterDisabled = offer.productId === "bundle_starter" && coins < 99;
              return (
                <ProductCard
                  artKey={activeHero.asset}
                  accent={activeHero.accent}
                  key={offer.id}
                  title={offer.title}
                  subtitle={offer.message}
                  meta={offer.productId === "bundle_starter" ? "Cost: 99 COINS" : offer.storeTab === "vip" ? vipStatusLabel : undefined}
                  buttonLabel={offer.primaryLabel}
                  disabled={starterDisabled}
                  onPress={() => {
                    if (offer.productId) runPurchase(offer.productId);
                    else setActiveTab(offer.storeTab);
                  }}
                  badge={offer.badge}
                />
              );
            })}

            <ProductCard
                  artKey={activeHero.asset}
                  accent={activeHero.accent}
              title="VIP Monthly"
              subtitle={STORE_CONFIG.vip.perks.join(" • ")}
              meta={isVIPActive ? `Active: ${formatTimeLeft(vipExpiresAt)} left` : STORE_CONFIG.vip.priceLabel}
              buttonLabel={isVIPActive ? "VIP Active" : isPurchasing ? "Processing..." : "Subscribe"}
              disabled={isVIPActive || isPurchasing}
              onPress={() => runPurchase(STORE_CONFIG.vip.id)}
              badge={isVIPActive ? "ACTIVE" : "LIVE READY"}
            />
          </>
        ) : null}

        {activeTab === "economy" ? (
          <>
            <Text style={styles.sectionTitle}>Economy Engine</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Level Progress</Text>
              <Text style={styles.infoText}>Level {economy.level} • {economy.currentXp}/{economy.requiredXp} XP</Text>
              <View style={styles.progressOuter}>
                <View style={[styles.progressInner, { width: `${Math.round(economy.percent * 100)}%` }]} />
              </View>
              <Text style={styles.infoText}>Next level reward: 🪙 {economy.nextReward.coins}  💎 {economy.nextReward.gems}  🎟 {economy.nextReward.tickets}</Text>
            </View>

            {lastLevelRewardSummary ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Latest Level-Up Bonus</Text>
                <Text style={styles.successText}>🪙 {lastLevelRewardSummary.coins} • 💎 {lastLevelRewardSummary.gems} • 🎟 {lastLevelRewardSummary.tickets}</Text>
              </View>
            ) : null}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Daily Streak Multiplier</Text>
              <Text style={styles.infoText}>Current streak: {daily?.streak || 0} days</Text>
              <Text style={styles.infoText}>Reward multiplier: {dailyMultiplier.toFixed(2)}x</Text>
              <Text style={styles.infoText}>Milestones: 3 days = 1.10x, 7 days = 1.20x, 14 days = 1.35x, 30 days = 1.50x.</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>VIP Economy Layer</Text>
              <Text style={styles.infoText}>{isVIPActive ? `Active ${vipPerks.label}: ${formatTimeLeft(vipExpiresAt)} left` : "Locked until RevenueCat activation."}</Text>
              <Text style={styles.infoText}>XP: {vipPerks.xpMultiplier.toFixed(2)}x • Coins: {vipPerks.coinMultiplier.toFixed(2)}x</Text>
              <Text style={styles.infoText}>Daily bonus slot: {vipPerks.dailyBonusSlot ? "Prepared" : "Locked"} • Streak protection: {vipPerks.streakProtectionCharges}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Next Major Milestone</Text>
              <Text style={styles.infoText}>{milestoneReward.label}: 🪙 {milestoneReward.coins}, 💎 {milestoneReward.gems}, 🎟 {milestoneReward.tickets}</Text>
              {milestoneReward.unlocks.length ? milestoneReward.unlocks.map((unlock) => (
                <Text key={unlock} style={styles.infoText}>✓ {unlock}</Text>
              )) : <Text style={styles.infoText}>More unlocks are ready for future content phases.</Text>}
            </View>
          </>
        ) : null}

        {activeTab === "gems" ? (
          <>
            <Text style={styles.sectionTitle}>Gems</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Premium Currency</Text>
              <Text style={styles.infoText}>Gem purchases are handled by RevenueCat. Gems unlock boosters, cosmetic items, and selected bundles.</Text>
            </View>
            {STORE_CONFIG.gems.map((item) => {
              const amount = item.amount + item.bonusAmount;
              return (
                <ProductCard
                  artKey={activeHero.asset}
                  accent={activeHero.accent}
                  key={item.id}
                  title={item.title}
                  subtitle={item.description}
                  meta={`${amount} gems${item.bonusAmount ? ` (${item.bonusAmount} bonus)` : ""} • ${item.priceLabel}`}
                  buttonLabel={isPurchasing ? "Processing..." : "Buy Gems"}
                  disabled={isPurchasing}
                  onPress={() => runPurchase(item.id)}
                  badge={item.bonusAmount ? "BONUS" : undefined}
                />
              );
            })}
            <ProductCard
                  artKey={activeHero.asset}
                  accent={activeHero.accent}
              title="Starter Pack"
              subtitle="Best first purchase: gems, tickets, and a timed XP boost."
              meta="$2.99 • 250 gems • 15 tickets • 30m 2x XP"
              buttonLabel={isPurchasing ? "Processing..." : "Buy Starter Pack"}
              disabled={isPurchasing}
              onPress={() => runPurchase("starter_bundle")}
              badge="FIRST OFFER"
            />
          </>
        ) : null}

        {activeTab === "tickets" ? (
          <>
            <Text style={styles.sectionTitle}>Play More</Text>
            {STORE_CONFIG.tickets.map((item) => (
              <ProductCard
                  artKey={activeHero.asset}
                  accent={activeHero.accent}
                key={item.id}
                title={item.title}
                subtitle={item.description}
                meta={`Cost: ${item.cost} ${item.costCurrency}`}
                buttonLabel={coins >= item.cost ? "Buy Tickets" : "Not enough coins"}
                disabled={coins < item.cost}
                onPress={() => runPurchase(item.id)}
              />
            ))}
          </>
        ) : null}

        {activeTab === "bundles" ? (
          <>
            <Text style={styles.sectionTitle}>Session Bundles</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Built for play sessions</Text>
              <Text style={styles.infoText}>Bundles combine tickets with timed boosts. They use only coins or gems and do not touch real-money purchase logic.</Text>
            </View>
            {STORE_CONFIG.bundles.map((item) => {
              const canAfford = item.costCurrency === "COINS" ? coins >= item.cost : gems >= item.cost;
              const boostLabel = item.boostType
                ? ` • ${item.multiplier}x ${item.boostType.toUpperCase()} for ${Math.round((item.durationSeconds || 0) / 60)}m`
                : "";
              return (
                <ProductCard
                  artKey={activeHero.asset}
                  accent={activeHero.accent}
                  key={item.id}
                  title={item.title}
                  subtitle={item.description}
                  meta={`${item.tickets} tickets${boostLabel} • Cost: ${item.cost} ${item.costCurrency}`}
                  buttonLabel={canAfford ? "Buy Bundle" : `Not enough ${item.costCurrency.toLowerCase()}`}
                  disabled={!canAfford}
                  onPress={() => runPurchase(item.id)}
                  badge={item.badge}
                />
              );
            })}
          </>
        ) : null}

        {activeTab === "boosts" ? (
          <>
            <Text style={styles.sectionTitle}>Boosts</Text>
            {STORE_CONFIG.boosts.map((item) => (
              <ProductCard
                  artKey={activeHero.asset}
                  accent={activeHero.accent}
                key={item.id}
                title={item.title}
                subtitle={item.description}
                meta={`Cost: ${item.cost} ${item.costCurrency} • Active: ${formatTimeLeft(boosts[item.boostType]?.expiresAt || 0)}`}
                buttonLabel={gems >= item.cost ? "Activate Boost" : "Not enough gems"}
                disabled={gems < item.cost}
                onPress={() => runPurchase(item.id)}
              />
            ))}
          </>
        ) : null}

        {activeTab === "cosmetics" ? (
          <>
            <Text style={styles.sectionTitle}>Cosmetics</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cosmeticTabs}>
              {COSMETIC_TABS.map((tab) => {
                const active = cosmeticTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.smallTab, active && styles.tabActive]}
                    onPress={() => setCosmeticTab(tab)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{COSMETIC_CATEGORY_LABELS[tab]}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spotlightRail}>
              {COSMETIC_SPOTLIGHTS.map((spotlight) => (
                <View key={spotlight.asset} style={styles.spotlightCard}>
                  <StoreHeroPanel
                    art={getStoreHeroAsset(spotlight.asset)}
                    eyebrow={spotlight.eyebrow}
                    title={spotlight.title}
                    body={spotlight.body}
                    accent={spotlight.accent}
                  />
                </View>
              ))}
            </ScrollView>

            {filteredCosmetics.map((item) => (
              <CosmeticCard
                key={item.id}
                item={item}
                ownedCosmetics={cosmetics.owned}
                equippedCosmetics={cosmetics.equipped}
                coins={coins}
                gems={gems}
                onEquip={equipCosmetic}
                onPurchase={runCosmeticPurchase}
                onMessage={setMessage}
              />
            ))}
          </>
        ) : null}

        {activeTab === "vip" ? (
          <>
            <Text style={styles.sectionTitle}>VIP</Text>
            <View style={[styles.vipStatusBox, isVIPActive ? styles.vipStatusActiveBox : styles.vipStatusLockedBox]}>
              <Text style={[styles.vipStatusTitle, isVIPActive ? styles.vipStatusActiveText : styles.vipStatusLockedText]}>
                Status: {vipStatusLabel}
              </Text>
              <Text style={styles.vipStatusSub}>{vipStatusDetail}</Text>
            </View>
            <ProductCard
                  artKey={activeHero.asset}
                  accent={activeHero.accent}
              title={STORE_CONFIG.vip.title}
              subtitle={isVIPActive ? "VIP perks are active through entitlements." : "Subscribe through RevenueCat to activate VIP perks."}
              meta={isVIPActive ? `Active: ${formatTimeLeft(vipExpiresAt)} left` : STORE_CONFIG.vip.priceLabel}
              buttonLabel={isVIPActive ? "VIP Active" : isPurchasing ? "Processing..." : "Subscribe"}
              disabled={isVIPActive || isPurchasing}
              onPress={() => runPurchase(STORE_CONFIG.vip.id)}
              badge={isVIPActive ? "ACTIVE" : "LIVE READY"}
            />
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>{isVIPActive ? "Active VIP Perks" : "VIP Preview"}</Text>
              <Text style={styles.infoText}>{isVIPActive ? "Your VIP bonuses are currently applied by the entitlement engine." : "You are currently on the free plan. VIP bonuses are preview-only until activation."}</Text>
              {vipPerks.perks.map((perk) => (
                <Text key={perk} style={styles.infoText}>✓ {perk}</Text>
              ))}
              {!isVIPActive ? STORE_CONFIG.vip.perks.map((perk) => (
                <Text key={perk} style={styles.infoText}>◇ {perk}</Text>
              )) : null}
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.restoreButton} onPress={async () => setMessage((await restorePurchases()).message)}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {activeTab === "offers" || activeTab === "vip" ? (
          <View style={styles.truthBox}>
            <Text style={styles.truthTitle}>Purchase Truth</Text>
            <Text style={styles.truthText}>
              Real-money gems, the Starter Pack, and VIP route through RevenueCat. Coins, tickets, boosts, cosmetics, and progression rewards still use the safe in-game economy engine.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#030615" },
  header: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: "rgba(110,170,255,0.14)", backgroundColor: "rgba(3,6,21,0.96)" },
  back: { color: "#F9B233", fontSize: 13, fontWeight: "800", marginBottom: 7 },
  title: { color: "#FFD34D", fontSize: 27, fontWeight: "900", letterSpacing: -0.45 },
  subtitle: { color: "#B9C7DD", marginTop: 5, fontSize: 11.5, lineHeight: 16, fontWeight: "700" },
  balanceRow: {
    flexDirection: "row",
    gap: 7,
    marginTop: 11,
  },
  balanceChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 7,
    paddingVertical: 7,
    backgroundColor: "rgba(18,28,46,0.96)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.14)",
    overflow: "hidden",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceChip_gold: {
    borderColor: "rgba(255,211,77,0.30)",
    backgroundColor: "rgba(29,26,17,0.96)",
  },
  balanceChip_blue: {
    borderColor: "rgba(116,217,255,0.24)",
  },
  balanceChip_red: {
    borderColor: "rgba(255,118,118,0.20)",
  },
  balanceChip_vip: {
    borderColor: "rgba(255,211,77,0.26)",
    backgroundColor: "rgba(24,25,31,0.96)",
  },
  balanceIconOrb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  balanceIcon: {
    color: "#FFD34D",
    fontSize: 9,
    fontWeight: "900",
  },
  balanceCopy: {
    flex: 1,
    minWidth: 0,
  },
  balanceValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 16,
  },
  balanceLabel: {
    color: "#8FA3C9",
    fontSize: 7.5,
    fontWeight: "900",
    marginTop: 1,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  tabsShell: { borderBottomWidth: 1, borderColor: "#1E2233" },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 10 },
  tab: { paddingHorizontal: 14, height: 30, borderRadius: 15, backgroundColor: "#1A1D28", alignItems: "center", justifyContent: "center", marginRight: 8 },
  smallTab: { paddingHorizontal: 12, height: 29, borderRadius: 15, backgroundColor: "rgba(28,32,48,0.92)", alignItems: "center", justifyContent: "center", marginRight: 8, borderWidth: 1, borderColor: "rgba(159,231,255,0.08)" },
  tabActive: { backgroundColor: "#FFD34D", borderColor: "rgba(255,211,77,0.70)" },
  tabText: { color: "#AAB0C0", fontSize: 11, fontWeight: "900" },
  tabTextActive: { color: "#090909" },
  messageBox: { margin: 12, marginBottom: 0, padding: 12, backgroundColor: "#16251A", borderWidth: 1, borderColor: "#2F8F46", borderRadius: 14 },
  messageText: { color: "#D8FFE1", fontSize: 12, fontWeight: "800" },
  infoBox: { backgroundColor: "rgba(18,20,31,0.94)", borderRadius: 20, padding: 15, marginBottom: 14, borderWidth: 1, borderColor: "rgba(110,170,255,0.20)" },
  conversionBox: { backgroundColor: "rgba(38,29,12,0.92)", borderRadius: 20, padding: 15, marginBottom: 14, borderWidth: 1, borderColor: "rgba(255,211,77,0.72)" },
  conversionTitle: { color: "#FFD34D", fontSize: 13, fontWeight: "900", marginBottom: 6 },
  conversionText: { color: "#F1DFAD", fontSize: 12, lineHeight: 18 },
  vipStatusBox: { borderRadius: 20, padding: 15, marginBottom: 14, borderWidth: 1 },
  vipStatusActiveBox: { backgroundColor: "#1E2415", borderColor: "#FFD34D" },
  vipStatusLockedBox: { backgroundColor: "#11131E", borderColor: "#2A3042" },
  vipStatusTitle: { fontSize: 14, fontWeight: "900", marginBottom: 4 },
  vipStatusActiveText: { color: "#FFD34D" },
  vipStatusLockedText: { color: "#C6CAD7" },
  vipStatusSub: { color: "#AAB0C0", fontSize: 12, lineHeight: 18 },
  infoTitle: { color: "#FFD34D", fontSize: 13, fontWeight: "900", marginBottom: 6 },
  infoText: { color: "#B8BECC", fontSize: 12, lineHeight: 18 },
  successBox: { backgroundColor: "#16251A", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#2F8F46" },
  successTitle: { color: "#D8FFE1", fontSize: 13, fontWeight: "900", marginBottom: 6 },
  successText: { color: "#D8FFE1", fontSize: 12, fontWeight: "800" },
  progressOuter: { height: 10, backgroundColor: "#252A3A", borderRadius: 999, overflow: "hidden", marginVertical: 10 },
  progressInner: { height: 10, backgroundColor: "#FFD34D", borderRadius: 999 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 52 },
  sectionTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900", marginBottom: 10, letterSpacing: -0.2 },
  card: {
    backgroundColor: "#171B2A",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2A3042",
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  cardTitle: { color: "#FFD34D", fontSize: 16, fontWeight: "900", flex: 1 },
  cardSubtitle: { color: "#C6CAD7", fontSize: 12, lineHeight: 18, marginTop: 7 },
  cardMeta: { color: "#FFFFFF", fontSize: 12, fontWeight: "800", marginTop: 10 },
  badge: { color: "#080811", backgroundColor: "#FFD34D", overflow: "hidden", borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: "900" },
  buyButton: { marginTop: 14, height: 42, borderRadius: 14, backgroundColor: "#FFD34D", alignItems: "center", justifyContent: "center" },
  disabledButton: { backgroundColor: "#2B2E39" },
  buyText: { color: "#090909", fontSize: 13, fontWeight: "900" },
  disabledText: { color: "#808696" },
  cosmeticTabs: { paddingBottom: 10, paddingTop: 2 },
  spotlightRail: { paddingBottom: 12, gap: 10 },
  spotlightCard: { width: 260, marginRight: 10 },
  restoreButton: { marginTop: 4, height: 42, borderRadius: 14, borderWidth: 1, borderColor: "#FFD34D", alignItems: "center", justifyContent: "center" },
  restoreText: { color: "#FFD34D", fontWeight: "900" },
  truthBox: { backgroundColor: "rgba(18,20,31,0.94)", borderRadius: 20, padding: 15, marginTop: 8, borderWidth: 1, borderColor: "rgba(255,211,77,0.24)" },
  truthTitle: { color: "#FFD34D", fontWeight: "900", marginBottom: 6 },
  truthText: { color: "#B8BECC", fontSize: 12, lineHeight: 18 },
});




