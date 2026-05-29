import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
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

const SURVIVAL_RESULT_ART = require("../../../../assets/images/arena/survival/survival_result_hero.webp");

function getSurvivalTier(rounds: number) {
  if (rounds >= 40) {
    return {
      label: "LEGEND RUN",
      headline: "Arena legend confirmed",
      subtext: "That run belongs on the seasonal board.",
      identity: "LEGEND",
    };
  }

  if (rounds >= 25) {
    return {
      label: "ELITE RUN",
      headline: "You survived the pressure",
      subtext: "Most players break before this point.",
      identity: "ELITE",
    };
  }

  if (rounds >= 12) {
    return {
      label: "SOLID RUN",
      headline: "Pressure handled",
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
  const nextMilestone = [10, 20, 30, 40].find((milestone) => rounds < milestone);
  const milestoneHint = runReport.milestonesUnlocked.length
    ? `Milestone unlocked: ${runReport.milestonesUnlocked.join(" / ")} rounds.`
    : nextMilestone
      ? `Next milestone: survive ${nextMilestone} rounds.`
      : "All core survival milestones reached.";

  const awardOnce = () => {
    if (rewardedRef.current) return;
    rewardedRef.current = true;
    const report = addRun(rounds);
    setRunReport({
      ...report,
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

  const handleReplay = () => {
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

      <TouchableOpacity style={styles.primaryButton} onPress={handleReplay} activeOpacity={0.9}>
        <LinearGradient colors={["#FF7043", "#B93B35"]} style={styles.primaryFill}>
          <Text style={styles.primaryText}>Run It Back</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleExit} activeOpacity={0.9}>
        <Text style={styles.secondaryText}>Return to Arena</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061426",
  },
  content: {
    paddingTop: 36,
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


