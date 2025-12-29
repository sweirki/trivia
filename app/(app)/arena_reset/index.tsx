import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { Alert } from "react-native";

import { s } from "@/arena/theme/arenaSizing";
import { useArenaRankSystem } from "@/arena/store/useArenaRankSystem";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";

import sampleQuestions from "@assets/data/sampleQuestions.json";
import { startSurvivalGame } from "@/arena/survival/survivalEngine";

export default function ArenaHub() {
  const { rank, sr, season } = useArenaRankSystem();


  // ----------------------------
  // RETENTION STATE (PHASE B)
  // ----------------------------
  const {
    lastDailyPlayedAt,
    weeklyPlays,
    dailyStreak,
  } = useTournamentStore();

  const today = new Date().toDateString();
  const playedToday =
    lastDailyPlayedAt &&
    new Date(lastDailyPlayedAt).toDateString() === today;

  const weeklyGoal = 3;
  const weeklyProgress = Math.min(weeklyPlays, weeklyGoal);
  const weeklyAlmostDone = weeklyProgress === weeklyGoal - 1;

  // ----------------------------
  // UI HELPERS
  // ----------------------------
  const dailyAccent = !playedToday ? styles.glowGold : null;
  const weeklyAccent = weeklyAlmostDone ? styles.glowBlue : null;
  const streakAccent = dailyStreak > 0 ? styles.glowOrange : null;
const hasRank =
  !!rank &&
  typeof rank.maxSR === "number" &&
  typeof rank.minSR === "number";

  return (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    {!hasRank ? (
      <Text style={{ color: "#aaa", marginTop: 40 }}>
        Loading Arena…
      </Text>
    ) : (
      <>
        <View style={styles.rankSection}>
          <Image source={{ uri: rank.icon }} style={styles.rankIcon} />
          <Text style={styles.rankName}>
            {rank.league} {rank.division ? `• ${rank.division}` : ""}
          </Text>
          <Text style={styles.srLabel}>SR: {sr}</Text>
        </View>

        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBar,
              { width: `${getSRPercent(sr, rank)}%` },
            ]}
          />
        </View>

      <View style={styles.seasonBox}>
        <Text style={styles.seasonTitle}>Season {season}</Text>
        <Text style={styles.seasonSubtitle}>Ends soon</Text>
      </View>

      {/* ============================
          DAILY TOURNAMENT (PRIORITY)
      ============================ */}
      <View style={[styles.dailyBox, dailyAccent]}>
        <Text style={styles.dailyTitle}>🎯 Daily Tournament</Text>

        <Text style={styles.dailyStatus}>
          {playedToday ? "Completed today ✓" : "Play today’s tournament"}
        </Text>

        <TouchableOpacity
          style={[
            styles.dailyBtn,
            playedToday && styles.dailyBtnDone,
          ]}
          disabled={playedToday}
          onPress={() => router.push("/(app)/arena_reset/tournaments")}
        >
          <Text style={styles.dailyBtnText}>
            {playedToday ? "Done" : "Play Daily"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ============================
          WEEKLY MOMENTUM
      ============================ */}
      <View style={[styles.weeklyBox, weeklyAccent]}>
        <Text style={styles.weeklyTitle}>📆 Weekly Progress</Text>
        <Text style={styles.weeklyText}>
          {weeklyProgress} / {weeklyGoal} tournaments played
        </Text>

        <View style={styles.weeklyBar}>
          <View
            style={[
              styles.weeklyFill,
              { width: `${(weeklyProgress / weeklyGoal) * 100}%` },
            ]}
          />
        </View>

        {weeklyAlmostDone && (
          <Text style={styles.weeklyHint}>
            One more tournament to complete the week 👀
          </Text>
        )}
      </View>

      {/* ============================
          STREAK
      ============================ */}
      <View style={[styles.streakBox, streakAccent]}>
        <Text style={styles.streakText}>
          🔥 Daily Streak: {dailyStreak} day{dailyStreak === 1 ? "" : "s"}
        </Text>
      </View>

      {/* ============================
          MODES
      ============================ */}
      <View style={styles.modesWrapper}>
        <ModeButton
          label="Ranked Arena"
          onPress={() => {
            if (!usePlayerStore.getState().spendTickets(1)) {
              Alert.alert(
                "Not enough tickets",
                "Earn tickets from Daily & Weekly play."
              );
              return;
            }
            router.push("/(app)/arena_reset/ranked");
          }}
        />

        <ModeButton
          label="Survival Arena"
          onPress={() => {
            if (!usePlayerStore.getState().spendTickets(1)) {
              Alert.alert(
                "Not enough tickets",
                "Earn tickets from Daily & Weekly play."
              );
              return;
            }
            startSurvivalGame(sampleQuestions);
            router.push("/(app)/play/game");
          }}
        />

        <ModeButton
          label="Power-Up Arena"
          onPress={() => router.push("/(app)/arena_reset/power")}
        />

        <ModeButton
          label="Tournaments"
          onPress={() => router.push("/(app)/arena_reset/tournaments")}
        />
      </View>
     </>
    )} 
    </ScrollView>
  );
}

function getSRPercent(sr: number, rank: any) {
  const range = rank.maxSR - rank.minSR;
  const current = sr - rank.minSR;
  return Math.min(100, Math.max(0, (current / range) * 100));
}

function ModeButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.modeButton} onPress={onPress}>
      <Text style={styles.modeText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ----------------------------
// STYLES
// ----------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0e14" },
  content: { alignItems: "center", paddingBottom: s(40) },

  rankSection: { marginTop: s(40), alignItems: "center" },
  rankIcon: { width: s(120), height: s(120) },
  rankName: { color: "#fff", fontSize: s(26), marginTop: s(10) },
  srLabel: { color: "#aaa", fontSize: s(18) },

  progressBarWrapper: {
    width: "80%",
    height: s(10),
    backgroundColor: "#333",
    borderRadius: s(5),
    overflow: "hidden",
    marginVertical: s(20),
  },
  progressBar: { height: s(10), backgroundColor: "#4CAF50" },

  seasonBox: {
    width: "85%",
    backgroundColor: "#1b1b27",
    padding: s(20),
    borderRadius: s(12),
    alignItems: "center",
    marginBottom: s(20),
  },
  seasonTitle: { color: "#fff", fontSize: s(20) },
  seasonSubtitle: { color: "#aaa", fontSize: s(14) },

  dailyBox: {
    width: "85%",
    backgroundColor: "#151521",
    padding: s(20),
    borderRadius: s(14),
    marginBottom: s(20),
  },
  glowGold: {
    borderWidth: 1,
    borderColor: "#FFD54F",
  },
  dailyTitle: { color: "#FFD54F", fontSize: s(18) },
  dailyStatus: { color: "#aaa", marginVertical: s(10) },
  dailyBtn: {
    backgroundColor: "#FFD54F",
    paddingVertical: s(14),
    borderRadius: s(12),
  },
  dailyBtnDone: { backgroundColor: "#444" },
  dailyBtnText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "800",
  },

  weeklyBox: {
    width: "85%",
    backgroundColor: "#151521",
    padding: s(20),
    borderRadius: s(14),
    marginBottom: s(15),
  },
  glowBlue: {
    borderWidth: 1,
    borderColor: "#4FC3F7",
  },
  weeklyTitle: { color: "#4FC3F7", fontSize: s(16) },
  weeklyText: { color: "#fff", marginVertical: s(8) },
  weeklyHint: {
    color: "#4FC3F7",
    marginTop: s(8),
    fontSize: s(13),
  },
  weeklyBar: {
    height: s(8),
    backgroundColor: "#333",
    borderRadius: s(4),
    overflow: "hidden",
  },
  weeklyFill: { height: s(8), backgroundColor: "#4FC3F7" },

  streakBox: {
    width: "85%",
    alignItems: "center",
    marginBottom: s(25),
  },
  glowOrange: {
    borderWidth: 1,
    borderColor: "#FF7043",
    borderRadius: s(12),
    paddingVertical: s(10),
  },
  streakText: { color: "#FF7043", fontSize: s(16) },

  modesWrapper: { width: "100%", alignItems: "center", gap: s(15) },
  modeButton: {
    width: "85%",
    backgroundColor: "#272737",
    paddingVertical: s(18),
    borderRadius: s(14),
  },
  modeText: { color: "#fff", textAlign: "center", fontSize: s(18) },
});
