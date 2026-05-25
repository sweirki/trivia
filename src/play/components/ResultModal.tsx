import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { useTheme } from "@/theme";

import { useQuickGameStore } from "@/store/useQuickGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";

import ConfettiView from "./ConfettiView";
import XPProgressBar from "./XPProgressBar";
import { feedback, playRewardFeedback } from "@/feedback";

export default function ResultModal({ visible, onNext }) {
  const theme = useTheme();

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
        <View style={[styles.card, { backgroundColor: theme.colors.backgroundSoft }]}>
          
          {showConfetti && <ConfettiView />}

          <Text style={[styles.title, { color: theme.colors.text }]}>Results</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Level {level}
          </Text>

          <View style={styles.statsBox}>
            <Text style={[styles.stat, { color: theme.colors.text }]}>Correct: {correct}</Text>
            <Text style={[styles.stat, { color: theme.colors.text }]}>Wrong: {wrong}</Text>
            <Text style={[styles.stat, { color: theme.colors.text }]}>Accuracy: {accuracy}%</Text>
            <Text style={[styles.stat, { color: theme.colors.text }]}>Total: {total}</Text>
          </View>

          <View style={styles.rewardsBox}>
            <Text style={[styles.reward, { color: theme.colors.text }]}>+{earnedXP} XP</Text>
            <Text style={[styles.reward, { color: theme.colors.text }]}>+{earnedCoins} Coins</Text>
            <Text style={[styles.reward, { color: theme.colors.text }]}>+{earnedGems} Gems</Text>
          </View>

          <View style={{ width: "100%", marginVertical: 14 }}>
            <XPProgressBar />
          </View>

          {justLeveledUp && (
            <Text style={[styles.levelUpText, { color: theme.colors.gold }]}>
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
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    position: "relative",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  statsBox: {
    width: "100%",
    marginBottom: 12,
  },
  stat: {
    fontSize: 16,
    marginVertical: 2,
  },
  rewardsBox: {
    width: "100%",
    marginBottom: 18,
  },
  reward: {
    fontSize: 17,
    fontWeight: "700",
    marginVertical: 1,
  },
  levelUpText: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 15,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
});






