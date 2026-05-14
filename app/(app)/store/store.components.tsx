// app/(app)/store/store.components.tsx
// Phase 5F — Store screen UI extraction.
// Pure presentational components only; purchase and persistence behavior stays in index.tsx.

import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CosmeticCategory, CosmeticItem } from "@/cosmetics/types";
import { getCosmeticAssetSource } from "@/cosmetics/cosmeticAssets";

export type StoreTabDefinition<TTab extends string> = {
  id: TTab;
  label: string;
};

export function StoreTabBar<TTab extends string>({
  tabs,
  activeTab,
  onSelectTab,
}: {
  tabs: StoreTabDefinition<TTab>[];
  activeTab: TTab;
  onSelectTab: (tab: TTab) => void;
}) {
  return (
    <View style={styles.tabsShell}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.tabsContent}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              testID={`store-tab-${tab.id}`}
              accessibilityRole="tab"
              accessibilityLabel={`${tab.label} store tab`}
              accessibilityState={{ selected: active }}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.85}
            >
              <Text allowFontScaling maxFontSizeMultiplier={1.2} style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function StoreMessageBanner({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;

  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Store message: ${message}. Tap to dismiss.`} style={styles.messageBox} activeOpacity={0.9} onPress={onDismiss}>
      <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.messageText}>{message}</Text>
    </TouchableOpacity>
  );
}

export function StoreProductCard({
  title,
  subtitle,
  meta,
  buttonLabel,
  disabled,
  onPress,
  badge,
}: {
  title: string;
  subtitle: string;
  meta?: string;
  buttonLabel: string;
  disabled?: boolean;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <View accessible style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.cardTitle}>{title}</Text>
        {badge ? <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.badge}>{badge}</Text> : null}
      </View>
      <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.cardSubtitle}>{subtitle}</Text>
      {meta ? <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.cardMeta}>{meta}</Text> : null}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${buttonLabel}: ${title}`}
        accessibilityState={{ disabled: !!disabled }}
        activeOpacity={0.85}
        disabled={disabled}
        onPress={onPress}
        style={[styles.buyButton, disabled && styles.disabledButton]}
      >
        <Text allowFontScaling maxFontSizeMultiplier={1.2} style={[styles.buyText, disabled && styles.disabledText]}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function StoreCosmeticCard({
  item,
  ownedCosmetics,
  equippedCosmetics,
  coins,
  gems,
  onEquip,
  onPurchase,
  onMessage,
}: {
  item: CosmeticItem;
  ownedCosmetics?: Record<string, boolean>;
  equippedCosmetics?: Partial<Record<CosmeticCategory, string>>;
  coins: number;
  gems: number;
  onEquip: (id: string) => boolean;
  onPurchase: (id: string) => void;
  onMessage: (message: string) => void;
}) {
  const owned = ownedCosmetics?.[item.id] === true;
  const equipped = equippedCosmetics?.[item.category] === item.id;
  const canAfford = item.price.currency === "COINS" ? coins >= item.price.amount : gems >= item.price.amount;

  const assetSource = getCosmeticAssetSource(item.icon);

  return (
    <View style={styles.card}>
      <View style={styles.cosmeticPreviewRow}>
        {assetSource ? <Image accessible={false} source={assetSource} style={styles.cosmeticPreview} resizeMode="cover" /> : null}
        <View style={styles.cosmeticTextBlock}>
          <View style={styles.cardTopRow}>
            <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.cardTitle}>{item.name}</Text>
            <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.badge}>{item.vipOnly ? "VIP" : item.rarity}</Text>
          </View>
          <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.cardSubtitle}>{item.description || item.category}</Text>
          <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.cardMeta}>
            Cost: {item.price.amount} {item.price.currency}{item.vipOnly ? " • VIP required" : ""}
          </Text>
        </View>
      </View>

      {owned ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${equipped ? "Equipped" : "Equip"} ${item.name}`}
          accessibilityState={{ disabled: equipped, selected: equipped }}
          activeOpacity={0.85}
          disabled={equipped}
          onPress={() => {
            const ok = onEquip(item.id);
            onMessage(ok ? "Cosmetic equipped." : "Could not equip cosmetic.");
          }}
          style={[styles.buyButton, equipped && styles.disabledButton]}
        >
          <Text allowFontScaling maxFontSizeMultiplier={1.2} style={[styles.buyText, equipped && styles.disabledText]}>{equipped ? "Equipped" : "Equip"}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${canAfford ? "Buy" : "Not enough balance for"} ${item.name}`}
          accessibilityState={{ disabled: !canAfford }}
          activeOpacity={0.85}
          disabled={!canAfford}
          onPress={() => onPurchase(item.id)}
          style={[styles.buyButton, !canAfford && styles.disabledButton]}
        >
          <Text allowFontScaling maxFontSizeMultiplier={1.2} style={[styles.buyText, !canAfford && styles.disabledText]}>
            {canAfford ? "Buy" : "Not enough balance"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsShell: { borderBottomWidth: 1, borderColor: "#1E2233" },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 10 },
  tab: { paddingHorizontal: 14, height: 30, borderRadius: 15, backgroundColor: "#1A1D28", alignItems: "center", justifyContent: "center", marginRight: 8 },
  tabActive: { backgroundColor: "#FFD34D" },
  tabText: { color: "#AAB0C0", fontSize: 11, fontWeight: "900" },
  tabTextActive: { color: "#090909" },
  messageBox: { margin: 12, marginBottom: 0, padding: 12, backgroundColor: "#16251A", borderWidth: 1, borderColor: "#2F8F46", borderRadius: 12 },
  messageText: { color: "#D8FFE1", fontSize: 12, fontWeight: "800" },
  card: {
    backgroundColor: "#171B2A",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A3042",
  },
  cosmeticPreviewRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  cosmeticPreview: { width: 58, height: 58, borderRadius: 14, borderWidth: 1, borderColor: "#3B4258", backgroundColor: "#10131E" },
  cosmeticTextBlock: { flex: 1 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  cardTitle: { color: "#FFD34D", fontSize: 15, fontWeight: "900", flex: 1 },
  cardSubtitle: { color: "#C6CAD7", fontSize: 12, lineHeight: 18, marginTop: 7 },
  cardMeta: { color: "#FFFFFF", fontSize: 12, fontWeight: "800", marginTop: 10 },
  badge: { color: "#080811", backgroundColor: "#FFD34D", overflow: "hidden", borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: "900" },
  buyButton: { marginTop: 14, height: 40, borderRadius: 12, backgroundColor: "#FFD34D", alignItems: "center", justifyContent: "center" },
  disabledButton: { backgroundColor: "#2B2E39" },
  buyText: { color: "#090909", fontSize: 13, fontWeight: "900" },
  disabledText: { color: "#808696" },
});
