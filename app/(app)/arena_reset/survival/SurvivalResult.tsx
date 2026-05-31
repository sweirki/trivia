import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { useArenaStore } from "@/arena/store/useArenaStore";
import { useSurvivalHistoryStore } from "@/arena/store/useSurvivalHistoryStore";
import { useArenaRewardsEngine } from "@/arena/store/useArenaRewardsEngine";
import { ARENA_MODE_CONFIG, formatArenaCost } from "@/arena/arenaEconomyRules";
import { useAchievementEventsStore } from "@/achievements/achievementEventsStore";

const SURVIVAL_RESULT_ART = require("../../../../assets/images/arena/survival/survival_result_hero.webp");

function getSurvivalTier(rounds: number) {
  if (rounds >= 40) {
    return {
      label: "SURVIVAL LEGEND",
      headline: "SURVIVAL LEGEND",
      subtext: "That run belongs on the seasonal board.",
      identity: "LEGEND",
    };
  }

  if (rounds >= 25) {
    return {
      label: "LAST STAND",
      headline: "LAST STAND COMPLETE",
      subtext: "Most players break before this point.",
      identity: "ELITE",
    };
  }

  if (rounds >= 12) {
    return {
      label: "IRON WILL",
      headline: "IRON WILL",
      subtext: "Good pace. Push one more streak next time.",
      identity: "SOLID",
    };
  }

  return {
    label: "RUN RECORDED",
    headline: "The arena claimed you",
    subtext: "Survival rewards patience, speed, and calm under pressure.",
    identity: "START",
  };
}

export default function SurvivalResult() {
  const { player, resetArena } = useArenaStore();
  const addRun = useSurvivalHistoryStore((state) => state.addRun);
  const bestScore = useSurvivalHistoryStore((state) => state.bestScore);
  const totalRuns = useSurvivalHistoryStore((state) => state.totalRuns);
  const unlockedMilestones = useSurvivalHistoryStore((state) => state.unlockedMilestones);
  const rewardSurvival = useArenaRewardsEngine((state) => state.rewardSurvival);
  const previewSurvival = useArenaRewardsEngine((state) => state.previewSurvival);

  const rewardedRef = useRef(false);
  const [rewardApplied, setRewardApplied] = useState({
    coins: 0,
    arenaTokens: 0,
  });
  const [confirmReplayVisible, setConfirmReplayVisible] = useState(false);
  const [runReport, setRunReport] = useState({
    previousBest: bestScore,
    bestScore,
    isPersonalBest: false,
    totalRuns,
    milestonesUnlocked: [] as number[],
  });

  const rounds = player?.score ?? 0;
  const tier = useMemo(() => getSurvivalTier(rounds), [rounds]);
  const rewardPreview = useMemo(
    () => previewSurvival({ rounds }),
    [previewSurvival, rounds],
  );
  const isProjectedBest = rounds > bestScore;
  const recordLabel = isProjectedBest
    ? "NEW PERSONAL BEST"
    : rounds >= 12
      ? "SURVIVAL MILESTONE"
      : tier.label;
  const survivalTicketCost = ARENA_MODE_CONFIG.survival.tickets;
  const survivalCostLabel = formatArenaCost("survival");
  const nextMilestone = [10, 20, 30, 40].find((milestone) => rounds < milestone);
  const milestoneHint = runReport.milestonesUnlocked.length
    ? `MILESTONE UNLOCKED: ${runReport.milestonesUnlocked.join(" / ")} ROUNDS.`
    : nextMilestone
      ? `${Math.max(0, nextMilestone - rounds)} MORE ROUNDS TO THE ${nextMilestone} ROUND MILESTONE.`
      : "All core survival milestones reached.";

  const awardOnce = () => {
    if (rewardedRef.current) return;
    rewardedRef.current = true;
    const report = addRun(rounds);
    setRunReport({
      ...report,
      milestonesUnlocked: report.milestonesUnlocked,
    });
    useAchievementEventsStore.getState().recordSurvivalResult({
      rounds,
      personalBest: report.isPersonalBest,
      milestonesUnlocked: report.milestonesUnlocked,
    });
    const reward = rewardSurvival({ rounds });
    setRewardApplied(reward);
  };

  useEffect(() => {
    awardOnce();
  }, []);

  const handleExit = () => {
    awardOnce();
    resetArena();
    router.replace("/(app)/arena_reset");
  };

  const handleReplayPress = () => {
    setConfirmReplayVisible(true);
  };

  const handleConfirmReplay = () => {
    setConfirmReplayVisible(false);
    awardOnce();
    resetArena();
    router.replace("/(app)/arena_reset/survival");
  };

  const coins = rewardApplied.coins || rewardPreview.coins;
  const tokens = rewardApplied.arenaTokens || rewardPreview.arenaTokens;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={SURVIVAL_RESULT_ART}
        resizeMode="cover"
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(2,6,16,0.12)",
            "rgba(10,11,24,0.54)",
            "rgba(2,6,16,0.94)",
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <Text style={styles.eyebrow}>SURVIVAL RESULT</Text>
        <Text style={styles.badge}>{recordLabel}</Text>
        <Text style={styles.title}>{tier.headline}</Text>
        <Text style={styles.subtitle}>{tier.subtext}</Text>
        <Text style={styles.subtitle}>{milestoneHint}</Text>
        <Text style={styles.subtitle}>
          Best: {runReport.bestScore || Math.max(bestScore, rounds)} rounds • Runs: {runReport.totalRuns || totalRuns + 1}
        </Text>
      </ImageBackground>

      {(runReport.isPersonalBest || isProjectedBest || runReport.milestonesUnlocked.length > 0) && (
        <LinearGradient colors={["rgba(255,112,67,0.22)", "rgba(9,26,48,0.96)"]} style={styles.milestonePanel}>
          <Text style={styles.milestoneEyebrow}>SURVIVAL MOMENT</Text>
          <Text style={styles.milestoneTitle}>
            {runReport.isPersonalBest || isProjectedBest ? "New Personal Best" : "Milestone Unlocked"}
          </Text>
          <Text style={styles.milestoneText}>
            {runReport.isPersonalBest || isProjectedBest
              ? `${rounds} rounds survived. This is now your run to beat.`
              : `${runReport.milestonesUnlocked.join(" / ")} round milestone secured.`}
          </Text>
        </LinearGradient>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Rounds</Text>
          <Text style={styles.statValue}>{rounds}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Coins</Text>
          <Text style={styles.statValueGold}>+{coins}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tokens</Text>
          <Text style={styles.statValueBlue}>+{tokens}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValueOrange}>{runReport.isPersonalBest || isProjectedBest ? "NEW" : runReport.bestScore || bestScore}</Text>
        </View>
      </View>

      <LinearGradient colors={["#102744", "#091A30"]} style={styles.reportCard}>
        <Text style={styles.reportTitle}>Arena Pressure</Text>
        <Text style={styles.reportText}>
          {runReport.isPersonalBest || isProjectedBest
            ? "Personal best secured. This run now anchors your Survival identity."
            : `Best run remains ${runReport.bestScore || bestScore} rounds. Push past it for a stronger Survival badge.`}
        </Text>
        <Text style={styles.reportText}>
          Milestones: {unlockedMilestones.length ? unlockedMilestones.join(" / ") : "none yet"} • Style: {tier.identity}
        </Text>
      </LinearGradient>

      <TouchableOpacity style={styles.primaryButton} onPress={handleReplayPress} activeOpacity={0.9}>
        <LinearGradient colors={["#FF7043", "#B93B35"]} style={styles.primaryFill}>
          <Text style={styles.primaryText}>Begin New Run</Text>
          <Text style={styles.primarySubtext}>Costs {survivalCostLabel}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleExit} activeOpacity={0.9}>
        <Text style={styles.secondaryText}>Return to Arena</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={confirmReplayVisible}
        animationType="fade"
        onRequestClose={() => setConfirmReplayVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <LinearGradient
              colors={["rgba(20, 43, 72, 0.98)", "rgba(6, 20, 38, 0.99)"]}
              style={styles.confirmFill}
            >
              <Text style={styles.confirmKicker}>SURVIVAL ENTRY</Text>
              <Text style={styles.confirmTitle}>Begin New Survival Run?</Text>
              <Text style={styles.confirmMessage}>
                This will consume {survivalTicketCost} ticket{survivalTicketCost === 1 ? "" : "s"}.
              </Text>
              <Text style={styles.confirmSubMessage}>
                A new run starts from round 1. Your completed run is already saved.
              </Text>

              <View style={styles.confirmActions}>
                <Pressable
                  style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                  onPress={() => setConfirmReplayVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
                  onPress={handleConfirmReplay}
                >
                  <LinearGradient colors={["#FF7043", "#B93B35"]} style={styles.confirmButtonFill}>
                    <Text style={styles.confirmButtonText}>Begin Run</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061426",
  },
  content: {
    paddingTop: 64,
    paddingHorizontal: 14,
    paddingBottom: 50,
  },

  hero: {
    minHeight: 135,
    borderRadius: 15,
    padding: 11,
    borderWidth: 1,
    borderColor: "rgba(255,112,67,0.44)",
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "#101018",
  },
  heroImage: { borderRadius: 22 },
  eyebrow: {
    color: "#FF7043",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.25,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  badge: {
    alignSelf: "flex-start",
    color: "#061426",
    backgroundColor: "#FF7043",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 11,
    paddingVertical: 6,
    fontSize: 10,
    fontWeight: "900",
    marginTop: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 11,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 9,
  },
  subtitle: {
    color: "#D8F2FF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15.5,
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowRadius: 7,
  },

  milestonePanel: {
    marginTop: 10,
    borderRadius: 17,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,112,67,0.36)",
  },
  milestoneEyebrow: {
    color: "#FF7043",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  milestoneTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  milestoneText: {
    color: "#D8F2FF",
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 9,
  },
  statCard: {
    flex: 1,
    minHeight: 68,
    backgroundColor: "#0A2138",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.22)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  statLabel: {
    color: "#9BAEC4",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 6,
  },
  statValueGold: {
    color: "#F7C948",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 6,
  },
  statValueBlue: {
    color: "#4FC3F7",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 6,
  },
  statValueOrange: {
    color: "#FF7043",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 6,
  },

  reportCard: {
    marginTop: 9,
    borderRadius: 17,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.24)",
  },
  reportTitle: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "900",
  },
  reportText: {
    color: "#BBD7FF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15.5,
    marginTop: 8,
  },

  primaryButton: {
    marginTop: 16,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#FF7043",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },
  primaryFill: {
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "900",
  },
  primarySubtext: {
    color: "#FFE4D6",
    fontSize: 10.5,
    fontWeight: "800",
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(1, 6, 20, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  confirmCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,112,67,0.58)",
    shadowColor: "#FF7043",
    shadowOpacity: 0.35,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
    backgroundColor: "#061426",
  },
  confirmFill: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
  },
  confirmKicker: {
    color: "#FF7043",
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1.6,
    textAlign: "center",
  },
  confirmTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 9,
  },
  confirmMessage: {
    color: "#FFD6C8",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
  },
  confirmSubMessage: {
    color: "#BBD7FF",
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 27, 45, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.22)",
  },
  cancelText: {
    color: "#D8F2FF",
    fontSize: 13,
    fontWeight: "900",
  },
  confirmButton: {
    flex: 1.25,
    minHeight: 46,
    borderRadius: 15,
    overflow: "hidden",
  },
  confirmButtonFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  secondaryButton: {
    marginTop: 10,
    backgroundColor: "#101B2D",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.18)",
  },
  secondaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});


