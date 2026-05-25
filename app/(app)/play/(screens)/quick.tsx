// app/(app)/play/(screens)/quick.tsx
// Premium Quick Play — new asset-backed mode selection.

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

const HERO = require("../../../../assets/premium/quick-play/quick_hero_atmosphere.webp");

const MODES: {
  key: QuickMode;
  title: string;
  subtitle: string;
  eyebrow: string;
  image: any;
  accent: string;
  titleColor: string;
}[] = [
  {
    key: "classic",
    title: "Classic",
    subtitle: "A clean trivia run with steady pacing.",
    eyebrow: "STANDARD",
    image: require("../../../../assets/premium/quick-play/mode_classic.webp"),
    accent: "#D8B35E",
    titleColor: "#FFF1C7",
  },
  {
    key: "speed",
    title: "Speed",
    subtitle: "Answer fast and keep momentum alive.",
    eyebrow: "FAST",
    image: require("../../../../assets/premium/quick-play/mode_speed.webp"),
    accent: "#6FD6FF",
    titleColor: "#DDF6FF",
  },
  {
    key: "timed60",
    title: "60 Seconds",
    subtitle: "One minute. Maximum focus.",
    eyebrow: "TIMER",
    image: require("../../../../assets/premium/quick-play/mode_sixty.webp"),
    accent: "#F0BC52",
    titleColor: "#FFE6B2",
  },
  {
    key: "timed90",
    title: "90 Seconds",
    subtitle: "Balanced pressure with room to recover.",
    eyebrow: "TIMER",
    image: require("../../../../assets/premium/quick-play/mode_ninety.webp"),
    accent: "#B68CFF",
    titleColor: "#E9DBFF",
  },
  {
    key: "sudden",
    title: "Sudden Death",
    subtitle: "One mistake ends the run.",
    eyebrow: "PRECISION",
    image: require("../../../../assets/premium/quick-play/mode_sudden_death.webp"),
    accent: "#FF6B7A",
    titleColor: "#FFD8DE",
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

  const requestedCategory = Array.isArray(paramCategory) ? paramCategory[0] : paramCategory;
  const selectedCategory = getPlayableCategoryById(requestedCategory);
  const categoryLabel = selectedCategory?.label?.toUpperCase() ?? "RANDOM MIX";

  return (
    <Animated.ScrollView
      style={[styles.root, { opacity: fade }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground source={HERO} style={styles.hero} imageStyle={styles.heroImage}>
        <View testID="screen-quick-play" style={styles.heroOverlay}>
          <Text style={styles.kicker}>QUICK PLAY</Text>
          <Text style={styles.title}>Choose Your Challenge</Text>
          <Text style={styles.subtitle}>
            Pick your pace. Build momentum. Start instantly.
          </Text>
        </View>
      </ImageBackground>

      <View testID="screen-quick-play" style={styles.categoryRow}>
        <View testID="screen-quick-play" style={styles.categoryPill}>
          <Text style={styles.categoryLabel}>CATEGORY • {categoryLabel}</Text>
        </View>

        <Pressable
          onPress={() => router.push("/play/categorySelect")}
          style={({ pressed }) => [styles.changePill, pressed && styles.pressed]}
        >
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      </View>

      <View testID="screen-quick-play" style={styles.modeStack}>
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
              <View testID="screen-quick-play" style={styles.modeShade}>
                <Text style={[styles.modeEyebrow, { color: mode.accent }]}>
                  {mode.eyebrow}
                </Text>
                <Text style={[styles.modeTitle, { color: mode.titleColor }]}>
                  {mode.title}
                </Text>
                <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                <View testID="screen-quick-play"
                  style={[
                    styles.modeAccentBar,
                    { backgroundColor: mode.accent },
                  ]}
                />
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </View>

      {!!vipTier && (
        <View testID="screen-quick-play" style={styles.vipBanner}>
          <Text style={styles.vipTitle}>VIP ACTIVE</Text>
          <Text style={styles.vipSub}>Bonus rewards enabled for quick sessions.</Text>
        </View>
      )}

      <Pressable
        onPress={() => router.push("/play/categorySelect")}
        style={({ pressed }) => [styles.backPill, pressed && styles.pressed]}
      >
        <Text style={styles.backText}>Categories</Text>
      </Pressable>

      <View testID="screen-quick-play" style={{ height: 42 }} />
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#070B12",
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 34,
    paddingBottom: 44,
  },
  hero: {
    height: 176,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 18,
    backgroundColor: "#101722",
    borderWidth: 1,
    borderColor: "rgba(143,183,217,0.14)",
  },
  heroImage: {
    borderRadius: 24,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(3,7,13,0.40)",
  },
  kicker: {
    color: "#D8B35E",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 7,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowRadius: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 10,
  },
  subtitle: {
    color: "#D7E6F5",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 20,
    maxWidth: "82%",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowRadius: 7,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  categoryPill: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(18,26,38,0.72)",
    borderWidth: 1,
    borderColor: "rgba(143,183,217,0.14)",
  },
  categoryLabel: {
    color: "#BFD4E8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  changePill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(18,26,38,0.72)",
    borderWidth: 1,
    borderColor: "rgba(143,183,217,0.14)",
  },
  changeText: {
    color: "#C9E3F7",
    fontSize: 12,
    fontWeight: "900",
  },
  modeStack: {
    gap: 12,
    marginTop: 2,
  },
  modeCard: {
    height: 108,
    borderRadius: 19,
    overflow: "hidden",
    backgroundColor: "#101722",
    borderWidth: 1,
    borderColor: "rgba(143,183,217,0.14)",
  },
  modeImage: {
    flex: 1,
  },
  modeImageStyle: {
    borderRadius: 19,
  },
  modeShade: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "rgba(3,7,13,0.38)",
  },
  modeEyebrow: {
    color: "#C9E3F7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  modeTitle: {
    color: "#EFF5FA",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.35,
  },
  modeSubtitle: {
    color: "#AEBFD1",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 5,
    maxWidth: "78%",
  },
  modeAccentBar: {
    width: 44,
    height: 3,
    borderRadius: 999,
    marginTop: 10,
    opacity: 0.95,
  },
  vipBanner: {
    marginTop: 15,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(14,20,30,0.94)",
    borderWidth: 1,
    borderColor: "rgba(143,183,217,0.14)",
  },
  vipTitle: {
    color: "#C9E3F7",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },
  vipSub: {
    color: "#D6E6F5",
    fontSize: 12,
    fontWeight: "700",
  },
  backPill: {
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(14,20,30,0.82)",
    borderWidth: 1,
    borderColor: "rgba(143,183,217,0.14)",
    marginTop: 16,
  },
  backText: {
    color: "#D6E6F5",
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});



