import React, { useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  formatArenaTokenRotationTime,
  getArenaTokenRotation,
  isArenaPrestigeItemFeatured,
  sortArenaPrestigeItemsForRotation,
} from "@/arena/shop/arenaTokenRotation";
import { useArenaEconomyStore } from "@/arena/store/useArenaEconomyStore";
import {
  ARENA_PRESTIGE_ITEMS,
  ArenaPrestigeItem,
  useArenaShopStore,
} from "@/arena/store/useArenaShopStore";
import { s } from "@/arena/theme/arenaSizing";
import { useThemedAlert } from "@/components/ThemedAlert";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function ArenaShop() {
  const { showThemedAlert, themedAlert } = useThemedAlert();
  const coins = usePlayerStore((state) => state.coins);
  const arenaTokens = useArenaEconomyStore((state) => state.arenaTokens);
  const powerCharges = useArenaEconomyStore((state) => state.powerCharges);

  const ownedPrestigeItems = useArenaShopStore((state) => state.ownedPrestigeItems);
  const buySingleCharge = useArenaShopStore((state) => state.buySingleCharge);
  const buyFiveCharges = useArenaShopStore((state) => state.buyFiveCharges);
  const buyPremiumCharges = useArenaShopStore((state) => state.buyPremiumCharges);
  const buyPrestigeItem = useArenaShopStore((state) => state.buyPrestigeItem);

  const rotation = useMemo(() => getArenaTokenRotation(), []);
  const rotationTimeLeft = useMemo(() => formatArenaTokenRotationTime(rotation.endsAt), [rotation.endsAt]);
  const sortedPrestigeItems = useMemo(
    () => sortArenaPrestigeItemsForRotation(ARENA_PRESTIGE_ITEMS, rotation),
    [rotation],
  );

  const handleBuy = (action: () => boolean, failMsg: string, successMsg = "Your arena item has been added.") => {
    const success = action();
    if (!success) {
      showThemedAlert("Purchase failed", failMsg, "danger");
    } else {
      showThemedAlert("Purchase complete", successMsg, "success");
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Arena Shop</Text>
        <Text style={styles.subtitle}>Spend Arena Tokens on prestige identity or convert them into competitive power.</Text>

        <View style={styles.balanceBox}>
          <Balance label="Coins" value={coins} />
          <Balance label="Arena Tokens" value={arenaTokens} highlight />
          <Balance label="Power Charges" value={powerCharges} />
        </View>

        <View style={styles.rotationPanel}>
          <View style={styles.rotationTopRow}>
            <Text style={styles.rotationEyebrow}>Weekly Token Rotation</Text>
            <Text style={[styles.rotationTimer, rotation.leavingSoon && styles.rotationTimerUrgent]}>
              {rotation.leavingSoon ? "LEAVING " : "ENDS "}{rotationTimeLeft}
            </Text>
          </View>
          <Text style={styles.rotationTitle}>{rotation.title}</Text>
          <Text style={styles.rotationSubtitle}>{rotation.subtitle}</Text>
          <Text style={styles.rotationReward}>{rotation.rewardBoostLabel}</Text>
        </View>

        <Text style={styles.sectionEyebrow}>Token Prestige Rewards</Text>
        <Text style={styles.sectionHint}>Permanent Arena identity unlocks. Featured rows rotate weekly so tokens always have a fresh target.</Text>

        {sortedPrestigeItems.map((item) => {
          const owned = ownedPrestigeItems[item.id] === true;
          const featured = isArenaPrestigeItemFeatured(item, rotation);
          return (
            <PrestigeItemCard
              key={item.id}
              item={item}
              owned={owned}
              featured={featured}
              leavingSoon={featured && rotation.leavingSoon}
              disabled={!owned && arenaTokens < item.price}
              onPress={() =>
                handleBuy(
                  () => buyPrestigeItem(item.id),
                  "Not enough arena tokens",
                  `${item.title} added to your Arena prestige collection.`,
                )
              }
            />
          );
        })}

        <Text style={styles.sectionEyebrow}>Power Charge Exchange</Text>
        <Text style={styles.sectionHint}>Use coins for standard refills or spend tokens when you want a serious Power Arena session.</Text>

        <ShopButton
          title="+1 Power Charge"
          price="50 Coins"
          disabled={coins < 50}
          onPress={() => handleBuy(buySingleCharge, "Not enough coins")}
        />

        <ShopButton
          title="+5 Power Charges"
          price="220 Coins"
          disabled={coins < 220}
          onPress={() => handleBuy(buyFiveCharges, "Not enough coins")}
        />

        <ShopButton
          title="+5 Power Charges (Token Boost)"
          price="3 Arena Tokens"
          disabled={arenaTokens < 3}
          onPress={() => handleBuy(buyPremiumCharges, "Not enough arena tokens")}
          premium
        />
      </ScrollView>
      {themedAlert}
    </>
  );
}

function Balance({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <View style={[styles.balanceItem, highlight && styles.balanceItemHighlight]}>
      <Text style={styles.balanceLabel}>{label}</Text>
      <Text style={[styles.balanceValue, highlight && styles.balanceValueHighlight]}>{value}</Text>
    </View>
  );
}

function PrestigeItemCard({
  item,
  owned,
  featured,
  leavingSoon,
  disabled,
  onPress,
}: {
  item: ArenaPrestigeItem;
  owned: boolean;
  featured: boolean;
  leavingSoon: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const statusLabel = owned ? "OWNED" : leavingSoon ? "LEAVING" : featured ? "FEATURED" : `${item.price} AT`;

  return (
    <TouchableOpacity
      style={[
        styles.prestigeItem,
        featured && styles.prestigeFeatured,
        owned && styles.prestigeOwned,
        disabled && styles.disabled,
      ]}
      disabled={owned || disabled}
      onPress={onPress}
      activeOpacity={0.76}
    >
      <View style={styles.prestigeTopRow}>
        <View style={styles.prestigeTitleBlock}>
          <Text style={styles.prestigeTitle}>{item.title}</Text>
          <Text style={styles.prestigeReward}>{item.rewardLabel} • {item.tier.toUpperCase()}</Text>
        </View>
        <Text style={[styles.prestigeBadge, owned && styles.prestigeBadgeOwned, leavingSoon && styles.prestigeBadgeUrgent]}>{statusLabel}</Text>
      </View>
      <Text style={styles.prestigeDescription}>{item.description}</Text>
      <View style={styles.prestigeMetaRow}>
        <Text style={styles.prestigePrice}>{owned ? "Permanent prestige unlocked" : `${item.price} Arena Tokens`}</Text>
        <Text style={styles.rotationTag}>{item.rotationTag}</Text>
      </View>
      {featured ? <Text style={styles.featuredCopy}>{item.gateLabel ?? "Weekly rotation item"}</Text> : null}
    </TouchableOpacity>
  );
}

function ShopButton({
  title,
  price,
  disabled,
  onPress,
  premium = false,
}: {
  title: string;
  price: string;
  disabled: boolean;
  onPress: () => void;
  premium?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.item, premium && styles.premiumItem, disabled && styles.disabled]}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemPrice}>{price}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
  },
  content: {
    paddingTop: s(60),
    paddingHorizontal: s(20),
    paddingBottom: s(40),
  },

  title: {
    color: "#FFD54F",
    fontSize: s(28),
    fontWeight: "800",
    textAlign: "center",
    marginBottom: s(8),
  },

  subtitle: {
    color: "#B9C7DD",
    fontSize: s(12),
    lineHeight: s(17),
    textAlign: "center",
    marginBottom: s(22),
    fontWeight: "700",
  },

  balanceBox: {
    backgroundColor: "#1b1b27",
    padding: s(16),
    borderRadius: s(14),
    marginBottom: s(18),
    borderWidth: 1,
    borderColor: "rgba(143,234,255,0.16)",
  },

  balanceItem: {
    marginBottom: s(12),
  },

  balanceItemHighlight: {
    paddingVertical: s(8),
    paddingHorizontal: s(10),
    borderRadius: s(12),
    backgroundColor: "rgba(143,234,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(143,234,255,0.22)",
  },

  balanceLabel: {
    color: "#aaa",
    fontSize: s(14),
  },

  balanceValue: {
    color: "#fff",
    fontSize: s(22),
    fontWeight: "700",
  },

  balanceValueHighlight: {
    color: "#8FEAFF",
  },

  rotationPanel: {
    padding: s(14),
    borderRadius: s(18),
    backgroundColor: "rgba(7,24,42,0.94)",
    borderWidth: 1,
    borderColor: "rgba(143,234,255,0.32)",
    marginBottom: s(18),
  },
  rotationTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: s(10),
    marginBottom: s(7),
  },
  rotationEyebrow: {
    color: "#8FEAFF",
    fontSize: s(10),
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  rotationTimer: {
    color: "#062033",
    backgroundColor: "#8FEAFF",
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    fontSize: s(9),
    fontWeight: "900",
  },
  rotationTimerUrgent: {
    backgroundColor: "#FFD54F",
    color: "#171104",
  },
  rotationTitle: {
    color: "#FFFFFF",
    fontSize: s(18),
    fontWeight: "900",
  },
  rotationSubtitle: {
    color: "#B9C7DD",
    fontSize: s(12),
    lineHeight: s(17),
    marginTop: s(6),
    fontWeight: "700",
  },
  rotationReward: {
    color: "#FFD54F",
    fontSize: s(11),
    fontWeight: "900",
    marginTop: s(8),
  },

  sectionEyebrow: {
    color: "#8FEAFF",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: s(7),
    textTransform: "uppercase",
  },

  sectionHint: {
    color: "#8FA3C9",
    fontSize: s(11),
    lineHeight: s(16),
    marginBottom: s(10),
    fontWeight: "700",
  },

  prestigeItem: {
    backgroundColor: "rgba(15,35,50,0.92)",
    borderWidth: 1,
    borderColor: "rgba(143,234,255,0.30)",
    padding: s(14),
    borderRadius: s(14),
    marginBottom: s(12),
  },

  prestigeFeatured: {
    borderColor: "rgba(255,213,79,0.46)",
    backgroundColor: "rgba(20,38,54,0.96)",
  },

  prestigeOwned: {
    borderColor: "rgba(255,213,79,0.42)",
    backgroundColor: "rgba(35,31,17,0.88)",
  },

  prestigeTopRow: {
    flexDirection: "row",
    gap: s(10),
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  prestigeTitleBlock: {
    flex: 1,
    minWidth: 0,
  },

  prestigeTitle: {
    color: "#EAFBFF",
    fontSize: s(16),
    fontWeight: "800",
  },

  prestigeReward: {
    color: "#8FEAFF",
    fontSize: s(10),
    fontWeight: "900",
    marginTop: s(4),
    letterSpacing: 0.5,
  },

  prestigeBadge: {
    color: "#062033",
    backgroundColor: "#8FEAFF",
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    fontSize: s(9),
    fontWeight: "900",
  },

  prestigeBadgeOwned: {
    backgroundColor: "#FFD54F",
    color: "#171104",
  },

  prestigeBadgeUrgent: {
    backgroundColor: "#FFD54F",
    color: "#171104",
  },

  prestigeDescription: {
    color: "#B9C7DD",
    fontSize: s(12),
    lineHeight: s(17),
    marginTop: s(8),
  },

  prestigeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: s(10),
    marginTop: s(8),
  },

  prestigePrice: {
    color: "#FFD54F",
    fontSize: s(12),
    fontWeight: "900",
    flex: 1,
  },

  rotationTag: {
    color: "#8FEAFF",
    fontSize: s(10),
    fontWeight: "900",
  },

  featuredCopy: {
    color: "#EAFBFF",
    fontSize: s(11),
    lineHeight: s(15),
    fontWeight: "800",
    marginTop: s(8),
  },

  item: {
    backgroundColor: "#272737",
    padding: s(18),
    borderRadius: s(14),
    marginBottom: s(15),
    borderWidth: 1,
    borderColor: "rgba(143,234,255,0.12)",
  },

  premiumItem: {
    backgroundColor: "rgba(15,35,50,0.92)",
    borderColor: "rgba(143,234,255,0.30)",
  },

  itemTitle: {
    color: "#fff",
    fontSize: s(18),
    fontWeight: "600",
  },

  itemPrice: {
    color: "#aaa",
    fontSize: s(14),
    marginTop: s(4),
  },

  disabled: {
    opacity: 0.4,
  },
});
