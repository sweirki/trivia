import React, { useEffect, useState } from "react";
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
import { useRef } from "react";

export default function TournamentWaitingRoom() {
  const [startTime, setStartTime] = useState<number | null>(null);

  const tournament = useTournamentStore(s => s.tournament);
const startTournament = useTournamentStore(s => s.startTournament);
const resetTournament = useTournamentStore(s => s.resetTournament);
const startTimeRef = useRef<number | null>(null);
const lockTournament = useTournamentStore(s => s.lockTournament);


  const [countdown, setCountdown] = useState("TBA");

  // --------------------------------------------------
  // DERIVED DATA
  // --------------------------------------------------




useEffect(() => {
  if (!tournament) return;
  if (startTime !== null) return;

  setStartTime(Date.now() + 10_000); // 10s demo
}, [tournament, startTime]);


  // --------------------------------------------------
  // COUNTDOWN TIMER (PRESERVED)
  // --------------------------------------------------
  useEffect(() => {
    if (!startTime) {
      setCountdown("TBA");
      return;
    }

    const update = () => {
      const now = Date.now();
      const diff = startTime - now;

    if (diff <= 0) {
  setCountdown("STARTING");
lockTournament();
startTournament();
setStartTime(null);

router.replace("/(app)/arena_reset/tournaments/TournamentBracket");
return;

}


      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      setCountdown(`${mins}:${secs < 10 ? "0" + secs : secs}`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  // --------------------------------------------------
  // LEAVE HANDLER
  // --------------------------------------------------
 const handleLeave = () => {
  resetTournament();
  router.replace("/(app)/arena_reset/tournaments");
};


  // --------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------
 

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
  <ImageBackground source={tournamentLobbyHero} imageStyle={styles.bgImage} style={styles.container}>
    <View style={styles.bgShade} />
    {!tournament ? (
      <Text style={styles.error}>Tournament not found.</Text>
    ) : (
      <>
        <Text style={styles.title}>{tournament.name}</Text>

        <Text style={styles.subTitle}>Tournament starts soon</Text>

        {/* Countdown */}
        <View style={styles.countdownBox}>
          <Text style={styles.countdownLabel}>Starts In</Text>
          <Text style={styles.countdownValue}>{countdown}</Text>
        </View>

        {/* Players Joined */}
        <View style={styles.playersBox}>
          <Text style={styles.playersLabel}>Players Joined</Text>
          <Text style={styles.playersValue}>
            {tournament.players.length} / {tournament.config.maxPlayers}
          </Text>
        </View>

        {/* Prize Pool */}
        <View style={styles.prizeBox}>
          <Text style={styles.prizeLabel}>Prize Pool</Text>
          <Text style={styles.prizeValue}>
            {tournament.config.rewardCoins} Coins
          </Text>
        </View>

        {/* Leave */}
        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave} activeOpacity={0.72}>
          <Text style={styles.leaveText}>Leave Tournament</Text>
        </TouchableOpacity>
      </>
    )}
  </ImageBackground>
);

}

// --------------------------------------------------
// STYLES (UX PRESERVED)
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050716",
    paddingTop: s(72),
    paddingHorizontal: s(18),
    alignItems: "center",
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
    fontSize: s(30),
    fontWeight: "800",
  },

  subTitle: {
    color: "#aaa",
    fontSize: s(16),
    marginBottom: s(30),
  },

  countdownBox: {
    backgroundColor: "#1b1b27",
    width: "85%",
    padding: s(20),
    borderRadius: s(14),
    alignItems: "center",
    marginBottom: s(25),
  },
  countdownLabel: { color: "#aaa", fontSize: s(14) },
  countdownValue: {
    color: "#D6A93A",
    fontSize: s(28),
    fontWeight: "700",
    marginTop: s(6),
  },

  playersBox: {
    backgroundColor: "#121724",
    width: "85%",
    padding: s(20),
    borderRadius: s(14),
    alignItems: "center",
    marginBottom: s(25),
  },
  playersLabel: { color: "#aaa", fontSize: s(14) },
  playersValue: {
    color: "#6EC7F2",
    fontSize: s(26),
    marginTop: s(6),
    fontWeight: "700",
  },

  prizeBox: {
    backgroundColor: "#121724",
    width: "85%",
    padding: s(20),
    borderRadius: s(14),
    alignItems: "center",
    marginBottom: s(40),
  },
  prizeLabel: { color: "#aaa", fontSize: s(14) },
  prizeValue: {
    color: "#B34D4D",
    fontSize: s(26),
    marginTop: s(6),
    fontWeight: "700",
  },

  leaveBtn: {
    backgroundColor: "#B34D4D",
    paddingVertical: s(16),
    paddingHorizontal: s(40),
    borderRadius: s(14),
  },
  leaveText: {
    color: "#fff",
    fontSize: s(18),
  },

  error: {
    color: "#fff",
    fontSize: s(20),
  },
});




