
// app/(app)/play/(screens)/quick.tsx — Compact premium Quick Play mode selection

import React, { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import type { QuickMode } from "@/store/useQuickGameStore";
import { useQuickGameStore } from "@/store/useQuickGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { PLAYABLE_CATEGORIES, getPlayableCategoryById } from "@/data/categories";

const HERO = require("../../../../assets/images/play/quick_play_hero_banner.webp");

const MODES: {
  key: QuickMode;
  image: any;
}[] = [
  {
    key: "classic",
    image: require("../../../../assets/images/play/modes/classic_mode_art.webp"),
  },
  {
    key: "speed",
    image: require("../../../../assets/images/play/modes/speed_mode_art.webp"),
  },
  {
    key: "timed60",
    image: require("../../../../assets/images/play/modes/sixty_seconds_mode_card.webp"),
  },
  {
    key: "timed90",
    image: require("../../../../assets/images/play/modes/ninety_seconds_mode_art.webp"),
  },
  {
    key: "sudden",
    image: require("../../../../assets/images/play/modes/sudden_death_mode_art.webp"),
  },
];

export default function QuickPlay() {
  const router = useRouter();
  const { category: paramCategory } = useLocalSearchParams();

  const setCategory = useQuickGameStore((s) => s.setCategory);
  const resetGame = useQuickGameStore((s) => s.resetGame);
  const initGame = useQuickGameStore((s) => s.initGame);
  const vipTier = usePlayerStore((s) => s.vipTier);

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const resolveCategory = () => {
    const requested = Array.isArray(paramCategory) ? paramCategory[0] : paramCategory;
    const requestedCategory = getPlayableCategoryById(requested);

    if (requestedCategory) return requestedCategory.id;

    const fallback = PLAYABLE_CATEGORIES[
      Math.floor(Math.random() * PLAYABLE_CATEGORIES.length)
    ];

    return fallback.id;
  };

  const launchMode = (mode: QuickMode) => {
    const categoryId = resolveCategory();

    setCategory(categoryId);
    resetGame();
    initGame(mode, categoryId);

    router.push("/play/game");
  };

  const categoryLabel = String(paramCategory || "Random").toUpperCase();

  return (
    <Animated.ScrollView
      style={[styles.root, { opacity: fade }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground source={HERO} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay}>
          <Text style={styles.kicker}>QUICK PLAY</Text>
          <Text style={styles.title}>Choose Your Challenge</Text>
          <Text style={styles.subtitle}>Pick a mode and jump straight into trivia.</Text>
        </View>
      </ImageBackground>

      <View style={styles.categoryRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryLabel}>CATEGORY • {categoryLabel}</Text>
        </View>

        <Pressable
          onPress={() => router.push("/play/categorySelect")}
          style={({ pressed }) => [styles.changePill, pressed && styles.pressed]}
        >
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      </View>

      <View style={styles.modeStack}>
        {MODES.map((mode) => (
          <Pressable
            key={mode.key}
            onPress={() => launchMode(mode.key)}
            style={({ pressed }) => [styles.modeCard, pressed && styles.pressed]}
          >
            <ImageBackground
              source={mode.image}
              style={styles.modeImage}
              imageStyle={styles.modeImageStyle}
              resizeMode="cover"
            >
              <View style={styles.cardEdge} />
            </ImageBackground>
          </Pressable>
        ))}
      </View>

      {!!vipTier && (
        <View style={styles.vipBanner}>
          <Text style={styles.vipTitle}>VIP ACTIVE</Text>
          <Text style={styles.vipSub}>Bonus rewards enabled for Quick Play sessions.</Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push("/play/categorySelect")}
        style={({ pressed }) => [styles.backPill, pressed && styles.pressed]}
      >
        <Text style={styles.backText}>◀ Back to Categories</Text>
      </Pressable>

      <View style={{ height: 48 }} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#070B18",
  },

  container: {
  paddingHorizontal: 18,
  paddingTop: 20,
  paddingBottom: 48,
},

  hero: {
    height: 164,
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#11182D",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.12)",
  },

  heroImage: {
    borderRadius: 26,
  },

  heroOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 32,
    backgroundColor: "rgba(0,0,0,0.34)",
  },

  kicker: {
    color: "#F5B942",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 4,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6,
  },

  subtitle: {
    color: "#D8E1FF",
    fontSize: 13,
    fontWeight: "700",
    maxWidth: "78%",
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  categoryPill: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(20,28,52,0.9)",
    borderWidth: 1,
    borderColor: "rgba(88,140,255,0.22)",
  },

  categoryLabel: {
    color: "#DCE7FF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  changePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(245,185,66,0.14)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.28)",
  },

  changeText: {
    color: "#F5B942",
    fontSize: 12,
    fontWeight: "900",
  },

 modeStack: {
  gap: 10,
  marginTop: 4,
},

 modeCard: {
  height: 104,
  borderRadius: 22,

  marginBottom: 10,

  borderWidth: 1.2,
  borderColor: "rgba(245,185,66,0.22)",

  shadowColor: "#000",
  shadowOpacity: 0.28,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },

  elevation: 6,
},

  modeImage: {
    flex: 1,
  },

  modeImageStyle: {
    borderRadius: 22,
  },

  cardEdge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  vipBanner: {
    marginTop: 16,
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(28,38,68,0.96)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.16)",
  },

  vipTitle: {
    color: "#F5B942",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  vipSub: {
    color: "#DCE7FF",
    fontSize: 12,
    fontWeight: "700",
  },

  backPill: {
    height: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,28,52,0.82)",
    borderWidth: 1,
    borderColor: "rgba(88,140,255,0.22)",
    marginTop: 16,
  },

  backText: {
    color: "#DCE7FF",
    fontSize: 15,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
