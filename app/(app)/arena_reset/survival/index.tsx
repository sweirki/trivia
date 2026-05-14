import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { s } from "@/arena/theme/arenaSizing";

export default function SurvivalEntry() {
  const { player, setMode } = useArenaStore();
  const bestStreak = player.streak ?? 0;

  const handleStart = () => {
    useArenaStore.getState().resetArena();
    setMode("survival");
    router.push("/(app)/arena_reset/survival/SurvivalMatch");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={["#3A1014", "#11111A"]} style={styles.heroCard}>
        <Text style={styles.eyebrow}>SURVIVAL ARENA</Text>
        <Text style={styles.title}>One Life. No Mercy.</Text>
        <Text style={styles.subtitle}>
          Every answer keeps the run alive. One mistake ends everything.
        </Text>

        <View style={styles.liveRow}>
          <Text style={styles.livePill}>LIVE PRESSURE</Text>
          <Text style={styles.livePill}>ENDLESS RUN</Text>
        </View>
      </LinearGradient>

      <View style={styles.statGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best Run</Text>
          <Text style={styles.statValue}>{bestStreak}</Text>
          <Text style={styles.statHint}>rounds survived</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Next Milestone</Text>
          <Text style={styles.statValue}>{bestStreak < 5 ? 5 : bestStreak < 10 ? 10 : 20}</Text>
          <Text style={styles.statHint}>prestige target</Text>
        </View>
      </View>

      <View style={styles.panelDanger}>
        <Text style={styles.panelTitle}>Run Energy</Text>
        <Text style={styles.panelText}>🔥 Perfect answers build momentum.</Text>
        <Text style={styles.panelText}>⏱️ Timer pressure increases the tension.</Text>
        <Text style={styles.panelText}>🏆 Milestones become future profile flexes.</Text>
      </View>

      <View style={styles.panelReward}>
        <Text style={styles.rewardTitle}>Emotional Reward</Text>
        <Text style={styles.rewardText}>
          Beat your best run to earn stronger victory moments, survival badges, and future seasonal rewards.
        </Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.9}>
        <Text style={styles.startText}>Begin Survival Run</Text>
        <Text style={styles.startSubtext}>Hold the streak. Beat the fear.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B12" },
  content: { paddingTop: s(46), paddingHorizontal: s(18), paddingBottom: s(34) },
  heroCard: {
    borderRadius: s(24),
    padding: s(22),
    borderWidth: 1,
    borderColor: "rgba(255, 82, 82, 0.38)",
    shadowColor: "#E53935",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  eyebrow: { color: "#FF8A80", fontSize: s(12), fontWeight: "900", letterSpacing: 1.6 },
  title: { color: "#FFFFFF", fontSize: s(34), fontWeight: "900", marginTop: s(8) },
  subtitle: { color: "#D8D8E8", fontSize: s(15), lineHeight: s(22), marginTop: s(8) },
  liveRow: { flexDirection: "row", flexWrap: "wrap", gap: s(8), marginTop: s(18) },
  livePill: {
    color: "#FFFFFF",
    fontSize: s(11),
    fontWeight: "900",
    backgroundColor: "rgba(229, 57, 53, 0.24)",
    borderColor: "rgba(255, 138, 128, 0.45)",
    borderWidth: 1,
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: s(999),
  },
  statGrid: { flexDirection: "row", gap: s(12), marginTop: s(16) },
  statCard: {
    flex: 1,
    backgroundColor: "#151520",
    borderRadius: s(18),
    padding: s(16),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statLabel: { color: "#A9A9BC", fontSize: s(12), fontWeight: "800" },
  statValue: { color: "#FFFFFF", fontSize: s(30), fontWeight: "900", marginTop: s(6) },
  statHint: { color: "#777789", fontSize: s(12), marginTop: s(2) },
  panelDanger: {
    marginTop: s(16),
    backgroundColor: "#171018",
    borderRadius: s(20),
    padding: s(18),
    borderWidth: 1,
    borderColor: "rgba(255, 82, 82, 0.24)",
  },
  panelTitle: { color: "#FFFFFF", fontSize: s(19), fontWeight: "900", marginBottom: s(10) },
  panelText: { color: "#C8C8D8", fontSize: s(14), lineHeight: s(22), marginBottom: s(4) },
  panelReward: {
    marginTop: s(14),
    backgroundColor: "#17140D",
    borderRadius: s(20),
    padding: s(18),
    borderWidth: 1,
    borderColor: "rgba(247, 201, 72, 0.25)",
  },
  rewardTitle: { color: "#F7C948", fontSize: s(18), fontWeight: "900" },
  rewardText: { color: "#D8D1B6", fontSize: s(14), lineHeight: s(21), marginTop: s(7) },
  startButton: {
    marginTop: s(22),
    backgroundColor: "#E53935",
    paddingVertical: s(18),
    borderRadius: s(18),
    alignItems: "center",
    shadowColor: "#E53935",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  startText: { color: "#FFFFFF", fontSize: s(18), fontWeight: "900" },
  startSubtext: { color: "rgba(255,255,255,0.78)", fontSize: s(12), fontWeight: "700", marginTop: s(4) },
});

