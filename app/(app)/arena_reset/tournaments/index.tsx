import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { s } from "@/arena/theme/arenaSizing";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { useQuickGameStore } from "@/store/useQuickGameStore";

export default function TournamentEntry() {
  // --------------------------------------------------
  // STORE
  // --------------------------------------------------
  const tournament = useTournamentStore(s => s.tournament);
  const joinTournament = useTournamentStore(s => s.joinTournament);

  // --------------------------------------------------
  // LOCAL STATE
  // --------------------------------------------------
  const [countdown, setCountdown] = useState("TBA");

  // --------------------------------------------------
  // DERIVED DATA (SAFE)
  // --------------------------------------------------
  const startTime = tournament
    ? tournament.createdAt + 60_000
    : null;

  const rules = tournament
    ? [
        `${tournament.config.questionsPerMatch} questions per match`,
        `${tournament.config.timePerQuestion}s per question`,
      ]
    : [];

  // --------------------------------------------------
  // COUNTDOWN TIMER
  // --------------------------------------------------
  useEffect(() => {
    if (!startTime) {
      setCountdown("TBA");
      return;
    }

    const update = () => {
      const diff = startTime - Date.now();

      if (diff <= 0) {
        setCountdown("STARTING NOW!");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${h}h ${m}m ${s}s`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  // --------------------------------------------------
  // JOIN
  // --------------------------------------------------
const handleJoin = () => {
  
  const questionsCount =
    tournament?.config.questionsPerMatch ?? 10;

  // START TOURNAMENT GAME
  useQuickGameStore
    .getState()
    .initTournamentGame(null, questionsCount);

  // GO DIRECTLY TO GAMEPLAY
  router.push("/(app)/play/game");

};


  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <View style={styles.container}>
      {!tournament ? (
        <Text style={styles.error}>
          No active tournament available.
        </Text>
      ) : (
        <>
          <Text style={styles.title}>{tournament.name}</Text>
          <Text style={styles.modeType}>Arena Tournament</Text>

          {/* Countdown */}
          <View style={styles.countdownBox}>
            <Text style={styles.countdownLabel}>Starts In</Text>
            <Text style={styles.countdownValue}>{countdown}</Text>
          </View>

          {/* Prize */}
          <View style={styles.prizeBox}>
            <Text style={styles.prizeLabel}>Prize Pool</Text>
            <Text style={styles.prizeValue}>
              {tournament.config.rewardCoins} Coins
            </Text>
          </View>

          {/* Entry Fee */}
          <View style={styles.entryBox}>
            <Text style={styles.entryLabel}>Entry Fee</Text>
            <Text style={styles.entryValue}>
              {tournament.config.entryFeeCoins} Coins
            </Text>
          </View>

          {/* Rules */}
          <View style={styles.rulesBox}>
            <Text style={styles.rulesTitle}>Rules</Text>
            {rules.length === 0 ? (
              <Text style={styles.rule}>No special rules.</Text>
            ) : (
              rules.map((r, i) => (
                <Text key={i} style={styles.rule}>• {r}</Text>
              ))
            )}
          </View>
<Text style={styles.repeatableNote}>
  You can join multiple times. Each entry costs coins.
</Text>

          {/* Join */}
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
            <Text style={styles.joinText}>Join Tournament</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

// --------------------------------------------------
// STYLES (UNCHANGED)
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingTop: s(50),
    paddingHorizontal: s(20),
    alignItems: "center",
  },

  title: {
    color: "#FFD54F",
    fontSize: s(32),
    fontWeight: "800",
    marginBottom: s(6),
  },
  
repeatableNote: {
  color: "#888",
  fontSize: s(13),
  marginBottom: s(12),
  textAlign: "center",
},

  modeType: {
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
    marginBottom: s(30),
  },
  countdownLabel: { color: "#aaa", fontSize: s(16) },
  countdownValue: {
    color: "#FFD54F",
    fontSize: s(26),
    fontWeight: "700",
    marginTop: s(4),
  },

  prizeBox: {
    backgroundColor: "#151521",
    width: "85%",
    padding: s(20),
    borderRadius: s(14),
    alignItems: "center",
    marginBottom: s(20),
  },
  prizeLabel: { color: "#aaa", fontSize: s(16) },
  prizeValue: {
    color: "#4FC3F7",
    fontSize: s(26),
    fontWeight: "700",
  },

  entryBox: {
    backgroundColor: "#151521",
    width: "85%",
    padding: s(20),
    borderRadius: s(14),
    alignItems: "center",
    marginBottom: s(30),
  },
  entryLabel: { color: "#aaa", fontSize: s(16) },
  entryValue: {
    color: "#E53935",
    fontSize: s(26),
    fontWeight: "700",
  },

  rulesBox: {
    backgroundColor: "#14141e",
    width: "85%",
    padding: s(20),
    borderRadius: s(14),
    marginBottom: s(40),
  },
  rulesTitle: {
    color: "#fff",
    fontSize: s(20),
    marginBottom: s(10),
    textAlign: "center",
  },
  rule: { color: "#aaa", fontSize: s(14), marginBottom: s(6) },

  joinBtn: {
    backgroundColor: "#FFD54F",
    paddingVertical: s(16),
    width: "85%",
    borderRadius: s(14),
  },
  joinText: {
    textAlign: "center",
    fontSize: s(18),
    fontWeight: "700",
    color: "#000",
  },

  error: { color: "#fff", fontSize: s(20), marginTop: s(40) },
});

