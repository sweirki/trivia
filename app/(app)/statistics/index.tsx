import React, { useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import ScreenShell from "@/components/ScreenShell";
import SectionHeader from "@/components/SectionHeader";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useHistoryStore } from "@/store/historyStore";

const STATS_HERO_ART = require("../../../assets/images/lobby/stats_card_art.webp");
const LOBBY_HERO_ART = require("../../../assets/images/lobby/lobby_hero_banner.webp");
const PROFILE_PRESTIGE_BG = require("../../../assets/premium/atmospheres/profile_prestige_bg.webp");
const RESULT_EMBLEM = require("../../../assets/images/play/results/result_emblem.webp");
const TROPHY_HALL_BG = require("../../../assets/cosmetics/backgrounds/bg_trophy_hall_01.webp");
const STADIUM_LIGHTS_BG = require("../../../assets/cosmetics/backgrounds/bg_stadium_lights_01.webp");

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

    const completedQuestions = history.reduce(
      (sum, game) => sum + (game.totalQuestions ?? 0),
      0,
    );
    const correctAnswers = history.reduce(
      (sum, game) => sum + (game.correctCount ?? game.score ?? 0),
      0,
    );
    const accuracy = completedQuestions > 0 ? (correctAnswers / completedQuestions) * 100 : 0;

    const modeCounts = history.reduce<Record<string, number>>((acc, game) => {
      const key = game.mode || "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const bestMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const recent = [...history].slice(-5).reverse();

    return {
      losses,
      winRate,
      completedQuestions,
      correctAnswers,
      accuracy,
      bestMode,
      recent,
    };
  }, [history, totalGamesPlayed, totalWins]);

  const xpRequired = level * 150 + level * level * 6;
  const xpPercent = xpRequired > 0 ? Math.min(1, xp / xpRequired) : 0;
  const weeklyPercent = Math.min(1, (weekly?.progress ?? 0) / 5);

  return (
    <ScreenShell accessibilityLabel="Statistics screen" contentStyle={styles.shellContent}>
      <Image source={PROFILE_PRESTIGE_BG} style={styles.backgroundArt} resizeMode="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(3,7,15,0.28)", "rgba(3,7,15,0.78)", "rgba(3,7,15,0.96)"]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>PERFORMANCE CENTER</Text>
            <Text style={styles.title}>Statistics</Text>
            <Text style={styles.subtitle}>Your arena record, rhythm, and progress</Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Image source={STATS_HERO_ART} style={styles.heroArt} resizeMode="cover" />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2,6,14,0.78)", "rgba(2,6,14,0.36)", "rgba(2,6,14,0.04)"]}
            locations={[0, 0.48, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(159,231,255,0.17)", "rgba(255,214,110,0.09)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroInner}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.heroLabel}>Level {level}</Text>
                <Text style={styles.heroSub}>Progress runway</Text>
              </View>
              <View style={styles.heroEmblemWrap}>
                <Image source={RESULT_EMBLEM} style={styles.heroEmblem} resizeMode="contain" />
              </View>
            </View>

            <Text style={styles.heroValue}>{xp} XP</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${xpPercent * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{xp} / {xpRequired} XP to next level</Text>
          </View>
        </View>

        <View style={styles.spotlightRow}>
          <MetricCard label="Win Rate" value={pct(stats.winRate)} tone="gold" />
          <MetricCard label="Accuracy" value={pct(stats.accuracy)} tone="blue" />
          <MetricCard label="Games" value={totalGamesPlayed} tone="white" />
        </View>

        <SectionHeader title="Performance" />
        <View style={styles.grid}>
          <StatCard label="Wins" value={totalWins} accent="#FFD66E" />
          <StatCard label="Losses" value={stats.losses} accent="#8EDBFF" />
          <StatCard label="Correct" value={stats.correctAnswers} accent="#43E4D8" />
          <StatCard label="Questions" value={stats.completedQuestions} accent="#A977FF" />
        </View>

        <ArtPanel
          title="Daily & Weekly"
          subtitle="Retention rhythm"
          art={LOBBY_HERO_ART}
          accent="#9FE7FF"
        >
          <Line label="Daily streak" value={`${daily?.streak ?? 0} day${(daily?.streak ?? 0) === 1 ? "" : "s"}`} />
          <Line label="Daily claims" value={daily?.totalClaims ?? 0} />
          <Line label="Weekly dailies" value={`${weekly?.progress ?? 0} / 5`} />
          <Line label="Weekly claimed" value={weekly?.claimed ? "Yes" : "No"} />
          <View style={styles.miniTrack}>
            <View style={[styles.miniFill, { width: `${weeklyPercent * 100}%` }]} />
          </View>
        </ArtPanel>

        <ArtPanel
          title="Arena Record"
          subtitle="Competitive identity"
          art={TROPHY_HALL_BG}
          accent="#FFD66E"
        >
          <Line label="Tournaments played" value={tournamentsPlayed} />
          <Line label="Tournaments won" value={tournamentsWon} />
          <Line label="Best finish" value={bestTournamentFinish ?? "—"} />
          <Line label="Most played mode" value={formatMode(stats.bestMode)} />
        </ArtPanel>

        <ArtPanel
          title="Recent Games"
          subtitle="Latest runs"
          art={STADIUM_LIGHTS_BG}
          accent="#58B8FF"
        >
          {stats.recent.length === 0 ? (
            <View style={styles.emptyState}>
              <Image source={RESULT_EMBLEM} style={styles.emptyEmblem} resizeMode="contain" />
              <Text style={styles.emptyTitle}>No runs recorded yet</Text>
              <Text style={styles.empty}>Finish a game to start building your performance history.</Text>
            </View>
          ) : (
            stats.recent.map((game, index) => (
              <View key={`${game.date}-${index}`} style={styles.recentRow}>
                <View style={styles.recentCopy}>
                  <Text style={styles.recentTitle}>{formatMode(game.mode || "Game")}</Text>
                  <Text style={styles.recentSub}>{game.category || "General"}</Text>
                </View>
                <View style={styles.recentScorePill}>
                  <Text style={styles.recentScore}>{game.score ?? 0}</Text>
                </View>
              </View>
            ))
          )}
        </ArtPanel>
      </ScrollView>
    </ScreenShell>
  );
}

function formatMode(mode: string) {
  if (!mode || mode === "—") return "—";
  return mode
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "gold" | "blue" | "white";
}) {
  const color = tone === "gold" ? "#FFD66E" : tone === "blue" ? "#9FE7FF" : "#F4FAFF";

  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ArtPanel({
  title,
  subtitle,
  art,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  art: ImageSourcePropType;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.artPanel}>
      <Image source={art} style={styles.panelArt} resizeMode="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(2,6,14,0.88)", "rgba(2,6,14,0.66)", "rgba(2,6,14,0.25)"]}
        locations={[0, 0.58, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.panelGlow, { borderColor: `${accent}88` }]} />

      <View style={styles.panelInner}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={[styles.panelKicker, { color: accent }]}>{subtitle.toUpperCase()}</Text>
            <Text style={styles.panelTitle}>{title}</Text>
          </View>
        </View>
        {children}
      </View>
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
  shellContent: {
    paddingTop: 18,
    paddingBottom: 0,
  },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.2,
  },
  content: {
    paddingBottom: 52,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    color: "#7E8EA7",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  title: {
    color: "#F4FAFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#9FE7FF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },
  backButton: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(159,231,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.28)",
  },
  backText: {
    color: "#9FE7FF",
    fontSize: 11,
    fontWeight: "900",
  },
  heroCard: {
    minHeight: 158,
    marginBottom: 12,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.42)",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  heroArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.98,
  },
  heroInner: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heroLabel: {
    color: "#FFD66E",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.25,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 8,
  },
  heroSub: {
    color: "#9FE7FF",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  heroEmblemWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,214,110,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.35)",
  },
  heroEmblem: {
    width: 38,
    height: 38,
  },
  heroValue: {
    color: "#F4FAFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.55,
    marginTop: 18,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 10,
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(216,231,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.16)",
    marginTop: 9,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#9FE7FF",
    shadowColor: "#58B8FF",
    shadowOpacity: 0.78,
    shadowRadius: 8,
  },
  progressText: {
    color: "#D8E7FF",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 7,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },
  spotlightRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minHeight: 66,
    borderRadius: 16,
    padding: 10,
    backgroundColor: "rgba(7,17,31,0.86)",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.28)",
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  metricLabel: {
    color: "#9FB1CF",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statCard: {
    width: "48.5%",
    minHeight: 82,
    marginBottom: 10,
    borderRadius: 18,
    padding: 12,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(7,17,31,0.88)",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.25)",
  },
  statAccent: {
    position: "absolute",
    left: 13,
    right: 13,
    top: 0,
    height: 1,
    opacity: 0.78,
  },
  statValue: {
    color: "#F4FAFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 7,
  },
  statLabel: {
    color: "#9FB1CF",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  artPanel: {
    minHeight: 168,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.28)",
    marginBottom: 14,
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  panelArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.98,
  },
  panelGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 24,
  },
  panelInner: {
    padding: 14,
    zIndex: 5,
  },
  panelHeader: {
    marginBottom: 8,
  },
  panelKicker: {
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 3,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 6,
  },
  panelTitle: {
    color: "#F4FAFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.15,
    textShadowColor: "rgba(0,0,0,0.96)",
    textShadowRadius: 8,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(216,231,255,0.11)",
    gap: 12,
  },
  lineLabel: {
    color: "#B9C8DF",
    fontSize: 11,
    fontWeight: "800",
    flex: 1,
  },
  lineValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
    textTransform: "capitalize",
  },
  miniTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(216,231,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.16)",
    marginTop: 12,
  },
  miniFill: {
    height: "100%",
    backgroundColor: "#9FE7FF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  emptyEmblem: {
    width: 46,
    height: 46,
    opacity: 0.85,
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#F4FAFF",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },
  empty: {
    color: "#B9C8DF",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(216,231,255,0.11)",
    gap: 12,
  },
  recentCopy: {
    flex: 1,
  },
  recentTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  recentSub: {
    color: "#9FB1CF",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "capitalize",
  },
  recentScorePill: {
    minWidth: 48,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
    backgroundColor: "rgba(255,214,110,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.32)",
  },
  recentScore: {
    color: "#FFD66E",
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});


