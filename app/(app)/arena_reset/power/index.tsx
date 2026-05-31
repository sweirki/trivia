import React, { useEffect } from "react";
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
import { usePowerUpStore } from "@/arena/store/usePowerUpStore";
import { usePowerArenaMatchStore } from "@/arena/power/store/usePowerArenaMatchStore";
import { buildPowerArenaQuestions } from "@/questions/gameplayQuestions";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ARENA_MODE_CONFIG, formatArenaCost } from "@/arena/arenaEconomyRules";
import { useThemedAlert } from "@/components/ThemedAlert";

const POWER_ENTRY_HERO = require("../../../../assets/images/arena/power/power_entry_hero.webp");
const POWER_LOADOUT_PANEL = require("../../../../assets/images/arena/power/power_loadout_panel.webp");

type PowerUpItem = {
  name?: string;
  qty?: number;
};

type PowerUpMap = Record<string, PowerUpItem | undefined>;

function getPowerUpEntries(powerups: PowerUpMap) {
  return Object.entries(powerups).filter(([, item]) => (item?.qty ?? 0) > 0);
}

function buildMatchQuestions() {
  return buildPowerArenaQuestions(5).map((question) => ({
    id: String(question.id),
    question: question.text,
    options: question.answers,
    correctAnswer: question.correctAnswer,
  }));
}

export default function PowerUpArenaEntry() {
  const { showThemedAlert, themedAlert } = useThemedAlert();
  const { setMode } = useArenaStore();
  const { powerups, resetPowerUps } = usePowerUpStore();

  const equipped = getPowerUpEntries(powerups as PowerUpMap);
  const totalPowerups = equipped.reduce(
    (sum, [, item]) => sum + (item?.qty ?? 0),
    0
  );

  useEffect(() => {
    resetPowerUps();
  }, [resetPowerUps]);

  const handleStart = () => {
    if (!usePlayerStore.getState().spendTickets(ARENA_MODE_CONFIG.power.tickets)) {
      showThemedAlert(
        "Not enough tickets",
        `Power-Up Arena requires ${formatArenaCost("power")}.`,
        "warning"
      );
      return;
    }

    setMode("power");
    resetPowerUps();
    usePowerArenaMatchStore.getState().startMatch(buildMatchQuestions());
    router.push("/(app)/arena_reset/power/PowerMatch");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={POWER_ENTRY_HERO}
        resizeMode="cover"
        imageStyle={styles.heroImage}
        style={styles.heroCard}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(2,8,18,0.10)",
            "rgba(3,12,22,0.46)",
            "rgba(2,6,16,0.92)",
          ]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <Text style={styles.eyebrow}>POWER-UP ARENA</Text>
        <Text style={styles.title}>Control the Chaos.</Text>
        <Text style={styles.subtitle}>
          Every power-up is a weapon. Use it too early and you may regret it.
          Use it too late and the arena wins.
        </Text>

        <View style={styles.pillRow}>
          <Text style={styles.bluePill}>TACTICAL MATCH</Text>
          <Text style={styles.goldPill}>PRESTIGE REWARDS</Text>
        </View>
      </ImageBackground>

      <ImageBackground
        source={POWER_LOADOUT_PANEL}
        resizeMode="cover"
        imageStyle={styles.panelImage}
        style={styles.loadoutCard}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(7,13,27,0.30)",
            "rgba(13,17,30,0.72)",
            "rgba(10,13,24,0.96)",
          ]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.sectionLabel}>LOADOUT</Text>
            <Text style={styles.panelTitle}>Battle Loadout</Text>
          </View>

          <Text style={styles.countBadge}>{totalPowerups} ready</Text>
        </View>

        {equipped.length === 0 ? (
          <View style={styles.emptyLoadout}>
            <Text style={styles.emptyTitle}>ENTERING UNARMED</Text>
            <Text style={styles.emptyText}>
              No power-ups equipped. Every answer must carry the run.
            </Text>
          </View>
        ) : (
          <View style={styles.powerList}>
            {equipped.map(([key, item]) => (
              <View key={key} style={styles.powerItem}>
                <Text style={styles.powerName}>{item?.name ?? key}</Text>
                <Text style={styles.powerQty}>x{item?.qty ?? 0}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/(app)/store")}
          activeOpacity={0.86}
        >
          <Text style={styles.secondaryButtonText}>Manage Power-Ups</Text>
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>TACTICS</Text>
        <Text style={styles.panelTitle}>Arena Pressure</Text>
        <Text style={styles.panelText}>⚡ One perfect power-up can flip the match.</Text>
        <Text style={styles.panelText}>🛡️ Shields reward preparation, not luck.</Text>
        <Text style={styles.panelText}>🎯 Smart timing creates comeback moments.</Text>
      </View>

      <ImageBackground
        source={POWER_LOADOUT_PANEL}
        resizeMode="cover"
        imageStyle={styles.goldImage}
        style={styles.goldCard}
      >
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(30,22,2,0.48)", "rgba(10,10,4,0.92)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.rewardTitle}>Power Prestige</Text>
        <Text style={styles.rewardText}>
          Clean timing, smart shields, and controlled surges build your Power Arena identity.
        </Text>
      </ImageBackground>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStart}
        activeOpacity={0.9}
      >
        <LinearGradient colors={["#66D8FF", "#1A9AD6"]} style={styles.startFill}>
          <Text style={styles.startText}>Start Power Match</Text>
          <Text style={styles.startSubtext}>Outplay. Outthink. Overpower.</Text>
        </LinearGradient>
      </TouchableOpacity>
      {themedAlert}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070713",
  },
  content: {
    paddingTop: 90,
    paddingHorizontal: 18,
    paddingBottom: 128,
  },
  heroCard: {
    minHeight: 220,
    borderRadius: 24,
    padding: 22,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.52)",
    shadowColor: "#4FC3F7",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  heroImage: { borderRadius: 24 },
  eyebrow: {
    color: "#81D4FA",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 8,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 10,
  },
  subtitle: {
    color: "#DDF6FF",
    fontSize: 12,
    lineHeight: 22,
    marginTop: 8,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },
  bluePill: {
    color: "#DDF6FF",
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "rgba(79, 195, 247, 0.22)",
    borderColor: "rgba(129, 212, 250, 0.60)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  goldPill: {
    color: "#FFF2BE",
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "rgba(247, 201, 72, 0.20)",
    borderColor: "rgba(247, 201, 72, 0.56)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  loadoutCard: {
    minHeight: 250,
    marginTop: 16,
    backgroundColor: "#121824",
    borderRadius: 20,
    padding: 13,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.26)",
  },
  panelImage: { borderRadius: 20 },
  card: {
    marginTop: 16,
    backgroundColor: "#121824",
    borderRadius: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.18)",
  },
  goldCard: {
    marginTop: 14,
    backgroundColor: "#17140D",
    borderRadius: 20,
    padding: 13,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(247, 201, 72, 0.34)",
  },
  goldImage: { borderRadius: 20 },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionLabel: {
    color: "#81D4FA",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  countBadge: {
    color: "#4FC3F7",
    fontSize: 12,
    fontWeight: "900",
    backgroundColor: "rgba(79, 195, 247, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  emptyLoadout: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(7, 11, 20, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyText: {
    color: "#C8C8D8",
    fontSize: 10.5,
    lineHeight: 19,
    marginTop: 5,
  },
  powerList: { marginTop: 12 },
  powerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  powerName: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  powerQty: { color: "#4FC3F7", fontSize: 15, fontWeight: "900" },
  secondaryButton: {
    marginTop: 16,
    backgroundColor: "rgba(79, 195, 247, 0.18)",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.38)",
  },
  secondaryButtonText: {
    color: "#A7E8FF",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
  },
  panelText: {
    color: "#C8C8D8",
    fontSize: 11,
    lineHeight: 22,
    marginTop: 6,
    fontWeight: "600",
  },
  rewardTitle: { color: "#F7C948", fontSize: 18, fontWeight: "900" },
  rewardText: {
    color: "#D8D1B6",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
    fontWeight: "600",
  },
  startButton: {
    marginTop: 18,
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#4FC3F7",
    shadowOpacity: 0.34,
    shadowRadius: 16,
    elevation: 8,
  },
  startFill: {
    paddingVertical: 14,
    alignItems: "center",
  },
  startText: { color: "#061018", fontSize: 18, fontWeight: "900" },
  startSubtext: {
    color: "rgba(6,16,24,0.75)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
});


