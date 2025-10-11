import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../src/lib/theme";
import { auth } from "../../src/lib/firebase";
import { createMatch, joinMatch } from "../../src/live/liveEngine";
import { randomName } from "../../src/live/liveUtils";
import ArenaCountdown from "../../src/components/ArenaCountdown";

export default function DuelScreen() {
  const [status, setStatus] = useState<"idle" | "countdown" | "active" | "searching">("idle");
  const router = useRouter();
  const user = auth.currentUser || { uid: "anon", displayName: randomName() };
  const startMatch = async () => {
    setStatus("searching");

    const player = {
      uid: user.uid,
      name: user.displayName!,
      score: 0,
      ready: true,
    };

    const match = await joinMatch("duel", player);
    if (!match) await createMatch("duel", player);

    // Start countdown before entering the lobby
    setStatus("countdown");
  };

  const handleCountdownComplete = () => {
    setStatus("active");
    router.push("/live/liveLobby");
  };

  return (
    <View style={styles.container}>
      {status === "idle" && (
        <>
          <Text style={styles.title}>⚔️ Duel Mode</Text>
          <TouchableOpacity style={styles.button} onPress={startMatch}>
            <Text style={styles.btnText}>Find Opponent</Text>
          </TouchableOpacity>
        </>
      )}

      {status === "searching" && (
        <Text style={styles.searching}>Searching for opponent...</Text>
      )}

      {status === "countdown" && <ArenaCountdown onComplete={handleCountdownComplete} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: theme.colors.primary,
    fontSize: 28,
    marginBottom: 40,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: 16,
    borderRadius: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
  },
  searching: {
    color: theme.colors.secondary,
    fontSize: 18,
  },
});
