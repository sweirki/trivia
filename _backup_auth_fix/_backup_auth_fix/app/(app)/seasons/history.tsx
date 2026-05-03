import { View, Text, StyleSheet, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { app } from "@/firebase/firebase";
import { badgeLabel } from "@/seasons/badges";

import {
  listSeasonHistory,
  ArchivedSeason,
} from "@/seasons/seasonHistoryService";

export default function SeasonHistoryScreen() {
  const [history, setHistory] = useState<ArchivedSeason[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    listSeasonHistory(uid)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtle}>Loading season history…</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Season History</Text>
        <Text style={styles.subtle}>No completed seasons yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Season History</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.seasonId}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.seasonId}>Season {item.seasonId}</Text>
            <Text style={styles.row}>
              Final Tier: <Text style={styles.value}>{item.finalTier}</Text>
            </Text>
            <Text style={styles.row}>
              Season XP: <Text style={styles.value}>{item.finalXp}</Text>
            </Text>
            <Text style={styles.row}>
              Rewards Claimed:{" "}
              <Text style={styles.value}>
                {item.claimedTiers.length}
              </Text>
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  subtle: {
    color: "#aaa",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#151515",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  seasonId: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  row: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 2,
  },
  value: {
    color: "#fff",
    fontWeight: "500",
  },
});
