import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { theme } from "../../src/lib/theme";
import { useRouter } from "expo-router";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../../src/lib/firebase";

export default function LiveLobby() {
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [status, setStatus] = useState("waiting");
  const [matchId, setMatchId] = useState<string>("");

  // For demo, use first available match in 'duel'
  useEffect(() => {
    const matchesRef = ref(rtdb, "matches/duel");
    const unsub = onValue(matchesRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      const ids = Object.keys(data);
      const match = data[ids[0]];
      setMatchId(match.id);
      setPlayers(Object.values(match.players || {}));
      setStatus(match.status);
    });
    return () => unsub();
  }, []);

  const handleStart = async () => {
    if (!matchId) return;
    await update(ref(rtdb, `matches/duel/${matchId}`), { status: "active" });
    router.push("/live/liveResults");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏟️ Live Lobby</Text>
      <Text style={styles.subtitle}>Status: {status}</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.playerCard}>
            <Text style={styles.playerName}>{item.name}</Text>
            <Text style={styles.score}>{item.score} pts</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>Waiting for players…</Text>}
      />
      {status === "waiting" && (
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.btnText}>Start Match</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: { color: theme.colors.accent, fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  subtitle: { color: theme.colors.text, marginBottom: 20 },
  text: { color: theme.colors.text },
  playerCard: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    width: 250,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  playerName: { color: "#fff", fontWeight: "600" },
  score: { color: theme.colors.accent },
  button: {
    marginTop: 20,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
