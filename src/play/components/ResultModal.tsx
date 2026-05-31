import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { useQuickGameStore } from "@/store/useQuickGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";

import ConfettiView from "./ConfettiView";
import XPProgressBar from "./XPProgressBar";
import { feedback, playRewardFeedback } from "@/feedback";

export default function ResultModal({ visible, onNext }) {
  const getSummary = useQuickGameStore((s) => s.getSummary);
  const { correct, wrong, accuracy, total } = getSummary();

  const level = usePlayerStore((s) => s.level);
  const justLeveledUp = usePlayerStore((s) => s.justLeveledUp);
  const clearLevelUpFlag = usePlayerStore((s) => s.clearLevelUpFlag);

  const [showConfetti, setShowConfetti] = useState(false);

  // NEW — show earned rewards (XP / coins / gems) from last match
  const lastQueue = usePlayerStore((s) => s.offlineQueue);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedGems, setEarnedGems] = useState(0);

  useEffect(() => {
    let xp = 0, coins = 0, gems = 0;
    lastQueue.forEach((x) => {
      xp += x.xp;
      coins += x.coins;
      gems += x.gems;
    });
    setEarnedXP(xp);
    setEarnedCoins(coins);
    setEarnedGems(gems);
  }, [lastQueue]);

  useEffect(() => {
    if (visible && justLeveledUp) {
      setShowConfetti(true);
      setTimeout(() => clearLevelUpFlag(), 600);
    } else {
      setShowConfetti(false);
    }
  }, [visible, justLeveledUp]);


  useEffect(() => {
    if (!visible) return;

    playRewardFeedback({
      xp: earnedXP,
      coins: earnedCoins,
      gems: earnedGems,
      levelUp: justLeveledUp,
    });
  }, [visible, earnedXP, earnedCoins, earnedGems, justLeveledUp]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {showConfetti && <ConfettiView />}

          <Text style={styles.title}>Results</Text>
          <Text style={styles.subtitle}>
            Level {level}
          </Text>

          <View style={styles.statsBox}>
            <Text style={styles.stat}>Correct: {correct}</Text>
            <Text style={styles.stat}>Wrong: {wrong}</Text>
            <Text style={styles.stat}>Accuracy: {accuracy}%</Text>
            <Text style={styles.stat}>Total: {total}</Text>
          </View>

          <View style={styles.rewardsBox}>
            <Text style={styles.reward}>+{earnedXP} XP</Text>
            <Text style={styles.reward}>+{earnedCoins} Coins</Text>
            <Text style={styles.reward}>+{earnedGems} Gems</Text>
          </View>

          <View style={{ width: "100%", marginVertical: 14 }}>
            <XPProgressBar />
          </View>

          {justLeveledUp && (
            <Text style={styles.levelUpText}>
              LEVEL UP! 🎉
            </Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              feedback.tap();
              useQuickGameStore.getState().resetGame();
              onNext && onNext();
            }}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.84)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
    position: "relative",
    backgroundColor: "#101827",
    borderWidth: 1.5,
    borderColor: "rgba(159,231,255,0.28)",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: {
    color: "#F4FAFF",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "#9FE7FF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 18,
    textTransform: "uppercase",
  },
  statsBox: {
    width: "100%",
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: "rgba(6,14,29,0.72)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.14)",
    padding: 14,
  },
  stat: {
    color: "#D8E7FF",
    fontSize: 14,
    fontWeight: "800",
    marginVertical: 2,
  },
  rewardsBox: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: "rgba(246,196,83,0.08)",
    borderWidth: 1,
    borderColor: "rgba(246,196,83,0.24)",
    padding: 14,
  },
  reward: {
    color: "#F6C453",
    fontSize: 15,
    fontWeight: "900",
    marginVertical: 1,
  },
  levelUpText: {
    color: "#F6C453",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 10,
    letterSpacing: 0.6,
  },
  button: {
    backgroundColor: "#00D4FF",
    paddingVertical: 13,
    paddingHorizontal: 38,
    borderRadius: 16,
    marginTop: 16,
    minWidth: 160,
    alignItems: "center",
  },
  buttonText: {
    color: "#07111F",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
