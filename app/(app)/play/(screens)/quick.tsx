// /app/play/(screens)/quick.tsx — A+++++ QuickPlay Launcher
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import type { QuickMode } from "@/store/useQuickGameStore";

import { useQuickGameStore } from "@/store/useQuickGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { CATEGORIES } from "@/data/categories";

export default function QuickPlay() {
  const router = useRouter();

  const { category: paramCategory } = useLocalSearchParams();

  const setCategory = useQuickGameStore((s) => s.setCategory);
  const resetGame = useQuickGameStore((s) => s.resetGame);
  const initGame = useQuickGameStore((s) => s.initGame);

  const ownedPacks = usePlayerStore((s) => s.ownedPacks);
  const vipTier = usePlayerStore((s) => s.vipTier);

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // --------------------------------------------
  // RESOLVE CATEGORY (fallback-safe)
  // --------------------------------------------
 const resolveCategory = () => {
  let id = paramCategory as string | undefined;

  // 1) No param → pick RANDOM free category
  if (!id) {
    const freeCats = CATEGORIES.filter((c) => !c.premium);
    id = freeCats[Math.floor(Math.random() * freeCats.length)].id;
  }

  // 2) If param points to premium and user is not allowed → fallback RANDOM free
  const meta = CATEGORIES.find((c) => c.id === id);

  if (meta?.premium && !ownedPacks.includes(id) && vipTier < 3) {
    const freeCats = CATEGORIES.filter((c) => !c.premium);
    id = freeCats[Math.floor(Math.random() * freeCats.length)].id;
  }

  return id;
};


  const activeCategory = resolveCategory();

  useEffect(() => {
    setCategory(activeCategory);
  }, [activeCategory]);

  const startQuickGame = (mode: QuickMode) => {
    resetGame();
    initGame(mode, activeCategory);
    router.replace("/play/game");
  };

  const getCategoryLabel = (id) => {
    const c = CATEGORIES.find((x) => x.id === id);
    return c?.label || id;
  };

  // --------------------------------------------
  // MODE BUTTON
  // --------------------------------------------
  const ModeButton = ({ title, subtitle, mode }) => {
    const scale = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View style={[styles.modeWrapper, { transform: [{ scale }] }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.modeBtn}
          onPressIn={() =>
            Animated.spring(scale, {
              toValue: 0.93,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(scale, {
              toValue: 1,
              friction: 5,
              useNativeDriver: true,
            }).start(() => startQuickGame(mode))
          }
        >
          <Text style={styles.modeTitle}>{title}</Text>
          <Text style={styles.modeSubtitle}>{subtitle}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <Text style={styles.heading}>Quick Play</Text>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryLabel}>Category</Text>
          <Text style={styles.categoryName}>{getCategoryLabel(activeCategory)}</Text>
        </View>

        {/* VIP BENEFIT MESSAGE */}
        {vipTier >= 3 && (
          <Text style={styles.vipNotice}>
            ⭐ VIP Tier {vipTier}: All categories unlocked!
          </Text>
        )}

        <Text style={styles.modeSelectLabel}>Choose a Mode</Text>

        <ModeButton
          title="Classic"
          subtitle="Balanced challenge"
          mode="classic"
        />
        <ModeButton
          title="Speed"
          subtitle="Fast-paced runs"
          mode="speed"
        />
        <ModeButton
          title="60 Seconds"
          subtitle="Short timer rush"
          mode="timed60"
        />
        <ModeButton
          title="90 Seconds"
          subtitle="Long timer endurance"
          mode="timed90"
        />
        <ModeButton
          title="Sudden Death"
          subtitle="One mistake ends the run"
          mode="sudden"
        />

        <TouchableOpacity
       onPress={() => router.replace("./categorySelect")}

          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Change Category</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// -----------------------------------------------------------
// 🎨  A+++++ VISUALS
// -----------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  container: {
    paddingTop: 60,
    paddingHorizontal: 18,
    paddingBottom: 70,
  },

  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#F5E6C6",
    textAlign: "center",
    marginBottom: 20,
  },

  categoryBadge: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1.4,
    borderColor: "#D8B24A",
    alignSelf: "center",
    marginBottom: 28,
  },

  categoryLabel: {
    textAlign: "center",
    fontSize: 12,
    color: "#D8B24A",
  },

  categoryName: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF2C7",
    marginTop: 4,
  },

  vipNotice: {
    textAlign: "center",
    color: "#FFD700",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: "600",
  },

  modeSelectLabel: {
    color: "#F5E6C6",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },

  modeWrapper: {
    marginBottom: 14,
  },

  modeBtn: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1.6,
    borderColor: "#CFAE64",
    alignItems: "center",
  },

  modeTitle: {
    color: "#FFF0D0",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  modeSubtitle: {
    color: "#D8C7A0",
    fontSize: 13,
  },

  backBtn: {
    marginTop: 26,
    alignSelf: "center",
  },

  backText: {
    color: "#F5E6C6",
    fontSize: 15,
    opacity: 0.8,
  },
});


