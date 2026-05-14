import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useHistoryStore } from "@/store/historyStore";

const pct = (value: number) => `${Math.round(value)}%`;

export default function StatisticsScreen() {
  const router = useRouter();

  const level = usePlayerStore((s) => s.level);
  const xp = usePlayerStore((s) => s.xp);
  const totalGamesPlayed = usePlayerStore((s) => s.totalGamesPlayed);
  const totalWins = usePlayerStore((s) => s.totalWins);
  const daily = usePlayerStore((s) => s.daily);
  const weekly = usePlayerStore((s) => s.weekly);
  const tournamentsPlayed = usePlayerStore((s) => s.tournamentsPlayed);
  const tournamentsWon = usePlayerStore((s) => s.tournamentsWon);
  const bestTournamentFinish = usePlayerStore((s) => s.bestTournamentFinish);
  const history = useHistoryStore((s) => s.history);

  const stats = useMemo(() => {
    const losses = Math.max(0, totalGamesPlayed - totalWins);
    const winRate = totalGamesPlayed > 0 ? (totalWins / totalGamesPlayed) * 100 : 0;

    const completedQuestions = history.reduce((sum, game) => sum + (game.totalQuestions ?? 0), 0);
    const correctAnswers = history.reduce((sum, game) => sum + (game.correctCount ?? game.score ?? 0), 0);
    const accuracy = completedQuestions > 0 ? (correctAnswers / completedQuestions) * 100 : 0;

    const modeCounts = history.reduce<Record<string, number>>((acc, game) => {
      const key = game.mode || "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const bestMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const recent = [...history].slice(-5).reverse();

    return { losses, winRate, completedQuestions, correctAnswers, accuracy, bestMode, recent };
  }, [history, totalGamesPlayed, totalWins]);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Real progress from your played games</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Level {level}</Text>
          <Text style={styles.heroValue}>{xp} XP</Text>
          <Text style={styles.heroSub}>🔥 Daily streak: {daily?.streak ?? 0} day{(daily?.streak ?? 0) === 1 ? "" : "s"}</Text>
        </View>

        <Text style={styles.section}>Performance</Text>
        <View style={styles.grid}>
          <Stat label="Games" value={totalGamesPlayed} />
          <Stat label="Wins" value={totalWins} />
          <Stat label="Losses" value={stats.losses} />
          <Stat label="Win Rate" value={pct(stats.winRate)} />
          <Stat label="Accuracy" value={pct(stats.accuracy)} />
          <Stat label="Questions" value={stats.completedQuestions} />
        </View>

        <Text style={styles.section}>Daily & Weekly</Text>
        <View style={styles.card}>
          <Line label="Daily streak" value={`${daily?.streak ?? 0} days`} />
          <Line label="Daily claims" value={daily?.totalClaims ?? 0} />
          <Line label="Weekly dailies" value={`${weekly?.progress ?? 0} / 5`} />
          <Line label="Weekly claimed" value={weekly?.claimed ? "Yes" : "No"} />
        </View>

        <Text style={styles.section}>Arena</Text>
        <View style={styles.card}>
          <Line label="Tournaments played" value={tournamentsPlayed} />
          <Line label="Tournaments won" value={tournamentsWon} />
          <Line label="Best finish" value={bestTournamentFinish ?? "—"} />
          <Line label="Most played mode" value={stats.bestMode} />
        </View>

        <Text style={styles.section}>Recent Games</Text>
        <View style={styles.card}>
          {stats.recent.length === 0 ? (
            <Text style={styles.empty}>No recorded games yet. Finish a game to build this history.</Text>
          ) : (
            stats.recent.map((game, index) => (
              <View key={`${game.date}-${index}`} style={styles.recentRow}>
                <View>
                  <Text style={styles.recentTitle}>{game.mode || "Game"}</Text>
                  <Text style={styles.recentSub}>{game.category || "General"}</Text>
                </View>
                <Text style={styles.recentScore}>{game.score ?? 0}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Line({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#101623" },
  content: { padding: 20, paddingBottom: 50 },
  back: { color: "#F5B942", fontSize: 16, marginBottom: 12, fontWeight: "700" },
  title: { color: "#F5B942", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#9AA3B2", marginTop: 4, marginBottom: 18 },
  heroCard: { backgroundColor: "#1A2032", borderWidth: 1, borderColor: "#3B4258", borderRadius: 18, padding: 18, marginBottom: 18 },
  heroLabel: { color: "#F5B942", fontSize: 16, fontWeight: "800" },
  heroValue: { color: "#FFF", fontSize: 30, fontWeight: "900", marginTop: 6 },
  heroSub: { color: "#F5B942", marginTop: 8, fontWeight: "700" },
  section: { color: "#E5E7EB", fontSize: 14, fontWeight: "800", marginTop: 16, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statBox: { width: "48%", backgroundColor: "#1A2032", borderWidth: 1, borderColor: "#333", borderRadius: 16, padding: 14, marginBottom: 12 },
  statValue: { color: "#F5B942", fontSize: 24, fontWeight: "900" },
  statLabel: { color: "#9AA3B2", marginTop: 4, fontWeight: "700" },
  card: { backgroundColor: "#1A2032", borderWidth: 1, borderColor: "#333", borderRadius: 16, padding: 14 },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  lineLabel: { color: "#9AA3B2", fontWeight: "700" },
  lineValue: { color: "#FFF", fontWeight: "800" },
  empty: { color: "#9AA3B2", lineHeight: 20 },
  recentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  recentTitle: { color: "#FFF", fontWeight: "800", textTransform: "capitalize" },
  recentSub: { color: "#9AA3B2", marginTop: 2, textTransform: "capitalize" },
  recentScore: { color: "#F5B942", fontWeight: "900", fontSize: 18 },
});

