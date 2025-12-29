import React from "react";
import { StyleSheet, Image, ScrollView } from "react-native";
import { Text, View, useTheme } from "@/theme";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function ProfileScreen() {
  const theme = useTheme();

  const {
    level,
    xp,
    tournamentsPlayed,
    tournamentsWon,
    bestTournamentFinish,
    titles,
    tournamentHistory,
  } = usePlayerStore();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ============================
          AVATAR
      ============================ */}
      <Image
        source={require("@assets/images/avatar.png")}
        style={styles.avatar}
      />

      {/* ============================
          HEADER
      ============================ */}
      <Text style={[theme.typography.h1, styles.title]}>
        Player Profile
      </Text>

      <Text style={[theme.typography.body, styles.sub]}>
        Level {level} • XP {xp}
      </Text>

      {/* ============================
          STATS
      ============================ */}
      <View style={styles.statsRow}>
        <Stat label="Tournaments" value={tournamentsPlayed} />
        <Stat label="Wins" value={tournamentsWon} />
        <Stat
          label="Best Finish"
          value={bestTournamentFinish ?? "—"}
        />
      </View>

      {/* ============================
          TITLES
      ============================ */}
      <View style={styles.section}>
        <Text style={theme.typography.h2}>Titles</Text>

        {titles.length === 0 ? (
          <Text style={[theme.typography.body, styles.empty]}>
            No titles yet — win or place in tournaments to earn some.
          </Text>
        ) : (
          <View style={styles.titlesWrap}>
            {titles.map((t) => (
              <View key={t} style={styles.titlePill}>
                <Text style={styles.titleText}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ============================
          TOURNAMENT HISTORY
      ============================ */}
      <View style={styles.section}>
        <Text style={theme.typography.h2}>Tournament History</Text>

        {tournamentHistory.length === 0 ? (
          <Text style={[theme.typography.body, styles.empty]}>
            You haven’t completed any tournaments yet.
          </Text>
        ) : (
          tournamentHistory.map((h, index) => (
            <View key={index} style={styles.historyRow}>
              <Text style={styles.historyText}>
                {h.position === 1 ? "🏆 Champion" : `#${h.position}`} •{" "}
                {h.totalPlayers} players
              </Text>
              <Text style={styles.historyDate}>
                {new Date(h.timestamp).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

/* ============================
   COMPONENTS
============================ */

function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ============================
   STYLES
============================ */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginTop: 20,
    marginBottom: 12,
  },

  title: {
    marginTop: 8,
  },

  sub: {
    marginTop: 6,
    opacity: 0.7,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 16,
  },

  statBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#1e1e2a",
    alignItems: "center",
    minWidth: 90,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    color: "#fff",
  },

  section: {
    width: "100%",
    marginTop: 32,
  },

  empty: {
    marginTop: 8,
    opacity: 0.6,
  },

  titlesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },

  titlePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#2c2c3d",
  },

  titleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFD54F",
  },

  historyRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a3a",
  },

  historyText: {
    color: "#fff",
    fontSize: 14,
  },

  historyDate: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
});
