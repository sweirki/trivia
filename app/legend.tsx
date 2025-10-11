// app/legend.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { theme } from "../src/lib/theme";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPlayerRankData, rankColor } from "../src/lib/rankEngine";
import { getPlayerAchievements } from "../src/lib/achievementsEngine";
import { MotiView } from "moti";

/** Compute progress % toward next tier */
function nextTierProgress(xp: number): { next: string; progress: number } {
  const tiers = [
    { name: "Bronze", xp: 0 },
    { name: "Silver", xp: 1000 },
    { name: "Gold", xp: 3000 },
    { name: "Platinum", xp: 7000 },
    { name: "Diamond", xp: 15000 },
    { name: "Master", xp: 30000 },
    { name: "Legend", xp: 60000 },
  ];
  let currentIndex = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (xp >= tiers[i].xp) currentIndex = i;
  }
  const current = tiers[currentIndex];
  const next = tiers[Math.min(currentIndex + 1, tiers.length - 1)];
  const range = next.xp - current.xp || 1;
  const progress = currentIndex === tiers.length - 1 ? 1 : (xp - current.xp) / range;
  return { next: next.name, progress };
}

export default function LegendHub() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("Player");
  const [xp, setXP] = useState<number>(0);
  const [rank, setRank] = useState<string>("—");
  const [nextRank, setNextRank] = useState<string>("—");
  const [progress, setProgress] = useState<number>(0);
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const uid = await AsyncStorage.getItem("uid");
        const name = (await AsyncStorage.getItem("username")) ?? "Player";
        setUsername(name);

        if (!uid) return;

        const rankData = await getPlayerRankData(uid);
        if (rankData) {
          setXP(rankData.xp);
          setRank(rankData.rank);
          const { next, progress } = nextTierProgress(rankData.xp);
          setNextRank(next);
          setProgress(progress);
        }

        const myBadges = await getPlayerAchievements(uid);
        setBadges(myBadges);
      } catch (e) {
        console.error("Legend Hub load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your legend profile...</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>🏆 Legend Hub</Text>
        <Text style={styles.username}>{username}</Text>

        {/* Rank Ring */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "timing", duration: 600 }}
          style={[styles.rankRing, { borderColor: rankColor(rank) }]}
        >
          <Text style={[styles.rankText, { color: rankColor(rank) }]}>{rank}</Text>
          <Text style={styles.xp}>{xp} XP</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%`, backgroundColor: rankColor(rank) },
              ]}
            />
          </View>
          <Text style={styles.nextRank}>
            {rank === "Legend" ? "🌟 Max Rank Achieved" : `Next: ${nextRank}`}
          </Text>
        </MotiView>

        {/* Badge Wall */}
        <Text style={styles.sectionTitle}>🏅 Achievements</Text>
        <View style={styles.badgeWall}>
          {badges.length === 0 ? (
            <Text style={styles.noBadge}>No badges yet</Text>
          ) : (
            badges.map((b) => (
              <MotiView
                key={b.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 400 }}
                style={styles.badgeCard}
              >
                <Text style={[styles.badgeIcon, { color: b.color }]}>{b.icon}</Text>
                <Text style={styles.badgeName}>{b.name}</Text>
              </MotiView>
            ))
          )}
        </View>

        {/* Navigation Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/leaderboard")}
        >
          <Text style={styles.btnText}>🌍 View Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={() => router.push("/")}
        >
          <Text style={styles.btnText}>🏠 Return Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: theme.colors.subtext },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  username: { fontSize: 20, color: theme.colors.text, marginBottom: 30 },
  rankRing: {
    borderWidth: 4,
    borderRadius: 140,
    padding: 20,
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  rankText: { fontSize: 28, fontWeight: "bold" },
  xp: { fontSize: 16, color: theme.colors.text, marginVertical: 6 },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border ?? "#333",
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 4 },
  nextRank: { fontSize: 14, color: theme.colors.subtext, marginTop: 6 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 12,
  },
  badgeWall: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 30,
  },
  badgeCard: {
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 10,
    width: 80,
    height: 80,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  badgeIcon: { fontSize: 28 },
  badgeName: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: "center",
    marginTop: 4,
  },
  noBadge: { color: theme.colors.subtext, marginBottom: 20 },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 16,
    marginVertical: 6,
  },
  btnText: { color: theme.colors.buttonText, fontSize: 16, fontWeight: "bold" },
});
