// app/leaderboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { theme } from "../src/lib/theme";
import {
  getTopPlayers,
  getTopPlayersByCountry,
  getFriendsLeaderboard,
} from "../src/lib/leaderboardEngine";
import { getPlayerAchievements } from "../src/lib/achievementsEngine";
import { getPlayerRankData, rankColor, determineRank } from "../src/lib/rankEngine";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MotiView } from "moti";

/** Compute progress toward next tier */
function progressToNextTier(xp: number): number {
  const tiers = [0, 1000, 3000, 7000, 15000, 30000, 60000];
  for (let i = 0; i < tiers.length - 1; i++) {
    if (xp >= tiers[i] && xp < tiers[i + 1]) {
      const diff = tiers[i + 1] - tiers[i];
      return (xp - tiers[i]) / diff;
    }
  }
  return 1;
}

export default function LeaderboardScreen() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"global" | "regional" | "friends">("global");
  const [refreshing, setRefreshing] = useState(false);
  const [country, setCountry] = useState<string>("Unknown");
  const [friends, setFriends] = useState<string[]>([]);

  const loadData = async (selected: typeof filter = filter) => {
    setLoading(true);
    try {
      const storedCountry = (await AsyncStorage.getItem("country")) ?? "Unknown";
      const storedFriends = JSON.parse((await AsyncStorage.getItem("friends")) ?? "[]");
      setCountry(storedCountry);
      setFriends(storedFriends);

      let data: any[] = [];
      if (selected === "regional") data = await getTopPlayersByCountry(storedCountry);
      else if (selected === "friends") data = await getFriendsLeaderboard(storedFriends);
      else data = await getTopPlayers();

      // 🧠 Enrich with achievements + rank info
      const enriched = await Promise.all(
        data.map(async (p) => {
          const badges = await getPlayerAchievements(p.uid);
          const rankData = await getPlayerRankData(p.uid);
          const rankName = rankData?.rank ?? "—";
          const color = rankColor(rankName);
          const progress = progressToNextTier(rankData?.xp ?? 0);
          return { ...p, badges, rankData, rankName, color, progress };
        })
      );

      setPlayers(enriched);
    } catch (e) {
      console.error("Leaderboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [filter]);

  const FilterButton = ({ label, value }: { label: string; value: typeof filter }) => (
    <TouchableOpacity
      style={[styles.filterBtn, filter === value && styles.activeBtn]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          { color: filter === value ? theme.colors.background : theme.colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {filter === "global"
          ? "🌍 Global Leaderboard"
          : filter === "regional"
          ? `🌎 ${country} Leaderboard`
          : "🤝 Friends Leaderboard"}
      </Text>

      <View style={styles.filtersRow}>
        <FilterButton label="Global" value="global" />
        <FilterButton label="My Country" value="regional" />
        <FilterButton label="Friends" value="friends" />
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.uid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay: index * 40 }}
            style={styles.row}
          >
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.username}</Text>
              <Text style={styles.sub}>
                {item.country ?? "—"} • Streak {item.streak}
              </Text>

              {/* 🏅 Achievements */}
              <View style={styles.badgeRow}>
                {item.badges?.slice(0, 3).map((b: any) => (
                  <Text key={b.id} style={[styles.badge, { color: b.color }]}>
                    {b.icon}
                  </Text>
                ))}
              </View>

              {/* 🧱 Rank + XP Bar */}
              {item.rankData && (
                <View style={styles.rankBox}>
                  <Text
                    style={[
                      styles.rankText,
                      { color: item.color },
                    ]}
                  >
                    {item.rankName} • {item.rankData.xp} XP
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(100, item.progress * 100)}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>

            <Text style={styles.score}>{item.score}</Text>
          </MotiView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginHorizontal: 6,
  },
  activeBtn: { backgroundColor: theme.colors.primary },
  filterText: { fontSize: 14, fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rank: { width: 30, fontSize: 18, fontWeight: "bold", color: theme.colors.accent },
  info: { flex: 1 },
  name: { fontSize: 16, color: theme.colors.text },
  sub: { fontSize: 12, color: theme.colors.subtext },
  score: { fontSize: 16, fontWeight: "bold", color: theme.colors.success },
  badgeRow: { flexDirection: "row", marginTop: 4 },
  badge: { fontSize: 16, marginRight: 4 },
  rankBox: { marginTop: 6 },
  rankText: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border ?? "#222",
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
});
