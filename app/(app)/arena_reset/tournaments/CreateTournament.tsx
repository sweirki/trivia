import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useTournamentStore } from "@/arena/store/useTournamentStore";

import { useTournamentUIStore } from "./store/useTournamentUIStore";

export default function CreateTournament() {
  const { createTournament } = useTournamentStore();
  const { setLobby } = useTournamentUIStore();

  const handleCreate = () => {
    createTournament({
      id: `t-${Date.now()}`,
      name: "Quick Tournament",
      createdAt: Date.now(),
      startsAt: Date.now(),
      status: "waiting",
      currentStage: "qualifier",
      config: {
        maxPlayers: 8,
        entryFeeCoins: 0,
        rewardCoins: 100,
        questionsPerMatch: 5,
        timePerQuestion: 15,
      },
      players: [],
    });

    setLobby(true);
    router.push("/(app)/arena_reset/tournaments/TournamentLobby");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Tournament</Text>

      <TouchableOpacity style={styles.btn} onPress={handleCreate} activeOpacity={0.72}>
        <Text style={styles.btnText}>Start Lobby</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  btn: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 10,
  },
  btnText: { color: "#fff", textAlign: "center" },
});


