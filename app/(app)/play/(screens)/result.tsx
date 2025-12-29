import React, { useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/theme";
import { useRouter } from "expo-router";
import { finishRankedGame } from "@/arena/ranked/rankedEngine";
import { useRankedArenaStore } from "@/arena/ranked/useRankedArenaStore";
import { useSurvivalArenaStore } from "@/arena/survival/useSurvivalArenaStore";

import { useQuickGameStore } from "@/store/useQuickGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function ResultsScreen() {
  const router = useRouter();

  // ---- GAME DATA (READ ONLY) ----
  const answerHistory = useQuickGameStore((s) => s.answerHistory);
  const score = useQuickGameStore((s) => s.score);
  const mode = useQuickGameStore((s) => s.mode);
  const category = useQuickGameStore((s) => s.category);
  const resetGame = useQuickGameStore((s) => s.resetGame);
const clearOfflineQueue = usePlayerStore((s) => s.clearOfflineQueue);

  // ---- SUMMARY (STABLE) ----
  const summary = useMemo(() => {
    const correct = answerHistory.filter((x) => x.correct).length;
    const total = answerHistory.length;


    return {
      total,
      correct,
      wrong: total - correct,
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    };
  }, [answerHistory]);

  // ---- REWARDS (FROM OFFLINE QUEUE) ----
  const lastQueue = usePlayerStore((s) => s.offlineQueue);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedGems, setEarnedGems] = useState(0);

 useEffect(() => {
  let xp = 0,
    coins = 0,
    gems = 0;

  lastQueue.forEach((x) => {
    xp += x.xp;
    coins += x.coins;
    gems += x.gems;
  });

  setEarnedXP(xp);
  setEarnedCoins(coins);
  setEarnedGems(gems);

  if (lastQueue.length) {
    clearOfflineQueue();
  }
}, [lastQueue]);


 // ---- CLEAN EXIT: RESOLVE RANKED + RESET ----
useEffect(() => {
  return () => {
  const rankedMatch =
  useRankedArenaStore.getState().currentMatch;

const survivalRun =
  useSurvivalArenaStore.getState().currentRun;

if (rankedMatch) {
  finishRankedGame(
    score,
    rankedMatch.questions.length - score
  );
}

if (survivalRun) {
  useSurvivalArenaStore
    .getState()
    .endRun();
}

resetGame();

  };
}, []);


  // ---- NAVIGATION ----
  const restart = () => {
    router.replace("./categorySelect");
  };

  const goHome = () => {
    router.replace("/hub");
  };

  // ---- UI ----
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>

      <Text style={styles.score}>{score}</Text>

      <Text style={styles.meta}>
        {mode} • {category}
      </Text>

      <View style={styles.card}>
        <Text style={styles.stat}>
          Correct: {summary.correct} / {summary.total}
        </Text>
        <Text style={styles.stat}>Accuracy: {summary.accuracy}%</Text>
      </View>

      <Text style={styles.rewards}>
        +{earnedXP} XP   +{earnedCoins} Coins   +{earnedGems} Gems
      </Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={restart}>
        <Text style={styles.primaryText}>Play Again</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
        <Text style={styles.secondaryText}>Back to Hub</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#FFD700",
    marginBottom: 8,
  },

  score: {
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    color: "#FFF",
    marginBottom: 4,
  },

  meta: {
    textAlign: "center",
    color: "#AAA",
    fontSize: 13,
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
  },

  stat: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },

  rewards: {
    color: "#FFD700",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 22,
  },

  primaryBtn: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  primaryText: {
    color: "#000",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryBtn: {
    borderWidth: 2,
    borderColor: "#FFD700",
    paddingVertical: 11,
    borderRadius: 12,
  },

  secondaryText: {
    color: "#FFD700",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
});
