// app/(app)/play/(screens)/quick.tsx — Box-style Quick Play

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import type { QuickMode } from "@/store/useQuickGameStore";
import { useQuickGameStore } from "@/store/useQuickGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { CATEGORIES } from "@/data/categories";

const MODES: {
  key: QuickMode;
  title: string;
  subtitle: string;
}[] = [
  { key: "classic", title: "Classic", subtitle: "Balanced challenge" },
  { key: "speed", title: "Speed", subtitle: "Fast-paced runs" },
  { key: "timed60", title: "60 Seconds", subtitle: "Short timer rush" },
  { key: "timed90", title: "90 Seconds", subtitle: "Long timer endurance" },
  { key: "sudden", title: "Sudden Death", subtitle: "One mistake ends it" },
];

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
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // --------------------------------------------------
  // CATEGORY RESOLUTION (unchanged logic)
  // --------------------------------------------------
  const resolveCategory = () => {
    let id = paramCategory as string | undefined;

    if (!id) {
      const free = CATEGORIES.filter((c) => !c.premium);
      id = free[Math.floor(Math.random() * free.length)].id;
    }

    const meta = CATEGORIES.find((c) => c.id === id);
    if (meta?.premium && !ownedPacks.includes(id) && vipTier < 3) {
      const free = CATEGORIES.filter((c) => !c.premium);
      id = free[Math.floor(Math.random() * free.length)].id;
    }

    return id;
  };

  const activeCategory = resolveCategory();

  useEffect(() => {
    setCategory(activeCategory);
  }, [activeCategory]);

  const start = (mode: QuickMode) => {
    resetGame();
    initGame(mode, activeCategory);
    router.replace("/play/game");
  };

  const getCategoryLabel = (id: string) => {
    const c = CATEGORIES.find((x) => x.id === id);
    return c?.label ?? id;
  };

  // --------------------------------------------------
  // MODE CARD
  // --------------------------------------------------
  const ModeCard = ({ title, subtitle, mode }: any) => {
    const scale = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPressIn={() =>
            Animated.spring(scale, {
              toValue: 0.96,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.spring(scale, {
              toValue: 1,
              friction: 6,
              useNativeDriver: true,
            }).start(() => start(mode))
          }
          style={styles.card}
        >
         <Text style={styles.cardTitle} numberOfLines={1}>
  {title}
</Text>

      <Text style={styles.cardSub} numberOfLines={2}>
  {subtitle}
</Text>

        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <Text style={styles.heading}>Quick Play</Text>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryLabel}>Category</Text>
          <Text style={styles.categoryName}>
            {getCategoryLabel(activeCategory)}
          </Text>
        </View>

        {vipTier >= 3 && (
          <Text style={styles.vipNotice}>
            ⭐ VIP Tier {vipTier}: All categories unlocked
          </Text>
        )}

        <View style={styles.grid}>
          {MODES.map((m) => (
            <ModeCard
              key={m.key}
              title={m.title}
              subtitle={m.subtitle}
              mode={m.key}
            />
          ))}
        </View>

        <Pressable
          onPress={() => router.replace("./categorySelect")}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Change Category</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// --------------------------------------------------
// STYLES — aligned with CategorySelect
// --------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  container: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFD166",
    textAlign: "center",
    marginBottom: 18,
  },

  categoryBadge: {
    alignSelf: "center",
    backgroundColor: "#121A2F",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(234,179,8,0.4)",
    marginBottom: 22,
  },

  categoryLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#EAB308",
  },

  categoryName: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "700",
    color: "#E5E7EB",
    textAlign: "center",
  },

  vipNotice: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#FFD166",
    marginBottom: 18,
  },

  grid: {
    
    
    gap: 14,
    
  },

  card: {
    width: "100%",
    minHeight: 96,
  paddingVertical: 14,
  paddingHorizontal: 12,
    backgroundColor: "#121A2F",
    
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(234,179,8,0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E5E7EB",
    marginBottom: 6,
    textAlign: "center",
  },

  cardSub: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },

  backBtn: {
    marginTop: 26,
    alignSelf: "center",
  },

  backText: {
    fontSize: 14,
    color: "#E5E7EB",
    opacity: 0.8,
  },
});

