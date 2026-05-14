import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useArenaRankSystem } from "@/arena/store/useArenaRankSystem";
import { useArenaStore } from "@/arena/store/useArenaStore";
import {
  formatRank,
  getNextRank,
  getRankProgress,
  getSRToNext,
} from "@/arena/ranked/rankedPrestige";
import { s } from "@/arena/theme/arenaSizing";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { useThemedAlert } from "@/components/ThemedAlert";
import AnimatedProgressBar from "@/components/AnimatedProgressBar";

export default function RankedArenaEntry() {
  const { rank, sr, winStreak } = useArenaRankSystem();
  const { setMode, startRankedMatch } = useArenaStore();
  const { daily } = useLocalSearchParams<{ daily?: string }>();
  const { lastDailyPlayedAt } = useTournamentStore();
  const { showThemedAlert, themedAlert } = useThemedAlert();
  const [searching, setSearching] = useState(false);

  const isDailyArenaEntry = daily === "1";
  const today = new Date().toDateString();
  const playedToday =
    !!lastDailyPlayedAt && new Date(lastDailyPlayedAt).toDateString() === today;

  if (!rank) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F7C948" />
      </View>
    );
  }

  const nextRank = getNextRank(rank);
  const progress = getRankProgress(sr, rank);
  const rivalNames = ["ShadowFox","MindStrike","QuizNova","NovaIQ","BlitzKing"];
  const rival = rivalNames[sr % rivalNames.length];
  const promotionPressure = progress >= 75;
  const dangerPressure = progress <= 18;
  const srToNext = getSRToNext(sr, rank);
  const dangerZone = sr <= rank.minSR + 18 && sr > 0;

  const handleStart = async () => {
    if (isDailyArenaEntry && playedToday) {
      showThemedAlert(
        "Daily Arena Complete",
        "You already completed today's Daily Arena. Come back tomorrow.",
        "info"
      );
      return;
    }

    setMode("ranked");
    setSearching(true);
    await startRankedMatch();
    router.push({
      pathname: "/(app)/arena_reset/ranked/RankedMatch",
      params: isDailyArenaEntry ? { daily: "1" } : undefined,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={["#2A1B4A", "#11111A"]} style={styles.heroCard}>
        <Text style={styles.eyebrow}>RANKED ARENA</Text>
        <Text style={styles.heroTitle}>{formatRank(rank)}</Text>
        <Text style={styles.heroSubtitle}>Skill Rating {sr}</Text>

        <View style={styles.badgeRow}>
          {promotionPressure && <Text style={styles.goldBadge}>PROMOTION NEAR</Text>}
          {dangerZone && <Text style={styles.redBadge}>DANGER ZONE</Text>}
          {winStreak >= 3 && <Text style={styles.greenBadge}>{winStreak} WIN STREAK</Text>}
        </View>
      </LinearGradient>

      <View style={styles.panel}>
        <View style={styles.rowBetween}>
          <Text style={styles.panelTitle}>Division Progress</Text>
          <Text style={styles.panelMeta}>{Math.round(progress)}%</Text>
        </View>

        <AnimatedProgressBar
          percent={progress}
          height={s(12)}
          fillColor={dangerPressure ? "#FF5C7A" : promotionPressure ? "#F7C948" : "#52D273"}
          trackColor="#2A2A38"
          glowColor={dangerPressure ? "#FF5C7A" : promotionPressure ? "#F7C948" : "#52D273"}
          style={styles.progressWrapper}
        />

        <Text style={styles.progressText}>
          {nextRank && srToNext !== null
            ? `${srToNext} SR to ${formatRank(nextRank)}`
            : "You are in the elite rank ceiling."}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Prestige Rules</Text>
        <Text style={styles.ruleLine}>• Win matches to gain SR and climb divisions.</Text>
        <Text style={styles.ruleLine}>• 3+ win streaks add bonus SR.</Text>
        <Text style={styles.ruleLine}>• Promotion alerts appear when the next rank is close.</Text>
        <Text style={styles.ruleLine}>• Danger Zone warns you when demotion risk is high.</Text>
      </View>

      <View style={styles.panelGold}>
        <Text style={styles.rewardTitle}>Season Prestige</Text>
        <Text style={styles.rewardSubtitle}>
          Your highest rank this season will become a profile flex, reward tier, and tournament seed later.
        </Text>
      </View>

      {!searching ? (
        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.9}>
          <Text style={styles.startText}>Start Ranked Match</Text>
          <Text style={styles.startSubtext}>Climb. Protect. Promote.</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.searchBox}>
          <ActivityIndicator size="large" color="#F7C948" />
          <Text style={styles.searchText}>Finding a ranked opponent…</Text>
        </View>
      )}
      {themedAlert}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B12",
  },
  content: {
    paddingTop: s(46),
    paddingHorizontal: s(18),
    paddingBottom: s(142),
  },
  heroCard: {
    borderRadius: s(24),
    padding: s(22),
    marginBottom: s(18),
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.28)",
  },
  eyebrow: {
    color: "#F7C948",
    fontSize: s(12),
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: s(34),
    fontWeight: "900",
    marginTop: s(8),
  },
  heroSubtitle: {
    color: "#C9C6D6",
    fontSize: s(16),
    marginTop: s(4),
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s(8),
    marginTop: s(16),
  },
  goldBadge: {
    color: "#2B2100",
    backgroundColor: "#F7C948",
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: s(999),
    fontWeight: "900",
    fontSize: s(11),
  },
  redBadge: {
    color: "#FFFFFF",
    backgroundColor: "#C0392B",
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: s(999),
    fontWeight: "900",
    fontSize: s(11),
  },
  greenBadge: {
    color: "#062817",
    backgroundColor: "#52D273",
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: s(999),
    fontWeight: "900",
    fontSize: s(11),
  },
  panel: {
    backgroundColor: "#151521",
    borderRadius: s(18),
    padding: s(18),
    marginBottom: s(14),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  panelGold: {
    backgroundColor: "#211A0B",
    borderRadius: s(18),
    padding: s(18),
    marginBottom: s(18),
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.3)",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: s(18),
    fontWeight: "800",
  },
  panelMeta: {
    color: "#F7C948",
    fontSize: s(14),
    fontWeight: "800",
  },
  progressWrapper: {
    height: s(12),
    backgroundColor: "#2A2A38",
    borderRadius: s(999),
    overflow: "hidden",
    marginTop: s(14),
  },
  progressInner: {
    height: "100%",
    backgroundColor: "#F7C948",
    borderRadius: s(999),
  },
  progressText: {
    color: "#B8B5C8",
    fontSize: s(14),
    marginTop: s(10),
  },
  ruleLine: {
    color: "#B8B5C8",
    fontSize: s(14),
    marginTop: s(8),
    lineHeight: s(20),
  },
  rewardTitle: {
    color: "#F7C948",
    fontSize: s(18),
    fontWeight: "900",
  },
  rewardSubtitle: {
    color: "#E6DDBB",
    marginTop: s(8),
    fontSize: s(14),
    lineHeight: s(20),
  },
  startButton: {
    backgroundColor: "#F7C948",
    paddingVertical: s(14),
    borderRadius: s(16),
    alignItems: "center",
    marginBottom: s(16),
    shadowColor: "#F7C948",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  startText: {
    color: "#181300",
    fontSize: s(19),
    fontWeight: "900",
  },
  startSubtext: {
    color: "#4A3B00",
    fontSize: s(12),
    fontWeight: "800",
    marginTop: s(3),
  },
  searchBox: {
    alignItems: "center",
    paddingVertical: s(22),
  },
  searchText: {
    color: "#FFFFFF",
    marginTop: s(12),
    fontSize: s(16),
    fontWeight: "700",
  },

  vsCard: {
    width: "100%",
    borderRadius: s(22),
    padding: s(18),
    marginBottom: s(16),
    borderWidth: 1,
    borderColor: "#4B3A16",
  },
  vsLabel: {
    color: "#FFD36B",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: s(14),
  },
  vsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  playerSide: {
    width: "30%",
    alignItems: "center",
  },
  sideRank: {
    color: "#fff",
    fontSize: s(14),
    fontWeight: "900",
    textAlign: "center",
  },
  sideName: {
    color: "#A9ADC1",
    fontSize: s(12),
    marginTop: s(6),
    fontWeight: "700",
  },
  vsCenter: {
    width: "40%",
    alignItems: "center",
  },
  vsText: {
    color: "#FFD36B",
    fontSize: s(26),
    fontWeight: "900",
  },
  vsSub: {
    color: "#D4CDB8",
    fontSize: s(11),
    textAlign: "center",
    marginTop: s(6),
    lineHeight: s(16),
  },

});

