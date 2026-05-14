// app/(app)/store/index.tsx
// Phase 5.4 — Unified Store / Bazaar + Economy Engine preview.
// UI displays economy state only; purchases still route through purchaseStore.
import ScreenShell from "@/components/ScreenShell";
import GoldCard from "@/components/GoldCard";

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
import { StoreCosmeticCard as CosmeticCard, StoreMessageBanner, StoreProductCard as ProductCard, StoreTabBar } from "./store.components";

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

const formatTimeLeft = formatVipTimeLeft;

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
        <Text style={styles.subtitle}>Economy-ready store hub. Real-money purchases are RevenueCat-ready, not locally faked.</Text>

        <View style={styles.balanceRow}>
          <Text style={styles.balance}>🪙 {coins}</Text>
          <Text style={styles.balance}>💎 {gems}</Text>
          <Text style={styles.balance}>🎟 {tickets}</Text>
          <Text style={styles.balance}>LV {level}</Text>
          <Text style={[styles.vipHeaderBadge, isVIPActive ? styles.vipHeaderBadgeActive : styles.vipHeaderBadgeLocked]}>
            {isVIPActive ? "VIP ✓" : "VIP OFF"}
          </Text>
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
  root: { flex: 1, backgroundColor: "#080811" },
  header: { paddingTop: 18, paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: 1, borderColor: "#1E2233" },
  back: { color: "#F9B233", fontSize: 14, fontWeight: "800", marginBottom: 8 },
  title: { color: "#FFD34D", fontSize: 28, fontWeight: "900" },
  subtitle: { color: "#AAB0C0", marginTop: 6, fontSize: 12, lineHeight: 17 },
  balanceRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  balance: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", backgroundColor: "#171B2A", paddingVertical: 7, paddingHorizontal: 10, borderRadius: 12 },
  vipHeaderBadge: { fontSize: 12, fontWeight: "900", paddingVertical: 7, paddingHorizontal: 10, borderRadius: 12, overflow: "hidden" },
  vipHeaderBadgeActive: { color: "#090909", backgroundColor: "#FFD34D" },
  vipHeaderBadgeLocked: { color: "#AAB0C0", backgroundColor: "#171B2A" },
  tabsShell: { borderBottomWidth: 1, borderColor: "#1E2233" },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 10 },
  tab: { paddingHorizontal: 14, height: 30, borderRadius: 15, backgroundColor: "#1A1D28", alignItems: "center", justifyContent: "center", marginRight: 8 },
  smallTab: { paddingHorizontal: 12, height: 28, borderRadius: 14, backgroundColor: "#1A1D28", alignItems: "center", justifyContent: "center", marginRight: 8 },
  tabActive: { backgroundColor: "#FFD34D" },
  tabText: { color: "#AAB0C0", fontSize: 11, fontWeight: "900" },
  tabTextActive: { color: "#090909" },
  messageBox: { margin: 12, marginBottom: 0, padding: 12, backgroundColor: "#16251A", borderWidth: 1, borderColor: "#2F8F46", borderRadius: 14 },
  messageText: { color: "#D8FFE1", fontSize: 12, fontWeight: "800" },
  infoBox: { backgroundColor: "#11131E", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#2A3042" },
  conversionBox: { backgroundColor: "#211B10", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#FFD34D" },
  conversionTitle: { color: "#FFD34D", fontSize: 13, fontWeight: "900", marginBottom: 6 },
  conversionText: { color: "#F1DFAD", fontSize: 12, lineHeight: 18 },
  vipStatusBox: { borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1 },
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
  content: { padding: 14, paddingBottom: 50 },
  sectionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", marginBottom: 12 },
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
  cosmeticTabs: { paddingBottom: 12 },
  restoreButton: { marginTop: 4, height: 42, borderRadius: 14, borderWidth: 1, borderColor: "#FFD34D", alignItems: "center", justifyContent: "center" },
  restoreText: { color: "#FFD34D", fontWeight: "900" },
  truthBox: { backgroundColor: "#11131E", borderRadius: 16, padding: 14, marginTop: 8, borderWidth: 1, borderColor: "#2A3042" },
  truthTitle: { color: "#FFD34D", fontWeight: "900", marginBottom: 6 },
  truthText: { color: "#B8BECC", fontSize: 12, lineHeight: 18 },
});
