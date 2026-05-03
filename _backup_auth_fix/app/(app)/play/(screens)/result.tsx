import React, { useEffect, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/theme";
import { useRouter } from "expo-router";
import { usePlayerStore } from "@/store/usePlayerStore";

import { finishRankedGame } from "@/arena/ranked/rankedEngine";
import { useRankedArenaStore } from "@/arena/ranked/useRankedArenaStore";
import { useSurvivalArenaStore } from "@/arena/survival/useSurvivalArenaStore";
import { useQuickGameStore } from "@/store/useQuickGameStore";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export default function ResultsScreen() {
  const daily = usePlayerStore((s) => s.daily);

  const router = useRouter();

  // -------------------------
  // GAME DATA (READ ONLY)
  // -------------------------
  const {
  answerHistory,
  score,
  mode,
  category,
  resetGame,
  earnedXP,
  earnedCoins,
  earnedGems,
  dailyResult,
} = useQuickGameStore();


  // -------------------------
  // SUMMARY
  // -------------------------
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

  // -------------------------
  // ANIMATIONS
  // -------------------------
  const scoreScale = useSharedValue(0.85);

  useEffect(() => {
    scoreScale.value = withSpring(1, {
      damping: 14,
      stiffness: 160,
    });
  }, []);

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  // -------------------------
  // CLEANUP
  // -------------------------
  const cleanupAndReset = () => {
    const rankedMatch = useRankedArenaStore.getState().currentMatch;
    const survivalRun = useSurvivalArenaStore.getState().currentRun;

    if (rankedMatch) {
      finishRankedGame(score, rankedMatch.questions.length - score);
    }

    if (survivalRun) {
      useSurvivalArenaStore.getState().endRun();
    }
// Daily system (Phase C2) not implemented yet


    resetGame();
  };

  // -------------------------
  // NAVIGATION
  // -------------------------
  const playAgain = () => {
    cleanupAndReset();
    router.replace("./categorySelect");
  };

  const goHome = () => {
    cleanupAndReset();
    router.replace("/hub");
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>

      <Animated.Text style={[styles.score, scoreStyle]}>
        {score}
      </Animated.Text>
{mode === "daily" && dailyResult && (
  <View style={styles.dailyBlock}>

    <Text style={styles.dailyTitle}>Daily Complete</Text>

    <Text style={styles.dailyOutcome}>
      {dailyResult.perfect
        ? "Perfect Focus"
        : dailyResult.passed
        ? "Well Done"
        : "Needs Focus"}
    </Text>

    <Text style={styles.dailyAccuracy}>
      Accuracy: {Math.round(dailyResult.accuracy * 100)}%
    </Text>
    <Text style={styles.dailyStreak}>
  🔥 Streak: {daily.streak} days
</Text>



  </View>
)}

   {mode !== "daily" && summary.accuracy >= 95 && (
  <Text style={styles.legend}>🔥 Perfect Focus</Text>
)}

{mode !== "daily" &&
  summary.accuracy >= 80 &&
  summary.accuracy < 95 && (
    <Text style={styles.legend}>🎉 Great Run</Text>
)}


      <Text style={styles.meta}>
        {mode} • {category}
      </Text>

      <View style={styles.card}>
        <Text style={styles.stat}>
          Correct: {summary.correct} / {summary.total}
        </Text>
        <Text style={styles.stat}>
          Accuracy: {summary.accuracy}%
        </Text>
      </View>

      {earnedXP > 0 && (
        <Text style={styles.rewardPrimary}>+{earnedXP} XP</Text>
      )}

      {(earnedCoins > 0 || earnedGems > 0) && (
        <View style={styles.rewardRow}>
          {earnedCoins > 0 && (
            <Text style={styles.rewardSecondary}>
              +{earnedCoins} Coins
            </Text>
          )}
          {earnedGems > 0 && (
            <Text style={styles.rewardSecondary}>
              +{earnedGems} Gems
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={playAgain}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryText}>Play Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={goHome}
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryText}>Back to Hub</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1424",
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#F5C451",
    marginBottom: 6,
  },

dailyStreak: {
  marginTop: 6,
  fontSize: 13,
  fontWeight: "700",
  textAlign: "center",
  color: "#F5C451",
},


  score: {
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 6,
  },

  dailyBlock: {
  marginBottom: 18,
},

dailyTitle: {
  fontSize: 18,
  fontWeight: "800",
  textAlign: "center",
  color: "#F5C451",
  marginBottom: 4,
},

dailyOutcome: {
  fontSize: 15,
  fontWeight: "700",
  textAlign: "center",
  color: "#FFFFFF",
  marginBottom: 2,
},

dailyAccuracy: {
  fontSize: 12,
  textAlign: "center",
  color: "#9AA3B2",
},


  legend: {
    color: "#F5C451",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },

  meta: {
    textAlign: "center",
    color: "#9AA3B2",
    fontSize: 13,
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#1A2238",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2E3A5C",
  },

  stat: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "600",
  },

  rewardPrimary: {
    color: "#F5C451",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },

  rewardRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 18,
  },

  rewardSecondary: {
    color: "#9AA3B2",
    fontSize: 14,
    fontWeight: "700",
  },

  primaryBtn: {
    backgroundColor: "#F5C451",
    paddingVertical: 11,
    borderRadius: 12,
    marginBottom: 10,
  },

  primaryText: {
    color: "#1A1A1A",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryBtn: {
    borderWidth: 2,
    borderColor: "#F5C451",
    paddingVertical: 10,
    borderRadius: 12,
  },

  secondaryText: {
    color: "#F5C451",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
});
