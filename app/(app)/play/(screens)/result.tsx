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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

type RewardTileProps = {
  label: string;
  value: number;
  tone?: "gold" | "blue" | "violet";
};

function RewardTile({ label, value, tone = "gold" }: RewardTileProps) {
  if (value <= 0) return null;

  return (
    <View style={[styles.rewardTile, tone === "blue" && styles.rewardTileBlue, tone === "violet" && styles.rewardTileViolet]}>
      <View pointerEvents="none" style={styles.rewardTileGlow} />
      <Text style={styles.rewardValue}>+{value}</Text>
      <Text style={styles.rewardLabel}>{label}</Text>
    </View>
  );
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
  const insets = useSafeAreaInsets();

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
      badge: "NEXT RUN",
      title: "Reset And Strike Back",
      message: "Shake it off. Pick a cleaner category and chase the reward pace.",
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
    setOfferVisible(false);
    cleanupAndReset();
    router.replace("/(app)/play/(screens)/categorySelect");
  };

  const goHome = () => {
    setOfferVisible(false);
    cleanupAndReset();
    router.replace("/(app)/hub");
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
  const hasRewards = earnedXP > 0 || earnedCoins > 0 || earnedGems > 0 || earnedTickets > 0;

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
      <View style={styles.goldAtmosphere} />

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
                  <Text style={styles.offerBadgeText}>{postGameOffer.badge}</Text>
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
          contentContainerStyle={[styles.content, { paddingBottom: 88 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View pointerEvents="none" style={styles.heroBlueGlow} />
            <View pointerEvents="none" style={styles.heroGoldGlow} />

            <View style={styles.heroTopRow}>
              <View style={styles.emblemHalo}>
                <ImageBackground source={EMBLEM} style={styles.emblem} resizeMode="contain" />
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroKicker}>RUN COMPLETE</Text>
                <Text style={styles.heroMode} numberOfLines={1}>
                  {runLabel} • {categoryLabel}
                </Text>
              </View>

              <View style={styles.accuracyPill}>
                <Text style={styles.accuracyPillValue}>{summary.accuracy}%</Text>
                <Text style={styles.accuracyPillLabel}>ACC</Text>
              </View>
            </View>

            <View style={styles.scoreStage}>
              <Text style={styles.scoreLabel}>SCORE</Text>
              <Animated.Text style={[styles.score, scoreStyle]}>{score}</Animated.Text>
              <Text style={styles.scoreSub}>
                {summary.correct} correct • {summary.wrong} wrong
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Rewards Earned</Text>
            <Text style={styles.sectionHint}>{hasRewards ? "Claimed" : "No bonus"}</Text>
          </View>

          <View style={styles.rewardPanel}>
            <View pointerEvents="none" style={styles.rewardPanelGlow} />
            {hasRewards ? (
              <View style={styles.rewardGrid}>
                <RewardTile label="XP" value={earnedXP} tone="blue" />
                <RewardTile label="COINS" value={earnedCoins} />
                <RewardTile label="GEMS" value={earnedGems} tone="violet" />
                <RewardTile label="TICKETS" value={earnedTickets} tone="gold" />
              </View>
            ) : (
              <View style={styles.emptyRewardBox}>
                <Text style={styles.emptyRewardTitle}>No Rewards This Run</Text>
                <Text style={styles.emptyRewardText}>A stronger run will unlock better payout momentum.</Text>
              </View>
            )}
          </View>

          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <View style={styles.performanceBadge}>
                <Text style={styles.performanceBadgeText}>{performance.badge}</Text>
              </View>
              <Text style={styles.performanceTitle}>{performance.title}</Text>
            </View>

            <Text style={styles.performanceText}>{performance.message}</Text>

            <View style={styles.statRow}>
              <View style={styles.statTile}>
                <Text style={styles.statValue}>{summary.correct}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statTile}>
                <Text style={styles.statValue}>{summary.wrong}</Text>
                <Text style={styles.statLabel}>Wrong</Text>
              </View>
              <View style={[styles.statTile, styles.statTileGold]}>
                <Text style={styles.statValueGold}>{summary.accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>
          </View>

          {mode === "daily" && dailyResult ? (
            <View style={styles.dailyStrip}>
              <Text style={styles.dailyTitle}>Daily Complete</Text>
              <Text style={styles.dailyText}>
                {Math.round(dailyResult.accuracy * 100)}% • 🔥 {daily.streak} days
              </Text>
            </View>
          ) : null}

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
              <View style={styles.inlineOfferBadge}>
                <Text style={styles.inlineOfferBadgeText}>{postGameOffer.badge}</Text>
              </View>
              <View style={styles.inlineOfferCopy}>
                <Text style={styles.inlineOfferTitle}>{postGameOffer.title}</Text>
                <Text style={styles.inlineOfferText}>{postGameOffer.primaryLabel}</Text>
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
              <Text style={styles.primarySub}>Choose a category and run it back</Text>
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
    backgroundColor: "#060B18",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.50)",
  },

  topGlow: {
    position: "absolute",
    top: -95,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(68,145,255,0.18)",
  },

  bottomGlow: {
    position: "absolute",
    right: -90,
    bottom: -120,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "rgba(245,196,81,0.13)",
  },

  goldAtmosphere: {
    position: "absolute",
    left: 36,
    right: 36,
    top: 120,
    height: 160,
    borderRadius: 100,
    backgroundColor: "rgba(245,196,81,0.045)",
  },

  safe: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 34,
  },

  heroCard: {
    minHeight: 246,
    borderRadius: 28,
    overflow: "hidden",
    padding: 16,
    marginBottom: 14,
    backgroundColor: "rgba(9,18,38,0.95)",
    borderWidth: 1.3,
    borderColor: "rgba(245,196,81,0.34)",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  heroBlueGlow: {
    position: "absolute",
    top: -70,
    right: -52,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(86,166,255,0.16)",
  },

  heroGoldGlow: {
    position: "absolute",
    left: -65,
    bottom: -78,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(245,196,81,0.11)",
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  emblemHalo: {
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,196,81,0.10)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.28)",
  },

  emblem: {
    width: 50,
    height: 50,
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
  },

  heroKicker: {
    color: "#F5C451",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 3,
  },

  heroMode: {
    color: "#DCE7FF",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  accuracyPill: {
    minWidth: 58,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 9,
    alignItems: "center",
    backgroundColor: "rgba(13,28,56,0.84)",
    borderWidth: 1,
    borderColor: "rgba(143,203,255,0.28)",
  },

  accuracyPillValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  accuracyPillLabel: {
    color: "#8FCBFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 1,
  },

  scoreStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },

  scoreLabel: {
    color: "#8FCBFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2.0,
    marginBottom: 2,
  },

  score: {
    color: "#FFFFFF",
    fontSize: 62,
    lineHeight: 70,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(86,166,255,0.48)",
    textShadowRadius: 18,
  },

  scoreSub: {
    color: "#DCE7FF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    color: "#F4FAFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.1,
  },

  sectionHint: {
    color: "#8FCBFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },

  rewardPanel: {
    overflow: "hidden",
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "rgba(11,22,46,0.95)",
    borderWidth: 1.2,
    borderColor: "rgba(245,196,81,0.27)",
    shadowColor: "#F5C451",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },

  rewardPanelGlow: {
    position: "absolute",
    top: -48,
    right: -42,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(245,196,81,0.12)",
  },

  rewardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  rewardTile: {
    flexGrow: 1,
    minWidth: "47%",
    minHeight: 76,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,196,81,0.13)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.30)",
  },

  rewardTileBlue: {
    backgroundColor: "rgba(86,166,255,0.13)",
    borderColor: "rgba(86,166,255,0.30)",
  },

  rewardTileViolet: {
    backgroundColor: "rgba(169,119,255,0.13)",
    borderColor: "rgba(169,119,255,0.30)",
  },

  rewardTileGlow: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.38)",
  },

  rewardValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 28,
    textShadowColor: "rgba(0,0,0,0.78)",
    textShadowRadius: 8,
  },

  rewardLabel: {
    color: "#F5C451",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginTop: 3,
  },

  emptyRewardBox: {
    minHeight: 82,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  emptyRewardTitle: {
    color: "#F5C451",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  emptyRewardText: {
    color: "#DCE7FF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 17,
  },

  performanceCard: {
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "rgba(12,23,48,0.93)",
    borderWidth: 1.2,
    borderColor: "rgba(86,166,255,0.25)",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.11,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },

  performanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 8,
  },

  performanceBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(143,203,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(143,203,255,0.24)",
  },

  performanceBadgeText: {
    color: "#8FCBFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  performanceTitle: {
    flex: 1,
    color: "#F5C451",
    fontSize: 17,
    fontWeight: "900",
  },

  performanceText: {
    color: "#DCE7FF",
    fontSize: 12.5,
    fontWeight: "750",
    lineHeight: 18,
    marginBottom: 12,
  },

  statRow: {
    flexDirection: "row",
    gap: 8,
  },

  statTile: {
    flex: 1,
    minHeight: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18,29,58,0.92)",
    borderWidth: 1,
    borderColor: "rgba(86,166,255,0.20)",
  },

  statTileGold: {
    backgroundColor: "rgba(245,196,81,0.10)",
    borderColor: "rgba(245,196,81,0.22)",
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  statValueGold: {
    color: "#F5C451",
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    color: "#AAB8E8",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginTop: 3,
    textTransform: "uppercase",
  },

  dailyStrip: {
    marginBottom: 12,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
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

  motivationBox: {
    backgroundColor: "rgba(12,23,48,0.90)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(86,166,255,0.25)",
    padding: 13,
    marginBottom: 12,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.28)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 13,
  },

  inlineOfferBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: "rgba(79,195,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  inlineOfferBadgeText: {
    color: "#04111F",
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
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
    minHeight: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79,195,255,0.98)",
    borderWidth: 1.5,
    borderColor: "rgba(143,216,255,0.86)",
    shadowColor: "#4FC3FF",
    shadowOpacity: 0.26,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 7 },
    elevation: 8,
  },

  primaryText: {
    color: "#04111F",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
  },

  primarySub: {
    color: "rgba(4,17,31,0.72)",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 2,
  },

  secondaryBtn: {
    minHeight: 48,
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
    fontSize: 13,
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
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
    textShadowColor: "rgba(245,196,81,0.35)",
    textShadowRadius: 10,
  },

  offerBadge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(79,195,255,0.96)",
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "rgba(143,216,255,0.78)",
    alignItems: "center",
    justifyContent: "center",
  },

  offerBadgeText: {
    color: "#04111F",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    textAlign: "center",
    includeFontPadding: false,
  },

  offerTitle: {
    color: "#F5C451",
    fontSize: 11.5,
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
    backgroundColor: "rgba(79,195,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "rgba(143,216,255,0.78)",
    shadowColor: "#4FC3FF",
    shadowOpacity: 0.20,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },

  offerPrimaryText: {
    color: "#04111F",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
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
