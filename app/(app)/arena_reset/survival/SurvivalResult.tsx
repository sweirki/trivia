import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { useSurvivalHistoryStore } from "@/arena/store/useSurvivalHistoryStore";
import { useArenaRewardsEngine } from "@/arena/store/useArenaRewardsEngine";

export default function SurvivalResult() {
  const { survivalScore, resetArena } = useArenaStore();

  const rounds = survivalScore ?? 0;
const addRun = useSurvivalHistoryStore((s) => s.addRun);
const rewardSurvival = useArenaRewardsEngine(
  (s) => s.rewardSurvival
);

  const handleExit = () => {
    addRun(rounds);
    rewardSurvival({ rounds });
    resetArena();
    router.replace("/(app)/arena");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Over</Text>

      <Text style={styles.scoreLabel}>You survived</Text>
      <Text style={styles.score}>{rounds}</Text>
      <Text style={styles.rounds}>rounds</Text>

      <TouchableOpacity style={styles.btn} onPress={handleExit}>
        <Text style={styles.btnText}>Return to Arena</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------
// STYLES
// ---------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  title: {
    color: "#E53935",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 20,
  },

  scoreLabel: {
    color: "#aaa",
    fontSize: 18,
  },

  score: {
    color: "#FFD54F",
    fontSize: 64,
    fontWeight: "900",
    marginVertical: 10,
  },

  rounds: {
    color: "#aaa",
    fontSize: 18,
    marginBottom: 40,
  },

  btn: {
    backgroundColor: "#E53935",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 14,
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
