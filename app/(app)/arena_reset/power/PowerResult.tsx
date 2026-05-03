import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { router } from "expo-router";

import { usePowerUpStore } from "@/arena/store/usePowerUpStore";
import { useArenaRewardsEngine } from "@/arena/store/useArenaRewardsEngine";
import { usePowerArenaMatchStore } from "@/arena/power/store/usePowerArenaMatchStore";
export default function PowerResult() {
  const { score, resetMatch } = usePowerArenaMatchStore();
  const { usedThisMatch } = usePowerUpStore() as any;
  const rewardPower = useArenaRewardsEngine((s) => s.rewardPower);

  // ---- XP animation ----
  const bonusXP = Math.floor(score * 1.5);
  const xpAnim = useRef(new Animated.Value(0)).current;
  const [xpDisplay, setXpDisplay] = useState(0);

  useEffect(() => {
    const sub = xpAnim.addListener(({ value }) => {
      setXpDisplay(Math.floor(value));
    });

    Animated.timing(xpAnim, {
      toValue: bonusXP,
      duration: 800,
      useNativeDriver: false,
    }).start();

    return () => {
      xpAnim.removeListener(sub);
    };
  }, []);

  // ---- handlers ----
  const handleExit = () => {
    const powerUpsUsed =
      usedThisMatch && typeof usedThisMatch === "object"
        ? Object.values(usedThisMatch as Record<string, number>).reduce(
            (a, b) => a + b,
            0
          )
        : 0;

    rewardPower({ score, powerUpsUsed });

    resetMatch();
    router.replace("/(app)/arena_reset");
  };

  const handleReplay = () => {
    resetMatch();
    router.replace("/(app)/arena_reset/power");
  };

  // ---- UI ----
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Power-Up Run Complete</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Final Score</Text>
        <Text style={styles.score}>{score}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Bonus XP</Text>
        <Text style={styles.xp}>+{xpDisplay}</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleReplay}>
        <Text style={styles.primaryText}>Play Again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={handleExit}>
        <Text style={styles.secondaryText}>Return to Arena</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4FC3F7",
    marginBottom: 40,
  },

  card: {
    alignItems: "center",
    marginBottom: 28,
  },

  cardLabel: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 6,
  },

  score: {
    fontSize: 54,
    fontWeight: "800",
    color: "#fff",
  },

  xp: {
    fontSize: 40,
    fontWeight: "700",
    color: "#FFD54F",
  },

  primaryBtn: {
    backgroundColor: "#4FC3F7",
    paddingVertical: 16,
    paddingHorizontal: 56,
    borderRadius: 16,
    marginTop: 20,
  },

  primaryText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },

  secondaryBtn: {
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderRadius: 16,
    backgroundColor: "#1c1c29",
  },

  secondaryText: {
    color: "#fff",
    fontSize: 16,
  },
});

