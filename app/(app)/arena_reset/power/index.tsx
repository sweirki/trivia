import React from "react";
import {
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
  const { setMode } = useArenaStore();
  const { powerups } = usePowerUpStore();

  const equipped = getPowerUpEntries(powerups as PowerUpMap);
  const totalPowerups = equipped.reduce(
    (sum, [, item]) => sum + (item?.qty ?? 0),
    0
  );

  const handleStart = () => {
    setMode("power");
    usePowerArenaMatchStore.getState().startMatch(buildMatchQuestions());
    router.push("/(app)/arena_reset/power/PowerMatch");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={["#082B3D", "#10111A"]} style={styles.heroCard}>
        <Text style={styles.eyebrow}>POWER-UP ARENA</Text>
        <Text style={styles.title}>Control the Chaos.</Text>
        <Text style={styles.subtitle}>
          Freeze time, shield mistakes, reroll danger, and turn smart strategy
          into arena dominance.
        </Text>

        <View style={styles.pillRow}>
          <Text style={styles.bluePill}>TACTICAL MATCH</Text>
          <Text style={styles.goldPill}>PRESTIGE REWARDS</Text>
        </View>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.sectionLabel}>LOADOUT</Text>
            <Text style={styles.panelTitle}>Battle Loadout</Text>
          </View>

          <Text style={styles.countBadge}>{totalPowerups} ready</Text>
        </View>

        {equipped.length === 0 ? (
          <View style={styles.emptyLoadout}>
            <Text style={styles.emptyTitle}>No power-ups equipped</Text>
            <Text style={styles.emptyText}>
              You can still play, but stocked players have more clutch moments.
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
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>TACTICS</Text>
        <Text style={styles.panelTitle}>Arena Pressure</Text>
        <Text style={styles.panelText}>⚡ One perfect power-up can flip the match.</Text>
        <Text style={styles.panelText}>🛡️ Shields reward preparation, not luck.</Text>
        <Text style={styles.panelText}>🎯 Smart timing creates comeback moments.</Text>
      </View>

      <View style={styles.goldCard}>
        <Text style={styles.rewardTitle}>Prestige Hook</Text>
        <Text style={styles.rewardText}>
          Power-Up wins should become future badges, profile flexes, and limited
          event achievements.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStart}
        activeOpacity={0.9}
      >
        <Text style={styles.startText}>Start Power Match</Text>
        <Text style={styles.startSubtext}>Outplay. Outthink. Overpower.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B12",
  },
  content: {
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 128,
  },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.36)",
    shadowColor: "#4FC3F7",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  eyebrow: {
    color: "#81D4FA",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 8,
  },
  subtitle: {
    color: "#D8D8E8",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
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
    backgroundColor: "rgba(79, 195, 247, 0.18)",
    borderColor: "rgba(129, 212, 250, 0.45)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  goldPill: {
    color: "#FFF2BE",
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "rgba(247, 201, 72, 0.16)",
    borderColor: "rgba(247, 201, 72, 0.42)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  card: {
    marginTop: 16,
    backgroundColor: "#121824",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.18)",
  },
  goldCard: {
    marginTop: 14,
    backgroundColor: "#17140D",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(247, 201, 72, 0.25)",
  },
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
    fontSize: 19,
    fontWeight: "900",
  },
  countBadge: {
    color: "#4FC3F7",
    fontSize: 12,
    fontWeight: "900",
    backgroundColor: "rgba(79, 195, 247, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  emptyLoadout: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  emptyText: {
    color: "#AFAFC0",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  powerList: {
    marginTop: 12,
  },
  powerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  powerName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  powerQty: {
    color: "#4FC3F7",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    marginTop: 16,
    backgroundColor: "rgba(79, 195, 247, 0.14)",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.28)",
  },
  secondaryButtonText: {
    color: "#81D4FA",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
  },
  panelText: {
    color: "#C8C8D8",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
    fontWeight: "600",
  },
  rewardTitle: {
    color: "#F7C948",
    fontSize: 18,
    fontWeight: "900",
  },
  rewardText: {
    color: "#D8D1B6",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    fontWeight: "600",
  },
  startButton: {
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: "#4FC3F7",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4FC3F7",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startText: {
    color: "#061018",
    fontSize: 18,
    fontWeight: "900",
  },
  startSubtext: {
    color: "rgba(6,16,24,0.75)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
});
