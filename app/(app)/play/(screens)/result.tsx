
import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/theme";
import { useRouter } from "expo-router";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useEntitlementStore } from "@/store/entitlementStore";
import { getPostGameSmartOffer } from "@/offers/smartOffers";

import { finishRankedGame } from "@/arena/ranked/rankedEngine";
import { useRankedArenaStore } from "@/arena/ranked/useRankedArenaStore";
import { useSurvivalArenaStore } from "@/arena/survival/useSurvivalArenaStore";
import { useQuickGameStore } from "@/store/useQuickGameStore";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const BG = require("../../../../assets/images/play/game/game_bg.webp");
const EMBLEM = require("../../../../assets/images/play/results/result_emblem.webp");

export default function ResultsScreen() {
  const daily = usePlayerStore((s) => s.daily);
  const tickets = usePlayerStore((s) => s.tickets);
  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);
  const level = usePlayerStore((s) => s.level);
  const retentionSummary = usePlayerStore((s) => s.retention.lastRetentionSummary);
  const vipExpiresAt = useEntitlementStore((s) => s.vipExpiresAt);
  const isVIPActive = Date.now() < (vipExpiresAt || 0);
  const [offerVisible, setOfferVisible] = useState(true);

  const router = useRouter();

  const {
    answerHistory,
    score,
    mode,
    category,
    resetGame,
    earnedXP,
    earnedCoins,
    earnedGems,
    earnedTickets,
    dailyResult,
  } = useQuickGameStore();

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

  const postGameOffer = useMemo(
    () =>
      getPostGameSmartOffer({
        coins,
        gems,
        tickets,
        level,
        dailyStreak: daily?.streak || 0,
        isVIPActive,
        accuracy: summary.accuracy,
        earnedXP,
        earnedCoins,
      }),
    [
      coins,
      gems,
      tickets,
      level,
      daily?.streak,
      isVIPActive,
      summary.accuracy,
      earnedXP,
      earnedCoins,
    ]
  );

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

  const cleanupAndReset = () => {
    const rankedMatch = useRankedArenaStore.getState().currentMatch;
    const survivalRun = useSurvivalArenaStore.getState().currentRun;

    if (rankedMatch) {
      finishRankedGame(score, rankedMatch.questions.length - score);
    }

    if (survivalRun) {
      useSurvivalArenaStore.getState().endRun();
    }

    resetGame();
  };

  const playAgain = () => {
    cleanupAndReset();
    router.replace("./categorySelect");
  };

  const goHome = () => {
    cleanupAndReset();
    router.replace("/hub");
  };

  const openOffer = () => {
    if (!postGameOffer) return;
    setOfferVisible(false);
    cleanupAndReset();
    router.replace({ pathname: "/store", params: { tab: postGameOffer.storeTab } } as any);
  };

  const runLabel =
    String(mode ?? "classic").charAt(0).toUpperCase() +
    String(mode ?? "classic").slice(1);

  return (
    <ImageBackground
      testID="screen-result"
      source={BG}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {postGameOffer ? (
        <Modal
          visible={offerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setOfferVisible(false)}
        >
          <View style={styles.offerOverlay}>
            <View style={styles.offerModal}>
              <Text style={styles.offerBadge}>{postGameOffer.badge}</Text>
              <Text style={styles.offerTitle}>{postGameOffer.title}</Text>
              <Text style={styles.offerText}>{postGameOffer.message}</Text>

              <TouchableOpacity
                style={styles.offerPrimaryBtn}
                activeOpacity={0.88}
                onPress={openOffer}
              >
                <Text style={styles.offerPrimaryText}>
                  {postGameOffer.primaryLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.offerSecondaryBtn}
                activeOpacity={0.88}
                onPress={() => setOfferVisible(false)}
              >
                <Text style={styles.offerSecondaryText}>
                  Stay on Results
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.headerBlock}>
            <ImageBackground source={EMBLEM} style={styles.emblem} resizeMode="contain" />

            <Text style={styles.title}>RESULTS</Text>

            <Animated.Text style={[styles.score, scoreStyle]}>
              {score}
            </Animated.Text>

            <Text style={styles.meta}>
              {runLabel} • {String(category ?? "trivia")}
            </Text>

            {mode === "daily" && dailyResult ? (
              <View style={styles.dailyStrip}>
                <Text style={styles.dailyTitle}>Daily Complete</Text>
                <Text style={styles.dailyText}>
                  {dailyResult.perfect
                    ? "Perfect Focus"
                    : dailyResult.passed
                    ? "Well Done"
                    : "Needs Focus"}{" "}
                  • {Math.round(dailyResult.accuracy * 100)}% • 🔥 {daily.streak} days
                </Text>
              </View>
            ) : null}

            {mode !== "daily" && summary.accuracy >= 95 ? (
              <Text style={styles.legend}>🔥 Perfect Focus</Text>
            ) : null}

            {mode !== "daily" &&
            summary.accuracy >= 80 &&
            summary.accuracy < 95 ? (
              <Text style={styles.legend}>🎉 Great Run</Text>
            ) : null}
          </View>

          <View style={styles.resultCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Correct</Text>
              <Text style={styles.statValue}>
                {summary.correct} / {summary.total}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Wrong</Text>
              <Text style={styles.statValue}>{summary.wrong}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{summary.accuracy}%</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.rewardGrid}>
              {earnedXP > 0 ? (
                <View style={styles.rewardPill}>
                  <Text style={styles.rewardLabel}>XP</Text>
                  <Text style={styles.rewardValue}>+{earnedXP}</Text>
                </View>
              ) : null}

              {earnedCoins > 0 ? (
                <View style={styles.rewardPill}>
                  <Text style={styles.rewardLabel}>COINS</Text>
                  <Text style={styles.rewardValue}>+{earnedCoins}</Text>
                </View>
              ) : null}

              {earnedGems > 0 ? (
                <View style={styles.rewardPill}>
                  <Text style={styles.rewardLabel}>GEMS</Text>
                  <Text style={styles.rewardValue}>+{earnedGems}</Text>
                </View>
              ) : null}

              {earnedTickets > 0 ? (
                <View style={styles.rewardPill}>
                  <Text style={styles.rewardLabel}>TICKETS</Text>
                  <Text style={styles.rewardValue}>+{earnedTickets}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {retentionSummary ? (
            <View style={styles.motivationBox}>
              <Text style={styles.motivationTitle}>{retentionSummary.title}</Text>
              <Text style={styles.motivationText}>{retentionSummary.message}</Text>
            </View>
          ) : null}

          {postGameOffer ? (
            <TouchableOpacity
              style={styles.inlineOfferBox}
              activeOpacity={0.9}
              onPress={openOffer}
            >
              <Text style={styles.inlineOfferTitle}>{postGameOffer.title}</Text>
              <Text style={styles.inlineOfferText}>{postGameOffer.primaryLabel}</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              testID="result-play-again-button"
              style={styles.primaryBtn}
              onPress={playAgain}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryText}>Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="result-back-home-button"
              style={styles.secondaryBtn}
              onPress={goHome}
              activeOpacity={0.88}
            >
              <Text style={styles.secondaryText}>Back to Hub</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B18",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.52)",
  },

  safe: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    justifyContent: "center",
  },

  headerBlock: {
    alignItems: "center",
    marginBottom: 14,
  },

  emblem: {
    width: 76,
    height: 76,
    marginBottom: 4,
  },

  title: {
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    color: "#F5C451",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  score: {
    fontSize: 46,
    lineHeight: 50,
    fontWeight: "900",
    textAlign: "center",
    color: "#FFFFFF",
  },

  meta: {
    textAlign: "center",
    color: "#DCE7FF",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "capitalize",
  },

  legend: {
    color: "#F5C451",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 6,
  },

  dailyStrip: {
    marginTop: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(245,196,81,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.22)",
  },

  dailyTitle: {
    color: "#F5C451",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },

  dailyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 2,
  },

  resultCard: {
    backgroundColor: "rgba(13,20,42,0.94)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: "rgba(245,196,81,0.24)",
    shadowColor: "#F5C451",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },

  statLabel: {
    color: "#AAB8E8",
    fontSize: 14,
    fontWeight: "900",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 10,
  },

  rewardGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  rewardPill: {
    flexGrow: 1,
    minWidth: "47%",
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(18,29,58,0.92)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.16)",
  },

  rewardLabel: {
    color: "#AAB8E8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: 3,
  },

  rewardValue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  motivationBox: {
    backgroundColor: "rgba(21,45,28,0.88)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(70,255,170,0.26)",
    padding: 12,
    marginBottom: 10,
  },

  motivationTitle: {
    color: "#D8FFE1",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 3,
  },

  motivationText: {
    color: "#BDEFC8",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 17,
  },

  inlineOfferBox: {
    backgroundColor: "rgba(13,20,42,0.94)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.28)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  inlineOfferTitle: {
    color: "#F5C451",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 3,
  },

  inlineOfferText: {
    color: "#AAB8E8",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  actions: {
    gap: 10,
  },

  primaryBtn: {
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,196,81,0.96)",
    borderWidth: 1.5,
    borderColor: "rgba(255,230,150,0.75)",
    shadowColor: "#F5C451",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },

  primaryText: {
    color: "#111827",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "900",
  },

  secondaryBtn: {
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13,20,42,0.90)",
    borderWidth: 1.2,
    borderColor: "rgba(245,196,81,0.30)",
  },

  secondaryText: {
    color: "#F5C451",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
  },

  offerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.68)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },

  offerModal: {
    width: "100%",
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(8,13,30,0.98)",
    borderWidth: 1.4,
    borderColor: "rgba(245,196,81,0.38)",
    shadowColor: "#F5C451",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  offerBadge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#F5C451",
    color: "#111827",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 10,
  },

  offerTitle: {
    color: "#F5C451",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 8,
  },

  offerText: {
    color: "#DCE7FF",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginBottom: 14,
  },

  offerPrimaryBtn: {
    height: 46,
    borderRadius: 18,
    backgroundColor: "#F5C451",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,230,150,0.75)",
  },

  offerPrimaryText: {
    color: "#101010",
    fontSize: 14,
    fontWeight: "900",
  },

  offerSecondaryBtn: {
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.24)",
    backgroundColor: "rgba(13,20,42,0.92)",
  },

  offerSecondaryText: {
    color: "#F5C451",
    fontSize: 13,
    fontWeight: "900",
  },
});
