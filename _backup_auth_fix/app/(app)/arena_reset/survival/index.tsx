import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { router } from "expo-router";
import React from "react";
import { s } from "@/arena/theme/arenaSizing";

export default function SurvivalEntry() {
  const { player, setMode } = useArenaStore();

 const handleStart = () => {
  useArenaStore.getState().resetArena();
  setMode("survival");
  router.push("/(app)/arena/survival/SurvivalMatch");
};

  return (
    <View style={styles.container}>

      {/* Header */}
      <Text style={styles.title}>Survival Arena</Text>
      <Text style={styles.sub}>One mistake. Endless rounds.</Text>

      {/* Stats */}
      <View style={styles.statsBox}>
        <Text style={styles.statsTitle}>Your Best Streak</Text>
        <Text style={styles.statsValue}>{player.streak ?? 0} rounds</Text>

        <Text style={[styles.statsTitle, { marginTop: 20 }]}>Current Season High</Text>
        <Text style={styles.statsValue}>{player.streak ?? 0} rounds</Text>
      </View>

      {/* Rules */}
      <View style={styles.rulesBox}>
        <Text style={styles.rulesTitle}>Rules</Text>
        <Text style={styles.rule}>• 1 life — one mistake eliminates you</Text>
        <Text style={styles.rule}>• Rounds become harder over time</Text>
        <Text style={styles.rule}>• Score = number of rounds survived</Text>
        <Text style={styles.rule}>• Reach milestones to earn rewards</Text>
      </View>

      {/* Start Button */}
      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startText}>Begin Survival Run</Text>
      </TouchableOpacity>

    </View>
  );
}

// ------------------------
// STYLES
// ------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingHorizontal: s(20),
    paddingTop: s(60),
    alignItems: "center",
  },

  title: {
    fontSize: s(34),
    fontWeight: "800",
    color: "#E53935",
  },

  sub: {
    color: "#aaa",
    marginTop: s(4),
    fontSize: s(16),
    marginBottom: s(25),
  },

  statsBox: {
    width: "90%",
    backgroundColor: "#161620",
    padding: s(20),
    borderRadius: s(14),
    alignItems: "center",
    marginBottom: s(25),
  },

  statsTitle: {
    color: "#aaa",
    fontSize: s(16),
  },

  statsValue: {
    color: "#fff",
    fontSize: s(28),
    fontWeight: "700",
    marginTop: s(6),
  },

  rulesBox: {
    width: "90%",
    backgroundColor: "#1c1c29",
    padding: s(20),
    borderRadius: s(14),
    marginBottom: s(40),
  },

  rulesTitle: {
    color: "#fff",
    fontSize: s(20),
    marginBottom: s(12),
  },

  rule: {
    color: "#aaa",
    fontSize: s(14),
    marginBottom: s(6),
  },

  startButton: {
    width: "85%",
    backgroundColor: "#E53935",
    paddingVertical: s(18),
    borderRadius: s(14),
    alignItems: "center",
  },

  startText: {
    color: "#fff",
    fontSize: s(18),
    fontWeight: "600",
  },
});

