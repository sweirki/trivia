import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

const tournamentLobbyHero = require("../../../../assets/images/arena/tournaments/tournament_lobby_hero.webp");

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
      <ImageBackground source={tournamentLobbyHero} imageStyle={styles.bgImage} style={styles.container}>
        <View style={styles.bgShade} />
        <Text style={styles.info}>No active tournament.</Text>
      </ImageBackground>
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
    <ImageBackground source={tournamentLobbyHero} imageStyle={styles.bgImage} style={styles.container}>
      <View style={styles.bgShade} />
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
    </ImageBackground>
  );
}

// --------------------------------------------
// STYLES (1:1 UX PRESERVED)
// --------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050716",
    alignItems: "center",
    paddingTop: s(72),
    paddingHorizontal: s(18),
  },

  bgImage: {
    opacity: 1,
  },
  bgShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 20, 0.64)",
  },

  title: {
    color: "#D6A93A",
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
    backgroundColor: "#121724",
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
    backgroundColor: "#D6A93A",
    borderWidth: 1,
    borderColor: "rgba(255,231,158,0.42)",
    paddingVertical: s(16),
    width: "85%",
    borderRadius: s(14),
  },

  startText: {
    textAlign: "center",
    fontSize: s(18),
    fontWeight: "700",
    color: "#0B1020",
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


