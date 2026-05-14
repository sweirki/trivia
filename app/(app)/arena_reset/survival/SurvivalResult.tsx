import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";

import ArenaRewardCeremony from "@/arena/components/ArenaRewardCeremony";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { useSurvivalHistoryStore } from "@/arena/store/useSurvivalHistoryStore";
import { useArenaRewardsEngine } from "@/arena/store/useArenaRewardsEngine";

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
  const addRun = useSurvivalHistoryStore((s) => s.addRun);
  const rewardSurvival = useArenaRewardsEngine((s) => s.rewardSurvival);
  const previewSurvival = useArenaRewardsEngine((s) => s.previewSurvival);
  const rewardedRef = useRef(false);
  const [rewardApplied, setRewardApplied] = useState({ coins: 0, arenaTokens: 0 });

  const rounds = player?.score ?? 0;
  const tier = useMemo(() => getSurvivalTier(rounds), [rounds]);
  const bonusXP = Math.max(0, rounds * 2);
  const rewardPreview = useMemo(() => previewSurvival({ rounds }), [previewSurvival, rounds]);
  const recordLabel = rounds >= 12 ? "🏆 SURVIVAL MILESTONE" : null;

  const awardOnce = () => {
    if (rewardedRef.current) return;
    rewardedRef.current = true;
    addRun(rounds);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ArenaRewardCeremony
        modeLabel="SURVIVAL RESULT"
        badgeLabel={tier.label}
        title={tier.headline}
        subtitle={tier.subtext}
        accentColor="#FF7043"
        gradientColors={["#31151B", "#101018"]}
        recordLabel={recordLabel}
        stats={[
          { label: "Rounds", value: rounds, accent: "#FFFFFF" },
          { label: "Coins Won", value: `+${rewardApplied.coins || rewardPreview.coins}`, accent: "#F7C948" },
          { label: "Tokens", value: `+${rewardApplied.arenaTokens || rewardPreview.arenaTokens}`, accent: "#4FC3F7" },
          { label: "Style", value: tier.identity, accent: "#FF7043" },
        ]}
        reportTitle="Arena Pressure"
        reportText="Every survival run now counts toward your long-term arena identity. Longer runs build prestige, history, and seasonal momentum."
        primaryLabel="Run It Back"
        secondaryLabel="Return to Arena"
        onPrimary={handleReplay}
        onSecondary={handleExit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B12",
  },
  content: {
    paddingTop: 82,
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
});

