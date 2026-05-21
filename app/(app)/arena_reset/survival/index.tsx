import React from "react";
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
import { s } from "@/arena/theme/arenaSizing";

const SURVIVAL_INTRO_ART = require("../../../../assets/images/arena/survival/survival_intro_hero.webp");
const SURVIVAL_PRESSURE_ART = require("../../../../assets/images/arena/survival/survival_pressure_panel.webp");

export default function SurvivalEntry() {
  const { player, setMode } = useArenaStore();
  const bestStreak = player.streak ?? 0;
  const nextMilestone = bestStreak < 5 ? 5 : bestStreak < 10 ? 10 : 20;

  const handleStart = () => {
    useArenaStore.getState().resetArena();
    setMode("survival");
    router.push("/(app)/arena_reset/survival/SurvivalMatch");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={SURVIVAL_INTRO_ART}
        resizeMode="cover"
        style={styles.heroCard}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(2,6,16,0.12)",
            "rgba(2,8,20,0.38)",
            "rgba(2,6,16,0.90)",
          ]}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>SURVIVAL ARENA</Text>
          <Text style={styles.title}>One Life. No Mercy.</Text>
          <Text style={styles.subtitle}>
            Every answer keeps the run alive. One mistake ends everything.
          </Text>

          <View style={styles.liveRow}>
            <Text style={styles.livePill}>LIVE PRESSURE</Text>
            <Text style={styles.livePillBlue}>ENDLESS RUN</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.statGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best Run</Text>
          <Text style={styles.statValue}>{bestStreak}</Text>
          <Text style={styles.statHint}>rounds survived</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Next Milestone</Text>
          <Text style={styles.statValueBlue}>{nextMilestone}</Text>
          <Text style={styles.statHint}>prestige target</Text>
        </View>
      </View>

      <ImageBackground
        source={SURVIVAL_PRESSURE_ART}
        resizeMode="cover"
        style={styles.panelDanger}
        imageStyle={styles.panelImage}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(2,8,18,0.24)",
            "rgba(2,13,28,0.66)",
            "rgba(2,8,18,0.94)",
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <Text style={styles.panelTitle}>Run Energy</Text>
        <Text style={styles.panelText}>Perfect answers build momentum.</Text>
        <Text style={styles.panelText}>Timer pressure rises every wave.</Text>
        <Text style={styles.panelText}>Milestones become future profile flexes.</Text>
      </ImageBackground>

      <LinearGradient colors={["#102744", "#091A30"]} style={styles.panelReward}>
        <Text style={styles.rewardTitle}>Survival Reward</Text>
        <Text style={styles.rewardText}>
          Beat your best run to earn stronger victory moments, survival badges,
          and future seasonal rewards.
        </Text>
      </LinearGradient>

      <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.9}>
        <LinearGradient colors={["#0F5C86", "#102744"]} style={styles.startButtonFill}>
          <Text style={styles.startText}>Begin Survival Run</Text>
          <Text style={styles.startSubtext}>Hold the streak. Beat the fear.</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#061426" },
  content: { paddingTop: s(46), paddingHorizontal: s(18), paddingBottom: s(40) },

  heroCard: {
    minHeight: s(210),
    borderRadius: s(26),
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.50)",
    overflow: "hidden",
    backgroundColor: "#08182C",
    shadowColor: "#4FC3F7",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroImage: { borderRadius: s(26) },
  heroCopy: {
    flex: 1,
    justifyContent: "flex-end",
    padding: s(18),
  },
  eyebrow: {
    color: "#FF7043",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1.6,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: s(31),
    fontWeight: "900",
    marginTop: s(6),
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 10,
  },
  subtitle: {
    color: "#D8F2FF",
    fontSize: s(13),
    fontWeight: "800",
    lineHeight: s(19),
    marginTop: s(7),
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  liveRow: { flexDirection: "row", flexWrap: "wrap", gap: s(8), marginTop: s(14) },
  livePill: {
    color: "#FFFFFF",
    fontSize: s(10),
    fontWeight: "900",
    backgroundColor: "rgba(255, 112, 67, 0.25)",
    borderColor: "rgba(255, 112, 67, 0.65)",
    borderWidth: 1,
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: s(999),
    overflow: "hidden",
  },
  livePillBlue: {
    color: "#9FE8FF",
    fontSize: s(10),
    fontWeight: "900",
    backgroundColor: "rgba(79, 195, 247, 0.16)",
    borderColor: "rgba(79, 195, 247, 0.52)",
    borderWidth: 1,
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: s(999),
    overflow: "hidden",
  },

  statGrid: { flexDirection: "row", gap: s(12), marginTop: s(16) },
  statCard: {
    flex: 1,
    backgroundColor: "#0A2138",
    borderRadius: s(18),
    padding: s(16),
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.28)",
  },
  statLabel: { color: "#9FD9FF", fontSize: s(11), fontWeight: "900", letterSpacing: 0.5 },
  statValue: { color: "#FFFFFF", fontSize: s(30), fontWeight: "900", marginTop: s(6) },
  statValueBlue: { color: "#4FC3F7", fontSize: s(30), fontWeight: "900", marginTop: s(6) },
  statHint: { color: "#9BAEC4", fontSize: s(12), fontWeight: "700", marginTop: s(2) },

  panelDanger: {
    minHeight: s(150),
    marginTop: s(16),
    borderRadius: s(22),
    padding: s(18),
    borderWidth: 1,
    borderColor: "rgba(255, 112, 67, 0.42)",
    overflow: "hidden",
    backgroundColor: "#091A30",
  },
  panelImage: { borderRadius: s(22) },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: s(19),
    fontWeight: "900",
    marginBottom: s(10),
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowRadius: 8,
  },
  panelText: {
    color: "#D8F2FF",
    fontSize: s(13),
    fontWeight: "800",
    lineHeight: s(20),
    marginBottom: s(4),
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 6,
  },

  panelReward: {
    marginTop: s(14),
    borderRadius: s(20),
    padding: s(18),
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.28)",
  },
  rewardTitle: { color: "#F7C948", fontSize: s(18), fontWeight: "900" },
  rewardText: { color: "#D8F2FF", fontSize: s(13), fontWeight: "700", lineHeight: s(20), marginTop: s(7) },

  startButton: {
    marginTop: s(22),
    borderRadius: s(18),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.62)",
    shadowColor: "#4FC3F7",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  startButtonFill: {
    paddingVertical: s(17),
    alignItems: "center",
  },
  startText: { color: "#FFFFFF", fontSize: s(18), fontWeight: "900" },
  startSubtext: { color: "#BDEFFF", fontSize: s(12), fontWeight: "800", marginTop: s(4) },
});
