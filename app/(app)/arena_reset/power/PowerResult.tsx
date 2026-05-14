import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";

import ArenaRewardCeremony from "@/arena/components/ArenaRewardCeremony";
import { usePowerUpStore } from "@/arena/store/usePowerUpStore";
import { useArenaRewardsEngine } from "@/arena/store/useArenaRewardsEngine";
import { usePowerArenaMatchStore } from "@/arena/power/store/usePowerArenaMatchStore";

type UsedPowerUps = Record<string, number>;

function getPowerTier(score: number, powerUpsUsed: number) {
  if (score >= 25 && powerUpsUsed <= 2) {
    return {
      label: "TACTICAL MASTERCLASS",
      headline: "Clean power control",
      subtext: "High score, low waste. Elite arena discipline.",
      identity: "PERFECT",
    };
  }

  if (score >= 18) {
    return {
      label: "POWER SURGE",
      headline: "Chaos controlled",
      subtext: "Strong score. Better timing can turn this into a trophy run.",
      identity: "CLUTCH",
    };
  }

  if (powerUpsUsed >= 4) {
    return {
      label: "AGGRESSIVE RUN",
      headline: "Arsenal active",
      subtext: "You went all-in. Save one tool for the finish next time.",
      identity: "AGGRESSIVE",
    };
  }

  return {
    label: "RUN COMPLETE",
    headline: "Power run recorded",
    subtext: "Build cleaner combos and preserve tools for higher prestige.",
    identity: "CONTROL",
  };
}

function getUsedPowerCount(value: unknown) {
  if (!value || typeof value !== "object") return 0;

  return Object.values(value as UsedPowerUps).reduce(
    (sum, item) => sum + Number(item || 0),
    0
  );
}

export default function PowerResult() {
  const { score, resetMatch } = usePowerArenaMatchStore();
  const { usedThisMatch } = usePowerUpStore() as { usedThisMatch?: unknown };
  const rewardPower = useArenaRewardsEngine((state) => state.rewardPower);
  const previewPower = useArenaRewardsEngine((state) => state.previewPower);

  const powerUpsUsed = useMemo(
    () => getUsedPowerCount(usedThisMatch),
    [usedThisMatch]
  );

  const tier = useMemo(
    () => getPowerTier(score, powerUpsUsed),
    [score, powerUpsUsed]
  );

  const bonusXP = Math.floor(score * 1.5);
  const rewardPreview = useMemo(() => previewPower({ score, powerUpsUsed }), [previewPower, powerUpsUsed, score]);
  const recordLabel = score >= 20 ? "🏆 NEW POWER RECORD" : null;

  const xpAnim = useRef(new Animated.Value(0)).current;
  const [xpDisplay, setXpDisplay] = useState(0);
  const [rewardApplied, setRewardApplied] = useState({ coins: 0, arenaTokens: 0 });
  const rewardedRef = useRef(false);

  useEffect(() => {
    const subscription = xpAnim.addListener(({ value }) => {
      setXpDisplay(Math.floor(value));
    });

    Animated.timing(xpAnim, {
      toValue: bonusXP,
      duration: 700,
      useNativeDriver: false,
    }).start();

    return () => xpAnim.removeListener(subscription);
  }, [bonusXP, xpAnim]);

  const awardOnce = () => {
    if (rewardedRef.current) return;

    rewardedRef.current = true;
    const reward = rewardPower({ score, powerUpsUsed });
    setRewardApplied(reward);
  };



  useEffect(() => {
    awardOnce();
  }, []);

  const handleExit = () => {
    awardOnce();
    resetMatch();
    router.replace("/(app)/arena_reset");
  };

  const handleReplay = () => {
    awardOnce();
    resetMatch();
    router.replace("/(app)/arena_reset/power");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ArenaRewardCeremony
        modeLabel="POWER-UP RESULT"
        badgeLabel={tier.label}
        title={tier.headline}
        subtitle={tier.subtext}
        accentColor="#4FC3F7"
        gradientColors={["#102A3D", "#101018"]}
        recordLabel={recordLabel}
        stats={[
          { label: "Score", value: score, accent: "#FFFFFF" },
          { label: "Coins Won", value: `+${rewardApplied.coins || rewardPreview.coins}`, accent: "#F7C948" },
          { label: "Tokens", value: `+${rewardApplied.arenaTokens || rewardPreview.arenaTokens}`, accent: "#4FC3F7" },
          { label: "Style", value: tier.identity, accent: "#4FC3F7" },
        ]}
        reportTitle="Tactical Report"
        reportText={`You used ${powerUpsUsed} power-up${
          powerUpsUsed === 1 ? "" : "s"
        }. Score, timing, and resource control now drive your Power-Up prestige.`}
        primaryLabel="Chase Higher Prestige"
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
