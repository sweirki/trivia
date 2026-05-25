import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import ScreenShell from "@/components/ScreenShell";
import SectionHeader from "@/components/SectionHeader";
import { auth, db } from "@/firebase/firebase";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useHistoryStore } from "@/store/historyStore";
import AchievementBadge from "./AchievementBadge";
import AchievementModal from "./AchievementModal";
import { ACHIEVEMENTS } from "../../achievements/achievementDefinitions";

const HERO_ART = require("../../../assets/images/lobby/achievements_card_art.webp");
const LOBBY_ART = require("../../../assets/images/lobby/lobby_hero_banner.webp");

type AchievementGroup = "START" | "VOLUME" | "SKILL" | "HABIT" | "ECONOMY";

const GROUPS: Array<{ id: AchievementGroup; title: string; sub: string }> = [
  { id: "START", title: "Start", sub: "First milestones" },
  { id: "VOLUME", title: "Volume", sub: "Long-term progress" },
  { id: "SKILL", title: "Skill", sub: "Elite performance" },
  { id: "HABIT", title: "Habit", sub: "Return rhythm" },
  { id: "ECONOMY", title: "Economy", sub: "Rewards and ownership" },
];

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

  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = totalCount > 0 ? Math.min(100, Math.round((unlockedCount / totalCount) * 100)) : 0;

  const handlePress = (achievement: any) => {
    if (!unlockedIds.includes(achievement.id)) return;
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  return (
    <ScreenShell accessibilityLabel="Achievements screen" contentStyle={styles.shellContent}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>PLAYER MILESTONES</Text>
            <Text style={styles.title}>Achievements</Text>
            <Text style={styles.subtitle}>Collect prestige moments across every run.</Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countValue}>{unlockedCount}</Text>
            <Text style={styles.countLabel}>Unlocked</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Image source={HERO_ART} style={styles.heroArt} resizeMode="cover" />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2,6,14,0.42)", "rgba(2,6,14,0.10)", "rgba(2,6,14,0)"]}
            locations={[0, 0.48, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(159,231,255,0.08)", "rgba(255,214,110,0.05)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroInner}>
            <Text style={styles.heroLabel}>COLLECTION PROGRESS</Text>
            <View style={styles.heroTopRow}>
              <Text style={styles.heroTitle}>{progressPercent}% Complete</Text>
              <Text style={styles.heroMeta}>{unlockedCount}/{totalCount}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.heroText}>Cinematic collectible cards for every prestige moment.</Text>
          </View>
        </View>

        <View style={styles.featuredStrip}>
          <Image source={LOBBY_ART} style={styles.featuredArt} resizeMode="cover" />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2,6,14,0.52)", "rgba(2,6,14,0.22)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.featuredCopy}>
            <Text style={styles.featuredLabel}>PRESTIGE CARDS</Text>
            <Text style={styles.featuredTitle}>Milestones now read as collectible icon cards.</Text>
          </View>
        </View>

        {GROUPS.map((group) => {
          const items = ACHIEVEMENTS.filter((a) => a.group === group.id);
          const groupUnlocked = items.filter((item) => unlockedIds.includes(item.id)).length;

          return (
            <View key={group.id} style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <SectionHeader title={group.title} />
                  <Text style={styles.sectionSub}>{group.sub}</Text>
                </View>
                <Text style={styles.sectionCount}>{groupUnlocked}/{items.length}</Text>
              </View>

              <View style={styles.grid}>
                {items.map((ach) => (
                  <Pressable
                    key={ach.id}
                    onPress={() => handlePress(ach)}
                    style={({ pressed }) => [styles.badgeWrapper, pressed && styles.pressed]}
                    accessibilityLabel={`${ach.title}. ${ach.description}`}
                  >
                    <AchievementBadge achievement={ach} unlocked={unlockedIds.includes(ach.id)} />
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <AchievementModal
        visible={modalVisible}
        achievement={selectedAchievement}
        onClose={() => setModalVisible(false)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingTop: 10,
    paddingBottom: 52,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    color: "#7E8EA7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 3,
  },
  title: {
    color: "#F4FAFF",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.45,
  },
  subtitle: {
    color: "#9FE7FF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  countBadge: {
    minWidth: 64,
    marginTop: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(8,17,31,0.78)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.2)",
  },
  countValue: {
    color: "#FFD66E",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "900",
  },
  countLabel: {
    color: "#8FA4BE",
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 2,
  },
  heroCard: {
    minHeight: 138,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.26)",
    marginBottom: 14,
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.14,
    shadowRadius: 17,
    shadowOffset: { width: 0, height: 9 },
    elevation: 7,
  },
  heroArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.96,
  },
  heroInner: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  heroLabel: {
    color: "#9FE7FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
  },
  heroTitle: {
    color: "#F4FAFF",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.28,
    textShadowColor: "rgba(0,0,0,0.92)",
    textShadowRadius: 9,
  },
  heroMeta: {
    color: "#FFD66E",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(216,231,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.14)",
    marginTop: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#9FE7FF",
    shadowColor: "#58B8FF",
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  heroText: {
    color: "#BBD7FF",
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 8,
    maxWidth: "78%",
    textShadowColor: "rgba(0,0,0,0.88)",
    textShadowRadius: 6,
  },
  featuredStrip: {
    minHeight: 58,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(119,174,255,0.18)",
    marginBottom: 18,
  },
  featuredArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  featuredCopy: {
    padding: 12,
  },
  featuredLabel: {
    color: "#FFD66E",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.3,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  featuredTitle: {
    color: "#D8E7FF",
    fontSize: 11.5,
    fontWeight: "800",
    marginTop: 5,
    lineHeight: 15,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  sectionSub: {
    color: "#7E8EA7",
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: "800",
    marginTop: -5,
  },
  sectionCount: {
    color: "#9FE7FF",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    marginBottom: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badgeWrapper: {
    width: "48.6%",
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});


