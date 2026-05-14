import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { s } from "@/arena/theme/arenaSizing";

import { useTournamentStore } from "@/arena/store/useTournamentStore";
export default function TournamentLobby() {
  const {
    tournament,
    startTournament,
  } = useTournamentStore();

  // --------------------------------------------
  // EMPTY STATE (PRESERVED)
  // --------------------------------------------
  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>No active tournament.</Text>
      </View>
    );
  }

  const { players, status, config } = tournament;

  // original logic:
  // players.length === 8 && status === "lobby"
  const ready =
    players.length === config.maxPlayers &&
    status === "waiting";

  // --------------------------------------------
  // START HANDLER
  // --------------------------------------------
  const handleStart = () => {
    startTournament();
    router.replace("/(app)/arena_reset/tournaments/TournamentBracket");
  };

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tournament Lobby</Text>

      <Text style={styles.sub}>
        Players Joined: {players.length} / {config.maxPlayers}
      </Text>

      <View style={styles.playersBox}>
        {players.map((p, idx) => (
          <Text key={p.uid ?? idx} style={styles.player}>
            • {p.username}
          </Text>
        ))}
      </View>

      {ready ? (
        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.72}>
          <Text style={styles.startText}>Start Tournament</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.waiting}>
          Waiting for players…
        </Text>
      )}
    </View>
  );
}

// --------------------------------------------
// STYLES (1:1 UX PRESERVED)
// --------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    alignItems: "center",
    paddingTop: s(60),
    paddingHorizontal: s(20),
  },

  title: {
    color: "#FFD54F",
    fontSize: s(28),
    fontWeight: "800",
    marginBottom: s(20),
  },

  sub: {
    color: "#aaa",
    fontSize: s(16),
    marginBottom: s(20),
  },

  playersBox: {
    width: "85%",
    backgroundColor: "#151521",
    padding: s(20),
    borderRadius: s(14),
    marginBottom: s(30),
  },

  player: {
    color: "#fff",
    fontSize: s(14),
    marginBottom: s(6),
  },

  startBtn: {
    backgroundColor: "#FFD54F",
    paddingVertical: s(16),
    width: "85%",
    borderRadius: s(14),
  },

  startText: {
    textAlign: "center",
    fontSize: s(18),
    fontWeight: "700",
    color: "#000",
  },

  waiting: {
    color: "#aaa",
    fontSize: s(16),
  },

  info: {
    color: "#fff",
    fontSize: s(18),
  },
});


