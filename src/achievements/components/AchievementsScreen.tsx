// app/achievements/AchievementsScreen.tsx

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { db } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import AchievementBadge from "./AchievementBadge";
import AchievementModal from "./AchievementModal";
import { ACHIEVEMENTS } from "../../achievements/achievementDefinitions";
import { auth } from "@/firebase/firebase";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useHistoryStore } from "@/store/historyStore";

function getMaxWinStreak(history: any[]) {
  let current = 0;
  let best = 0;

  history.forEach((game) => {
    if (game?.won) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  });

  return best;
}

function getLocalUnlockedIds({
  history,
  totalGamesPlayed,
  totalWins,
  dailyStreak,
  coins,
}: {
  history: any[];
  totalGamesPlayed: number;
  totalWins: number;
  dailyStreak: number;
  coins: number;
}) {
  const unlocked = new Set<string>();
  const losses = Math.max(0, totalGamesPlayed - totalWins);
  const maxWinStreak = getMaxWinStreak(history);

  if (totalGamesPlayed >= 1) unlocked.add("G1_01_FIRST_GAME");
  if (totalWins >= 1) unlocked.add("G1_02_FIRST_WIN");
  if (losses >= 1 || history.some((game) => game?.won === false)) unlocked.add("G1_03_FIRST_LOSS");
  if (dailyStreak >= 2) unlocked.add("G1_05_COME_BACK_TOMORROW");

  if (totalGamesPlayed >= 10) unlocked.add("G2_01_10_GAMES");
  if (totalGamesPlayed >= 50) unlocked.add("G2_02_50_GAMES");
  if (totalGamesPlayed >= 100) unlocked.add("G2_03_100_GAMES");
  if (totalWins >= 10) unlocked.add("G2_04_10_WINS");
  if (totalWins >= 50) unlocked.add("G2_05_50_WINS");
  if (totalWins >= 100) unlocked.add("G2_06_100_WINS");

  if (
    history.some((game) => {
      const total = game?.totalQuestions ?? game?.questions ?? 0;
      const correct = game?.correctCount ?? game?.correct ?? game?.score ?? 0;
      return game?.won && total > 0 && correct === total;
    })
  ) {
    unlocked.add("G3_01_FLAWLESS_WIN");
  }

  if (maxWinStreak >= 3) unlocked.add("G3_03_WIN_STREAK_3");
  if (maxWinStreak >= 5) unlocked.add("G3_04_WIN_STREAK_5");

  if (dailyStreak >= 3) unlocked.add("G4_01_3_DAY_STREAK");
  if (dailyStreak >= 7) unlocked.add("G4_02_7_DAY_STREAK");
  if (dailyStreak >= 14) unlocked.add("G4_03_14_DAY_STREAK");

  if (history.some((game) => game?.won && new Date(game.date).getHours() < 8)) {
    unlocked.add("G4_04_EARLY_BIRD");
  }

  if (history.some((game) => game?.won && new Date(game.date).getHours() >= 22)) {
    unlocked.add("G4_05_NIGHT_OWL");
  }

  if (coins > 0 || history.some((game) => (game?.coins ?? 0) > 0)) {
    unlocked.add("G5_01_FIRST_COINS");
  }

  if (coins >= 1000) unlocked.add("G5_04_SAVER");

  return Array.from(unlocked);
}

export default function AchievementsScreen() {
  const totalGamesPlayed = usePlayerStore((s) => s.totalGamesPlayed);
  const totalWins = usePlayerStore((s) => s.totalWins);
  const dailyStreak = usePlayerStore((s) => s.daily?.streak ?? 0);
  const coins = usePlayerStore((s) => s.coins);
  const history = useHistoryStore((s) => s.history);

  const [cloudUnlockedIds, setCloudUnlockedIds] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCloudUnlockedIds([]);
        return;
      }

      const ref = collection(db, "players", user.uid, "achievements");

      const unsubscribeSnapshot = onSnapshot(ref, (snap) => {
        const unlocked: string[] = [];

        snap.forEach((doc) => {
          if (doc.data()?.unlocked === true) {
            unlocked.push(doc.id);
          }
        });

        setCloudUnlockedIds(unlocked);
      });

      return unsubscribeSnapshot;
    });

    return () => unsubscribeAuth();
  }, []);

  const unlockedIds = useMemo(() => {
    const localUnlockedIds = getLocalUnlockedIds({
      history,
      totalGamesPlayed,
      totalWins,
      dailyStreak,
      coins,
    });

    return Array.from(new Set([...cloudUnlockedIds, ...localUnlockedIds]));
  }, [cloudUnlockedIds, coins, dailyStreak, history, totalGamesPlayed, totalWins]);

  const handlePress = (achievement: any) => {
    if (!unlockedIds.includes(achievement.id)) return;
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>Unlock rewards as you play and improve.</Text>
        </View>

        {["START", "VOLUME", "SKILL", "HABIT", "ECONOMY"].map((group) => (
          <View key={group} style={styles.section}>
            <Text style={styles.sectionTitle}>{group}</Text>

            <View style={styles.grid}>
              {ACHIEVEMENTS.filter((a) => a.group === group).map((ach) => (
                <TouchableOpacity
                  key={ach.id}
                  activeOpacity={0.85}
                  onPress={() => handlePress(ach)}
                  style={styles.badgeWrapper}
                >
                  <AchievementBadge achievement={ach} unlocked={unlockedIds.includes(ach.id)} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <AchievementModal
        visible={modalVisible}
        achievement={selectedAchievement}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061A2D",
  },

  scrollContent: {
    paddingTop: 64,
    paddingHorizontal: 16,
    paddingBottom: 36,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    color: "#F5B942",
    letterSpacing: 0.3,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#9AA3B2",
  },

  section: {
    marginTop: 8,
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    color: "#CBD5E1",
    letterSpacing: 1.8,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  badgeWrapper: {
    width: "48%",
    marginBottom: 12,
  },
});

