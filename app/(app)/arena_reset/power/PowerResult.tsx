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

import { usePowerUpStore } from "@/arena/store/usePowerUpStore";
import { useArenaRewardsEngine } from "@/arena/store/useArenaRewardsEngine";
import { usePowerArenaMatchStore } from "@/arena/power/store/usePowerArenaMatchStore";
import { ARENA_MODE_CONFIG, formatArenaCost } from "@/arena/arenaEconomyRules";
import { useAchievementEventsStore } from "@/achievements/achievementEventsStore";

const POWER_RESULT_HERO = require("../../../../assets/images/arena/power/power_result_hero.webp");

type UsedPowerUps = Record<string, number>;

function getPowerEfficiency(score: number, powerUpsUsed: number) {
  const safeScore = Math.max(score, 0);
  if (powerUpsUsed === 0) return safeScore >= 10 ? 100 : Math.min(75, safeScore * 6);
  return Math.max(10, Math.min(100, Math.round((safeScore / Math.max(1, powerUpsUsed)) * 12)));
}

function getPowerTier(score: number, powerUpsUsed: number) {
  const efficiency = getPowerEfficiency(score, powerUpsUsed);

  if (score >= 10 && powerUpsUsed === 0) {
    return {
      label: "NO-POWER CONTROL",
      headline: "TACTICAL VICTORY",
      subtext: "No tools spent. Clean answers carried the match.",
      identity: "PURE",
    };
  }

  if (score >= 25 && powerUpsUsed <= 2) {
    return {
      label: "TACTICAL MASTERCLASS",
      headline: "POWER MASTERCLASS",
      subtext: "High score, low waste. Elite arena discipline.",
      identity: "PERFECT",
    };
  }

  if (score >= 18) {
    return {
      label: "CONTROLLED CHAOS",
      headline: "CONTROLLED CHAOS",
      subtext: "Strong score. Better timing can turn this into a trophy run.",
      identity: "CLUTCH",
    };
  }

  if (powerUpsUsed >= 4) {
    return {
      label: "ARSENAL DEPLOYED",
      headline: "ARSENAL DEPLOYED",
      subtext: "You went all-in. Save one tool for the finish next time.",
      identity: "AGGRESSIVE",
    };
  }

  return {
    label: "POWER RUN COMPLETE",
    headline: "TACTICAL RUN RECORDED",
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
  const usedThisMatch = usePowerUpStore((state) => state.usedThisMatch);
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
  const efficiencyScore = useMemo(
    () => getPowerEfficiency(score, powerUpsUsed),
    [powerUpsUsed, score]
  );
  const usedPowerLabels = useMemo(
    () => Object.entries(usedThisMatch)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => `${key} x${count}`),
    [usedThisMatch]
  );

  const rewardPreview = useMemo(
    () => previewPower({ score, powerUpsUsed }),
    [previewPower, powerUpsUsed, score]
  );
  const recordLabel = powerUpsUsed === 0 && score >= 10
    ? "NO-POWER BONUS"
    : score >= 20
      ? "POWER RECORD"
      : tier.label;
  const powerTicketCost = ARENA_MODE_CONFIG.power.tickets;
  const powerCostLabel = formatArenaCost("power");
  const efficiencyHint = efficiencyScore >= 80
    ? "Elite efficiency. Clean tool discipline improves Power prestige."
    : powerUpsUsed <= 3
      ? "Efficient loadout control improves token rewards."
      : "Heavy power-up use lowers prestige efficiency.";

  const [rewardApplied, setRewardApplied] = useState({ coins: 0, arenaTokens: 0 });
  const [confirmReplayVisible, setConfirmReplayVisible] = useState(false);
  const rewardedRef = useRef(false);

  const awardOnce = () => {
    if (rewardedRef.current) return;

    rewardedRef.current = true;
    const reward = rewardPower({ score, powerUpsUsed });
    setRewardApplied(reward);
    useAchievementEventsStore.getState().recordPowerResult({
      score,
      powerUpsUsed,
      efficiency: efficiencyScore,
    });
  };

  useEffect(() => {
    awardOnce();
  }, []);

  const handleExit = () => {
    awardOnce();
    resetMatch();
    router.replace("/(app)/arena_reset");
  };

  const handleReplayPress = () => {
    setConfirmReplayVisible(true);
  };

  const handleConfirmReplay = () => {
    setConfirmReplayVisible(false);
    awardOnce();
    resetMatch();
    router.replace("/(app)/arena_reset/power");
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
        source={POWER_RESULT_HERO}
        resizeMode="cover"
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(2,6,16,0.10)",
            "rgba(10,11,24,0.54)",
            "rgba(2,6,16,0.94)",
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <Text style={styles.eyebrow}>POWER-UP RESULT</Text>
        <Text style={styles.badge}>{recordLabel}</Text>
        <Text style={styles.title}>{tier.headline}</Text>
        <Text style={styles.subtitle}>{tier.subtext}</Text>
        <Text style={styles.subtitle}>{efficiencyHint}</Text>
      </ImageBackground>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
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
          <Text style={styles.statLabel}>Efficiency</Text>
          <Text style={styles.statValueCyan}>{efficiencyScore}%</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Loadout</Text>
          <Text style={styles.statValueCyan}>{powerUpsUsed}</Text>
        </View>
      </View>

      <LinearGradient colors={["#102A3D", "#091A30"]} style={styles.reportCard}>
        <Text style={styles.reportTitle}>Tactical Report</Text>
        <Text style={styles.reportText}>
          You used {powerUpsUsed} power-up{powerUpsUsed === 1 ? "" : "s"}.
          Efficiency score: {efficiencyScore}%. Score, timing, and resource control now drive your Power-Up prestige.
        </Text>
        <Text style={styles.reportText}>
          {usedPowerLabels.length ? `Tools used: ${usedPowerLabels.join(" • ")}` : "No tools used. Pure answer control run."}
        </Text>
      </LinearGradient>

      <TouchableOpacity style={styles.primaryButton} onPress={handleReplayPress} activeOpacity={0.9}>
        <LinearGradient colors={["#66D8FF", "#1A9AD6"]} style={styles.primaryFill}>
          <Text style={styles.primaryText}>Begin New Power Run</Text>
          <Text style={styles.primarySubtext}>Costs {powerCostLabel}</Text>
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
              <Text style={styles.confirmKicker}>POWER ARENA</Text>
              <Text style={styles.confirmTitle}>Begin New Power Run?</Text>
              <Text style={styles.confirmMessage}>
                This will consume {powerTicketCost} ticket{powerTicketCost === 1 ? "" : "s"}.
              </Text>
              <Text style={styles.confirmSubMessage}>
                A fresh Power run starts with your current loadout. Your completed result is already saved.
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
                  <LinearGradient colors={["#66D8FF", "#1A9AD6"]} style={styles.confirmButtonFill}>
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
    backgroundColor: "#060716",
  },
  content: {
    paddingTop: 78,
    paddingHorizontal: 14,
    paddingBottom: 50,
  },
  hero: {
    minHeight: 145,
    borderRadius: 15,
    padding: 11,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.50)",
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "#101018",
  },
  heroImage: { borderRadius: 22 },
  eyebrow: {
    color: "#81D4FA",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.25,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  badge: {
    alignSelf: "flex-start",
    color: "#061018",
    backgroundColor: "#4FC3F7",
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
    textShadowRadius: 10,
  },
  subtitle: {
    color: "#DDF6FF",
    fontSize: 11,
    lineHeight: 15.5,
    fontWeight: "800",
    marginTop: 7,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 9,
  },
  statCard: {
    width: "48.8%",
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.18)",
  },
  statLabel: {
    color: "#9BAEC4",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  statValue: { color: "#FFFFFF", fontSize: 25, fontWeight: "900", marginTop: 5 },
  statValueGold: { color: "#F7C948", fontSize: 25, fontWeight: "900", marginTop: 5 },
  statValueBlue: { color: "#4FC3F7", fontSize: 25, fontWeight: "900", marginTop: 5 },
  statValueCyan: { color: "#81D4FA", fontSize: 20, fontWeight: "900", marginTop: 8 },
  reportCard: {
    marginTop: 9,
    borderRadius: 15,
    padding: 11,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.20)",
  },
  reportTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  reportText: {
    color: "#C8D8E8",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
    fontWeight: "700",
  },
  primaryButton: {
    marginTop: 10,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#4FC3F7",
    shadowOpacity: 0.34,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryFill: { paddingVertical: 15, alignItems: "center" },
  primaryText: { color: "#061018", fontSize: 16, fontWeight: "900" },
  primarySubtext: {
    color: "rgba(6,16,24,0.75)",
    fontSize: 11,
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
    borderColor: "rgba(79,195,247,0.58)",
    shadowColor: "#4FC3F7",
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
    color: "#4FC3F7",
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
    color: "#D8F2FF",
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
    color: "#061018",
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  secondaryButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.30)",
    backgroundColor: "rgba(79,195,247,0.10)",
  },
  secondaryText: { color: "#A7E8FF", fontSize: 15, fontWeight: "900" },
});


