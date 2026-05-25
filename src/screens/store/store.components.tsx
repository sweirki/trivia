// app/(app)/stor@/screens/store/store.components.tsx
// Phase 5F — Store screen UI extraction.
// Pure presentational components only; purchase and persistence behavior stays in index.tsx.

import type { ReactNode } from "react";
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CosmeticCategory, CosmeticItem } from "@/cosmetics/types";
import { getCosmeticAssetSource, getStoreHeroAsset } from "@/cosmetics/cosmeticAssets";


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


export function StoreHeroPanel({
  art,
  eyebrow,
  title,
  body,
  accent = "#FFD34D",
}: {
  art: ImageSourcePropType | null;
  eyebrow: string;
  title: string;
  body: string;
  accent?: string;
}) {
  return (
    <View style={styles.heroPanel}>
      {art ? <Image source={art} style={styles.heroArt} resizeMode="cover" /> : null}
      <View pointerEvents="none" style={styles.heroShade} />
      <View pointerEvents="none" style={[styles.heroRim, { borderColor: `${accent}66` }]} />
      <View style={styles.heroCopy}>
        <Text allowFontScaling maxFontSizeMultiplier={1.15} style={[styles.heroEyebrow, { color: accent }]}>
          {eyebrow}
        </Text>
        <Text allowFontScaling maxFontSizeMultiplier={1.15} style={styles.heroTitle}>
          {title}
        </Text>
        <Text allowFontScaling maxFontSizeMultiplier={1.15} style={styles.heroBody}>
          {body}
        </Text>
      </View>
    </View>
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
  artKey,
  accent,
}: {
  title: string;
  subtitle: string;
  meta?: string;
  buttonLabel: string;
  disabled?: boolean;
  onPress: () => void;
  badge?: string;
  artKey?: string;
  accent?: string;
}) {
  const isVipCard = title.toLowerCase().includes("vip") || String(badge ?? "").toLowerCase().includes("vip");
  const resolvedAccent = accent ?? (isVipCard ? "#FFD34D" : "#9FE7FF");
  const art = getStoreHeroAsset(artKey ?? (isVipCard ? "vip_prestige_hero" : null));

  return (
    <View accessible style={[styles.card, styles.artProductCard, isVipCard && styles.vipProductCard, { borderColor: `${resolvedAccent}55` }]}>
      {art ? <Image accessible={false} source={art} style={styles.cardArt} resizeMode="cover" /> : null}
      {art ? <View pointerEvents="none" style={styles.cardArtShade} /> : null}
      <View pointerEvents="none" style={[styles.cardGlow, { backgroundColor: `${resolvedAccent}22` }]} />
      <View pointerEvents="none" style={[styles.cardTopLine, { backgroundColor: resolvedAccent }]} />

      <View style={styles.cardTopRow}>
        <Text allowFontScaling maxFontSizeMultiplier={1.2} style={[styles.cardTitle, { color: resolvedAccent }]}>{title}</Text>
        {badge ? <Text allowFontScaling maxFontSizeMultiplier={1.2} numberOfLines={1} style={[styles.badge, { backgroundColor: resolvedAccent }]}>{badge}</Text> : null}
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

const COSMETIC_CATEGORY_SURFACE: Partial<Record<CosmeticCategory, string>> = {
  [CosmeticCategory.AVATAR]: "cosmetics_avatar_hero",
  [CosmeticCategory.AVATAR_FRAME]: "cosmetics_frames_hero",
  [CosmeticCategory.PROFILE_BACKGROUND]: "cosmetics_backgrounds_hero",
  [CosmeticCategory.BADGE]: "cosmetics_badges_hero",
  [CosmeticCategory.STREAK_AURA]: "cosmetics_streaks_hero",
  [CosmeticCategory.ARENA_BANNER]: "cosmetics_banners_hero",
  [CosmeticCategory.ANSWER_TRAIL]: "cosmetics_trails_hero",
};


export function StoreInfoCard({
  title,
  children,
  artKey,
  accent = "#9FE7FF",
  compact = false,
}: {
  title?: string;
  children: ReactNode;
  artKey?: string;
  accent?: string;
  compact?: boolean;
}) {
  const art = getStoreHeroAsset(artKey ?? null);

  return (
    <View style={[styles.infoArtCard, compact && styles.infoArtCardCompact, { borderColor: `${accent}3F` }]}>
      {art ? <Image accessible={false} source={art} style={styles.infoArt} resizeMode="cover" /> : null}
      {art ? <View pointerEvents="none" style={styles.infoArtShade} /> : null}
      <View pointerEvents="none" style={[styles.infoArtGlow, { backgroundColor: `${accent}1F` }]} />
      <View pointerEvents="none" style={[styles.cardTopLine, { backgroundColor: accent }]} />
      {title ? <Text allowFontScaling maxFontSizeMultiplier={1.2} style={[styles.infoArtTitle, { color: accent }]}>{title}</Text> : null}
      {children}
    </View>
  );
}


const RARITY_ACCENT: Record<string, string> = {
  COMMON: "#9FE7FF",
  RARE: "#58B8FF",
  EPIC: "#C58CFF",
  LEGENDARY: "#FFD34D",
};

function getRarityAccent(rarity?: string) {
  return RARITY_ACCENT[String(rarity ?? "COMMON").toUpperCase()] ?? "#FFD34D";
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
  const surfaceArt = getStoreHeroAsset(COSMETIC_CATEGORY_SURFACE[item.category] ?? "cosmetics_collection_hero");

  const rarityAccent = getRarityAccent(String(item.rarity));
  const isLegendary = String(item.rarity).toUpperCase() === "LEGENDARY";

  return (
    <View style={[styles.card, styles.cosmeticCard, isLegendary && styles.legendaryCard, { borderColor: `${rarityAccent}55` }]}>
      {surfaceArt ? <Image accessible={false} source={surfaceArt} style={styles.cosmeticSurfaceArt} resizeMode="cover" /> : null}
      <View pointerEvents="none" style={styles.cosmeticSurfaceShade} />
      <View pointerEvents="none" style={[styles.cosmeticAura, { backgroundColor: rarityAccent }]} />
      <View pointerEvents="none" style={[styles.cardTopLine, { backgroundColor: rarityAccent }]} />

      <View style={styles.cosmeticPreviewRow}>
        <View style={[styles.cosmeticPreviewShell, { borderColor: `${rarityAccent}88` }]}>
          {assetSource ? <Image accessible={false} source={assetSource} style={styles.cosmeticPreview} resizeMode="cover" /> : null}
        </View>

        <View style={styles.cosmeticTextBlock}>
          <View style={styles.cardTopRow}>
            <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.cardTitle}>{item.name}</Text>
            <Text allowFontScaling maxFontSizeMultiplier={1.2} style={[styles.badge, { backgroundColor: rarityAccent }]}>
              {item.vipOnly ? "VIP" : item.rarity}
            </Text>
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
            {canAfford ? "Unlock Cosmetic" : "Not enough balance"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    minHeight: 142,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(255,211,77,0.28)",
    marginBottom: 10,
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  heroArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.98,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,14,0.18)",
  },
  heroRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
  },
  heroCopy: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
    paddingRight: 58,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textShadowColor: "rgba(0,0,0,0.92)",
    textShadowRadius: 7,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.96)",
    textShadowRadius: 9,
  },
  heroBody: {
    color: "#D8E7FF",
    fontSize: 10.6,
    lineHeight: 15,
    fontWeight: "800",
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },

  tabsShell: {
    borderBottomWidth: 1,
    borderColor: "rgba(110,170,255,0.14)",
    backgroundColor: "rgba(2,6,14,0.62)",
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 13,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(28,32,48,0.90)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.08)",
  },
  tabActive: {
    backgroundColor: "rgba(35,58,73,0.98)",
    borderColor: "rgba(143,234,255,0.76)",
    shadowColor: "#8FEAFF",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  tabText: {
    color: "#AAB0C0",
    fontSize: 11,
    fontWeight: "900",
  },
  tabTextActive: {
    color: "#EAFBFF",
  },
  messageBox: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 0,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(22,37,26,0.94)",
    borderWidth: 1,
    borderColor: "#2F8F46",
    borderRadius: 14,
    justifyContent: "center",
  },
  messageText: {
    color: "#D8FFE1",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "rgba(5,8,24,0.88)",
    borderRadius: 19,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.28)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.20,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  artProductCard: {
    minHeight: 136,
    justifyContent: "flex-end",
  },
  cardArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.72,
  },
  cardArtShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(1,4,14,0.46)",
  },

  vipProductCard: {
    borderColor: "rgba(255,211,77,0.34)",
  },
  legendaryCard: {
    borderColor: "rgba(255,211,77,0.42)",
  },
  cardGlow: {
    position: "absolute",
    right: -45,
    top: -55,
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: "rgba(88,184,255,0.10)",
  },
  cardTopLine: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    height: 1,
    backgroundColor: "rgba(255,211,77,0.68)",
    opacity: 0.7,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    color: "#FFD34D",
    fontSize: 15,
    fontWeight: "900",
    flex: 1,
    letterSpacing: -0.1,
  },
  cardSubtitle: {
    color: "#C6CAD7",
    fontSize: 11.3,
    lineHeight: 16,
    marginTop: 5,
    fontWeight: "700",
  },
  cardMeta: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "900",
    marginTop: 6,
  },
  badge: {
    color: "#080811",
    backgroundColor: "#E6BE57",
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: "900",
  },
  buyButton: {
    marginTop: 10,
    height: 37,
    borderRadius: 14,
    backgroundColor: "#8EDCF7",
    borderWidth: 1,
    borderColor: "#C6F1FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8FEAFF",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "rgba(55,59,74,0.72)",
    shadowOpacity: 0,
  },
  buyText: {
    color: "#062033",
    fontSize: 12.5,
    fontWeight: "900",
  },
  disabledText: {
    color: "#9AA0B2",
  },

  infoArtCard: {
    minHeight: 104,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: "rgba(5,8,24,0.90)",
    overflow: "hidden",
  },
  infoArtCardCompact: {
    minHeight: 84,
  },
  infoArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.46,
  },
  infoArtShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(1,4,14,0.58)",
  },
  infoArtGlow: {
    position: "absolute",
    right: -42,
    top: -48,
    width: 142,
    height: 142,
    borderRadius: 72,
  },
  infoArtTitle: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
  },

  cosmeticCard: {
    minHeight: 132,
    padding: 11,
    justifyContent: "flex-end",
  },
  cosmeticSurfaceArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.52,
  },
  cosmeticSurfaceShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(1,4,14,0.54)",
  },
  cosmeticAura: {
    position: "absolute",
    right: -60,
    top: -68,
    width: 150,
    height: 150,
    borderRadius: 80,
    opacity: 0.16,
  },
  cosmeticPreviewRow: {
    flexDirection: "row",
    gap: 11,
    alignItems: "center",
  },
  cosmeticPreviewShell: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: "rgba(7,17,31,0.88)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  cosmeticPreview: {
    width: "100%",
    height: "100%",
  },
  cosmeticTextBlock: {
    flex: 1,
    minWidth: 0,
  },
});


