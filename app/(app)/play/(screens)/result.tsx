import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const BG = require("../../../../assets/images/play/game/game_bg.webp");
const EMBLEM = require("../../../../assets/images/play/results/result_emblem.webp");

function formatModeLabel(mode?: string | null) {
  const value = String(mode ?? "classic");
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

function formatCategoryLabel(category?: string | null) {
  return String(category ?? "trivia").replaceAll("_", " ");
}

export default function ResultsScreen() {
  const daily = usePlayerStore((s) => s.daily);
  const tickets = usePlayerStore((s) => s.tickets);
  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);
  const level = usePlayerStore((s) => s.level);
  const retentionSummary = usePlayerStore(
    (s) => s.retention.lastRetentionSummary,
  );
  const vipExpiresAt = useEntitlementStore((s) => s.vipExpiresAt);
  const isVIPActive = Date.now() < (vipExpiresAt || 0);
  const [offerVisible, setOfferVisible] = useState(false);

  const router = useRouter();

  const answerHistory = useQuickGameStore((s) => s.answerHistory);
  const score = useQuickGameStore((s) => s.score);
  const mode = useQuickGameStore((s) => s.mode);
  const category = useQuickGameStore((s) => s.category);
  const resetGame = useQuickGameStore((s) => s.resetGame);
  const earnedXP = useQuickGameStore((s) => s.earnedXP);
  const earnedCoins = useQuickGameStore((s) => s.earnedCoins);
  const earnedGems = useQuickGameStore((s) => s.earnedGems);
  const earnedTickets = useQuickGameStore((s) => s.earnedTickets);
  const dailyResult = useQuickGameStore((s) => s.dailyResult);

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

  const performance = useMemo(() => {
    if (mode === "daily" && dailyResult) {
      if (dailyResult.perfect) {
        return {
          badge: "DAILY PERFECT",
          title: "Perfect Focus",
          message: "Clean daily run. Keep the streak pressure alive.",
        };
      }

      if (dailyResult.passed) {
        return {
          badge: "DAILY COMPLETE",
          title: "Daily Cleared",
          message:
            "Good control. Come back tomorrow to keep the reward path moving.",
        };
      }

      return {
        badge: "DAILY REVIEW",
        title: "Needs Focus",
        message: "A tighter run tomorrow can recover the streak momentum.",
      };
    }

    if (summary.accuracy >= 95) {
      return {
        badge: "ELITE RUN",
        title: "Perfect Focus",
        message: "Almost no misses. This is the pace to chase again.",
      };
    }

    if (summary.accuracy >= 80) {
      return {
        badge: "STRONG RUN",
        title: "Great Run",
        message: "Sharp accuracy and solid reward pace. Run it back.",
      };
    }

    if (summary.accuracy >= 55) {
      return {
        badge: "BUILDING",
        title: "Good Warmup",
        message:
          "You stayed in the game. A cleaner next run pushes the rewards higher.",
      };
    }

    return {
      badge: "RESET",
      title: "Next Run Wins",
      message: "Shake it off and pick a category you can dominate.",
    };
  }, [dailyResult, mode, summary.accuracy]);

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
    ],
  );

  const scoreScale = useSharedValue(0.85);

  useEffect(() => {
    scoreScale.value = withSpring(1, {
      damping: 14,
      stiffness: 160,
    });
  }, [scoreScale]);

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
    router.replace({
      pathname: "/store",
      params: { tab: postGameOffer.storeTab },
    } as any);
  };

  const runLabel = formatModeLabel(mode);
  const categoryLabel = formatCategoryLabel(category);

  return (
    <ImageBackground
      testID="screen-result"
      source={BG}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      {postGameOffer ? (
        <Modal
          visible={offerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setOfferVisible(false)}
        >
          <View style={styles.offerOverlay}>
            <View style={styles.offerBackdropGlow} />
            <View style={styles.offerModal}>
              <View style={styles.offerTopGlow} />
              <View style={styles.offerHeader}>
                <View style={styles.offerEmblem}>
                  <Text style={styles.offerEmblemText}>VIP</Text>
                </View>

                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>
                    {postGameOffer.badge}
                  </Text>
                </View>

                <Text style={styles.offerTitle}>{postGameOffer.title}</Text>
                <Text style={styles.offerText}>{postGameOffer.message}</Text>
              </View>

              <View style={styles.offerValueCard}>
                <Text style={styles.offerValueLabel}>Premium run boost</Text>
                <Text style={styles.offerValueText}>
                  Turn this result into a stronger reward moment.
                </Text>
              </View>

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
                <Text style={styles.offerSecondaryText}>Stay on Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}

      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <View style={styles.emblemHalo}>
              <ImageBackground
                source={EMBLEM}
                style={styles.emblem}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>RESULTS</Text>

            <Animated.Text style={[styles.score, scoreStyle]}>
              {score}
            </Animated.Text>

            <Text style={styles.meta}>
              {runLabel} • {categoryLabel}
            </Text>

            <View style={styles.performanceStrip}>
              <Text style={styles.performanceBadge}>{performance.badge}</Text>
              <Text style={styles.performanceTitle}>{performance.title}</Text>
              <Text style={styles.performanceText}>{performance.message}</Text>
            </View>

            {mode === "daily" && dailyResult ? (
              <View style={styles.dailyStrip}>
                <Text style={styles.dailyTitle}>Daily Complete</Text>
                <Text style={styles.dailyText}>
                  {Math.round(dailyResult.accuracy * 100)}% • 🔥 {daily.streak}{" "}
                  days
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.resultCard}>
            <View style={styles.statGrid}>
              <View style={styles.statTile}>
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={styles.statValue}>
                  {summary.correct} / {summary.total}
                </Text>
              </View>

              <View style={styles.statTile}>
                <Text style={styles.statLabel}>Wrong</Text>
                <Text style={styles.statValue}>{summary.wrong}</Text>
              </View>

              <View style={styles.statTileWide}>
                <Text style={styles.statLabel}>Accuracy</Text>
                <Text style={styles.statValue}>{summary.accuracy}%</Text>
              </View>
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
              <Text style={styles.motivationTitle}>
                {retentionSummary.title}
              </Text>
              <Text style={styles.motivationText}>
                {retentionSummary.message}
              </Text>
            </View>
          ) : null}

          {postGameOffer ? (
            <TouchableOpacity
              style={styles.inlineOfferBox}
              activeOpacity={0.9}
              onPress={openOffer}
            >
              <View style={styles.inlineOfferBadge}>
                <Text style={styles.inlineOfferBadgeText}>
                  {postGameOffer.badge}
                </Text>
              </View>
              <View style={styles.inlineOfferCopy}>
                <Text style={styles.inlineOfferTitle}>
                  {postGameOffer.title}
                </Text>
                <Text style={styles.inlineOfferText}>
                  {postGameOffer.primaryLabel}
                </Text>
              </View>
              <Text style={styles.inlineOfferArrow}>›</Text>
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
        </ScrollView>
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
    backgroundColor: "rgba(0,0,0,0.54)",
  },

  topGlow: {
    position: "absolute",
    top: -90,
    left: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(68,145,255,0.16)",
  },

  bottomGlow: {
    position: "absolute",
    right: -80,
    bottom: -110,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(245,196,81,0.11)",
  },

  safe: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: "center",
  },

  headerBlock: {
    alignItems: "center",
    marginBottom: 12,
  },

  emblemHalo: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    backgroundColor: "rgba(245,196,81,0.08)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.18)",
  },

  emblem: {
    width: 76,
    height: 76,
  },

  title: {
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    color: "#F5C451",
    letterSpacing: 1.1,
    marginBottom: 3,
  },

  score: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: "900",
    textAlign: "center",
    color: "#FFFFFF",
    textShadowColor: "rgba(86,166,255,0.42)",
    textShadowRadius: 14,
  },

  meta: {
    textAlign: "center",
    color: "#DCE7FF",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "capitalize",
  },

  performanceStrip: {
    width: "100%",
    marginTop: 10,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(12,23,48,0.86)",
    borderWidth: 1,
    borderColor: "rgba(86,166,255,0.24)",
  },

  performanceBadge: {
    color: "#8FCBFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    textAlign: "center",
    marginBottom: 3,
  },

  performanceTitle: {
    color: "#F5C451",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  performanceText: {
    color: "#DCE7FF",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    textAlign: "center",
    marginTop: 3,
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
    backgroundColor: "rgba(13,20,42,0.95)",
    borderRadius: 24,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.2,
    borderColor: "rgba(245,196,81,0.24)",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },

  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  statTile: {
    flex: 1,
    minWidth: "47%",
    borderRadius: 17,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(18,29,58,0.92)",
    borderWidth: 1,
    borderColor: "rgba(86,166,255,0.20)",
  },

  statTileWide: {
    width: "100%",
    borderRadius: 17,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(245,196,81,0.10)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.20)",
  },

  statLabel: {
    color: "#AAB8E8",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginBottom: 3,
    textTransform: "uppercase",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 11,
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
    backgroundColor: "rgba(12,23,48,0.90)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(86,166,255,0.25)",
    padding: 12,
    marginBottom: 10,
  },

  motivationTitle: {
    color: "#F5C451",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 3,
  },

  motivationText: {
    color: "#DCE7FF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 17,
  },

  inlineOfferBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(13,20,42,0.94)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.28)",
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  inlineOfferBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: "rgba(245,196,81,0.95)",
  },

  inlineOfferBadgeText: {
    color: "#111827",
    fontSize: 9,
    fontWeight: "900",
  },

  inlineOfferCopy: {
    flex: 1,
    minWidth: 0,
  },

  inlineOfferTitle: {
    color: "#F5C451",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 2,
  },

  inlineOfferText: {
    color: "#AAB8E8",
    fontSize: 12,
    fontWeight: "800",
  },

  inlineOfferArrow: {
    color: "#F5C451",
    fontSize: 28,
    fontWeight: "900",
    marginTop: -2,
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
    backgroundColor: "rgba(1,4,14,0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  offerBackdropGlow: {
    position: "absolute",
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: "rgba(245,196,81,0.13)",
  },

  offerModal: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 28,
    padding: 16,
    backgroundColor: "rgba(13,20,42,0.98)",
    borderWidth: 1.4,
    borderColor: "rgba(245,196,81,0.34)",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  offerTopGlow: {
    position: "absolute",
    top: -72,
    alignSelf: "center",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(86,166,255,0.17)",
  },

  offerHeader: {
    alignItems: "center",
    paddingHorizontal: 6,
    paddingTop: 4,
  },

  offerEmblem: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
    backgroundColor: "rgba(245,196,81,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.28)",
  },

  offerEmblemText: {
    color: "#F5C451",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.8,
    textShadowColor: "rgba(245,196,81,0.35)",
    textShadowRadius: 10,
  },

  offerBadge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(245,196,81,0.96)",
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "rgba(255,230,150,0.75)",
  },

  offerBadgeText: {
    color: "#111827",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  offerTitle: {
    color: "#F5C451",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },

  offerText: {
    color: "#DCE7FF",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 13,
  },

  offerValueCard: {
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 13,
    backgroundColor: "rgba(12,23,48,0.88)",
    borderWidth: 1,
    borderColor: "rgba(86,166,255,0.24)",
  },

  offerValueLabel: {
    color: "#8FCBFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 3,
  },

  offerValueText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },

  offerPrimaryBtn: {
    height: 50,
    borderRadius: 18,
    backgroundColor: "rgba(245,196,81,0.96)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,230,150,0.75)",
    shadowColor: "#F5C451",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },

  offerPrimaryText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },

  offerSecondaryBtn: {
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    borderColor: "rgba(245,196,81,0.30)",
    backgroundColor: "rgba(13,20,42,0.90)",
  },

  offerSecondaryText: {
    color: "#F5C451",
    fontSize: 13,
    fontWeight: "900",
  },
});
