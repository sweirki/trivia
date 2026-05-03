import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { useArenaRankSystem } from "@/arena/store/useArenaRankSystem";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { router } from "expo-router";
import { useState } from "react";
import { s } from "@/arena/theme/arenaSizing";

export default function RankedArenaEntry() {
  const { rank, sr } = useArenaRankSystem();
 const { setMode, startRankedMatch } = useArenaStore();


  const [searching, setSearching] = useState(false);
  if (!rank) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const handleStart = async () => {
  setMode("ranked");
  setSearching(true);

  await startRankedMatch();   // 🔴 THIS WAS MISSING

router.push("/arena_reset/ranked/RankedMatch");

};


  return (
    <View style={styles.container}>

      {/* Rank Section */}
      <View style={styles.rankSection}>
        <Image
          source={{ uri: rank.icon }} // Replace with actual require() later
          style={styles.rankIcon}
        />
        <Text style={styles.rankText}>
          {rank.league} {rank.division ? `• ${rank.division}` : ""}
        </Text>
        <Text style={styles.srText}>SR: {sr}</Text>
      </View>

      {/* Division Progress */}
      <View style={styles.progressWrapper}>
        <View style={[styles.progressInner, { width: `${getSRPercent(sr, rank)}%` }]} />
      </View>

      {/* Rewards Preview */}
      <View style={styles.rewardBox}>
        <Text style={styles.rewardTitle}>Ranked Rewards</Text>
        <Text style={styles.rewardSubtitle}>Win matches to earn SR and climb divisions.</Text>
      </View>

      {/* Rules */}
      <View style={styles.rulesBox}>
        <Text style={styles.rulesTitle}>Rules</Text>
        <Text style={styles.ruleLine}>• Win to gain SR</Text>
        <Text style={styles.ruleLine}>• Lose → SR loss</Text>
        <Text style={styles.ruleLine}>• 3+ win streaks give bonus SR</Text>
        <Text style={styles.ruleLine}>• Season resets apply at season end</Text>
      </View>

      {/* START BUTTON */}
      {!searching ? (
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startText}>Start Ranked Match</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.searchBox}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.searchText}>Searching for Opponent…</Text>
        </View>
      )}

    </View>
  );
}

function getSRPercent(sr: number, rank: any) {
  const range = rank.maxSR - rank.minSR;
  const current = sr - rank.minSR;
  return Math.min(100, Math.max(0, (current / range) * 100));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingHorizontal: s(20),
    justifyContent: "flex-start",
    paddingTop: s(50),
  },

  rankSection: {
    alignItems: "center",
    marginBottom: s(20),
  },
  rankIcon: {
    width: s(110),
    height: s(110),
  },
  rankText: {
    color: "#fff",
    fontSize: s(26),
    marginTop: s(8),
    fontWeight: "600",
  },
  srText: {
    color: "#aaa",
    fontSize: s(18),
    marginTop: s(3),
  },

  progressWrapper: {
    width: "85%",
    alignSelf: "center",
    height: s(10),
    backgroundColor: "#333",
    borderRadius: s(6),
    overflow: "hidden",
    marginVertical: s(18),
  },
  progressInner: {
    height: s(10),
    backgroundColor: "#4CAF50",
  },

  rewardBox: {
    width: "100%",
    backgroundColor: "#191926",
    padding: s(20),
    borderRadius: s(12),
    marginBottom: s(25),
  },
  rewardTitle: {
    color: "#fff",
    fontSize: s(20),
    fontWeight: "600",
  },
  rewardSubtitle: {
    color: "#aaa",
    marginTop: s(6),
    fontSize: s(14),
  },

  rulesBox: {
    width: "100%",
    backgroundColor: "#13131d",
    padding: s(18),
    borderRadius: s(12),
    marginBottom: s(40),
  },
  rulesTitle: {
    color: "#fff",
    fontSize: s(18),
    marginBottom: s(10),
  },
  ruleLine: {
    color: "#aaa",
    fontSize: s(14),
    marginBottom: s(4),
  },

  startButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: s(18),
    borderRadius: s(14),
    alignItems: "center",
    marginTop: s(10),
  },
  startText: {
    color: "#fff",
    fontSize: s(18),
    fontWeight: "600",
  },

  searchBox: {
    alignItems: "center",
    marginTop: s(10),
  },
  searchText: {
    color: "#fff",
    marginTop: s(12),
    fontSize: s(16),
  },
});




