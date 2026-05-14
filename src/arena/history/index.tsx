import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useArenaRankSystem } from "@/arena/store/useArenaRankSystem";
import { s } from "@/arena/theme/arenaSizing";

// --------------------------------------------------
// ARENA HUB
// --------------------------------------------------
export default function ArenaHub() {
  const { rank, sr, season } = useArenaRankSystem();

  const hasRank =
    !!rank &&
    typeof rank.minSR === "number" &&
    typeof rank.maxSR === "number";

  const progressPercent = hasRank
    ? getSRPercent(sr, rank)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* ------------------------------------ */}
      {/* RANK SECTION */}
      {/* ------------------------------------ */}
      {!hasRank ? (
        <Text style={styles.loadingText}>
          Loading Arena…
        </Text>
      ) : (
        <>
          <View style={styles.rankSection}>
            <Image
              source={{ uri: rank.icon }}
              style={styles.rankIcon}
            />

            <Text style={styles.rankName}>
              {rank.league}
              {rank.division ? ` • ${rank.division}` : ""}
            </Text>

            <Text style={styles.srLabel}>SR {sr}</Text>
          </View>

          {/* ------------------------------------ */}
          {/* PROGRESS BAR */}
          {/* ------------------------------------ */}
          <View style={styles.progressBarWrapper}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>

          {/* ------------------------------------ */}
          {/* SEASON */}
          {/* ------------------------------------ */}
          <View style={styles.seasonBox}>
            <Text style={styles.seasonTitle}>
              Season {season}
            </Text>
            <Text style={styles.seasonSubtitle}>
              Ends in 12d 4h
            </Text>
          </View>

          {/* ------------------------------------ */}
          {/* ARENA MODES */}
          {/* ------------------------------------ */}
          <View style={styles.modesWrapper}>
            <ArenaButton
              label="Ranked Arena"
              onPress={() =>
                router.push("/(app)/arena_reset/ranked")
              }
            />
            <ArenaButton
              label="Survival Arena"
              onPress={() =>
                router.push("/(app)/arena_reset/survival")
              }
            />
            <ArenaButton
              label="Power-Up Arena"
              onPress={() =>
                router.push("/(app)/arena_reset/power")
              }
            />
            <ArenaButton
              label="Tournaments"
              onPress={() =>
                router.push("/(app)/arena_reset/tournaments")
              }
            />
          </View>

          {/* ------------------------------------ */}
          {/* HISTORY */}
          {/* ------------------------------------ */}
          <TouchableOpacity
            style={styles.historyBox}
            onPress={() => {
              router.push("../arena_reset/history");
            }}
            activeOpacity={0.72}
          >
            <Text style={styles.historyTitle}>
              Match History
            </Text>
            <Text style={styles.historySubtitle}>
              View your recent ranked games
            </Text>
          </TouchableOpacity>

          {/* ------------------------------------ */}
          {/* ARENA PASS */}
          {/* ------------------------------------ */}
          <TouchableOpacity style={styles.passBox} activeOpacity={0.72}>
            <Text style={styles.passTitle}>
              Arena Pass
            </Text>
            <Text style={styles.passSubtitle}>
              Unlock premium rewards
            </Text>
          </TouchableOpacity>

          {/* ------------------------------------ */}
          {/* ARENA SHOP */}
          {/* ------------------------------------ */}
          <TouchableOpacity
            style={styles.shopBox}
            onPress={() => {
              router.push("/store");
            }}
            activeOpacity={0.72}
          >
            <Text style={styles.shopText}>
              Arena Shop
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------
function getSRPercent(sr: number, rank: any) {
  const range = rank.maxSR - rank.minSR;
  if (range <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, ((sr - rank.minSR) / range) * 100)
  );
}

function ArenaButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.modeButton}
      onPress={onPress}
     activeOpacity={0.72}>
      <Text style={styles.modeText}>{label}</Text>
    </TouchableOpacity>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
  },
  content: {
    alignItems: "center",
    paddingBottom: s(50),
  },

  loadingText: {
    color: "#aaa",
    marginTop: s(60),
    fontSize: s(16),
  },

  // Rank
  rankSection: {
    marginTop: s(40),
    alignItems: "center",
  },
  rankIcon: {
    width: s(110),
    height: s(110),
  },
  rankName: {
    color: "#fff",
    fontSize: s(26),
    marginTop: s(10),
    fontWeight: "600",
  },
  srLabel: {
    color: "#aaa",
    fontSize: s(18),
    marginTop: s(4),
  },

  // Progress
  progressBarWrapper: {
    width: "80%",
    height: s(10),
    backgroundColor: "#333",
    borderRadius: s(5),
    overflow: "hidden",
    marginVertical: s(20),
  },
  progressBar: {
    height: s(10),
    backgroundColor: "#4CAF50",
  },

  // Season
  seasonBox: {
    width: "85%",
    backgroundColor: "#1b1b27",
    padding: s(20),
    borderRadius: s(12),
    alignItems: "center",
    marginBottom: s(25),
  },
  seasonTitle: {
    color: "#fff",
    fontSize: s(20),
  },
  seasonSubtitle: {
    color: "#aaa",
    fontSize: s(14),
    marginTop: s(4),
  },

  // Modes
  modesWrapper: {
    width: "100%",
    alignItems: "center",
    gap: s(15),
  },
  modeButton: {
    width: "85%",
    backgroundColor: "#272737",
    paddingVertical: s(18),
    borderRadius: s(14),
  },
  modeText: {
    color: "#fff",
    textAlign: "center",
    fontSize: s(18),
  },

  // History
  historyBox: {
    width: "85%",
    backgroundColor: "#21212d",
    padding: s(18),
    borderRadius: s(14),
    marginTop: s(30),
  },
  historyTitle: {
    color: "#fff",
    fontSize: s(18),
    textAlign: "center",
  },
  historySubtitle: {
    color: "#aaa",
    fontSize: s(13),
    textAlign: "center",
    marginTop: s(4),
  },

  // Pass
  passBox: {
    width: "85%",
    backgroundColor: "#151521",
    padding: s(20),
    borderRadius: s(14),
    marginTop: s(25),
  },
  passTitle: {
    color: "#fff",
    fontSize: s(20),
  },
  passSubtitle: {
    color: "#aaa",
    fontSize: s(14),
    marginTop: s(4),
  },

  // Shop
  shopBox: {
    width: "85%",
    backgroundColor: "#21212d",
    padding: s(18),
    borderRadius: s(14),
    marginTop: s(25),
  },
  shopText: {
    color: "#fff",
    textAlign: "center",
    fontSize: s(18),
  },
});


