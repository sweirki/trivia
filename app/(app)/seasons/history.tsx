import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import ScreenShell from "@/components/ScreenShell";
import SectionHeader from "@/components/SectionHeader";
import { auth } from "@/firebase/firebase";
import { badgeLabel } from "@/seasons/badges";
import { ArchivedSeason, listSeasonHistory } from "@/seasons/seasonHistoryService";

const SEASON_BG = require("../../../assets/premium/atmospheres/premium_season_bg.webp");
const GOLD = "#FFD66E";
const CYAN = "#9FE7FF";
const INK = "#07111F";

function formatDate(value?: string) {
  if (!value) return "Archived season";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Archived season";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getBestSeason(history: ArchivedSeason[]) {
  return history.reduce<ArchivedSeason | null>((best, item) => {
    if (!best) return item;
    if (item.finalTier > best.finalTier) return item;
    if (item.finalTier === best.finalTier && item.finalXp > best.finalXp) return item;
    return best;
  }, null);
}

function SeasonArchiveCard({ item, index }: { item: ArchivedSeason; index: number }) {
  const rewardCount = item.claimedTiers?.length ?? 0;
  const badge = item.finalBadgeId ? badgeLabel(item.finalBadgeId) : null;

  return (
    <View style={styles.card}>
      <ImageBackground source={SEASON_BG} style={styles.cardArt} imageStyle={styles.cardImage} resizeMode="cover">
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(2,6,14,0.78)", "rgba(2,6,14,0.42)", "rgba(2,6,14,0.2)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.cardRim} />

        <View style={styles.cardTopRow}>
          <View>
            <Text style={styles.cardKicker}>ARCHIVE #{index + 1}</Text>
            <Text style={styles.cardTitle}>Season {item.seasonId}</Text>
          </View>
          <View style={styles.tierPill}>
            <Text style={styles.tierPillText}>Tier {item.finalTier}</Text>
          </View>
        </View>

        <Text style={styles.cardDate}>{formatDate(item.endedAt)}</Text>

        <View style={styles.metricRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{item.finalXp}</Text>
            <Text style={styles.metricLabel}>Season XP</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{rewardCount}</Text>
            <Text style={styles.metricLabel}>Rewards</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{badge ? "✓" : "-"}</Text>
            <Text style={styles.metricLabel}>Badge</Text>
          </View>
        </View>

        {badge ? <Text style={styles.badgeText}>{badge}</Text> : null}
      </ImageBackground>
    </View>
  );
}

export default function SeasonHistoryScreen() {
  const router = useRouter();
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

  const bestSeason = useMemo(() => getBestSeason(history), [history]);
  const totalRewards = useMemo(
    () => history.reduce((sum, item) => sum + (item.claimedTiers?.length ?? 0), 0),
    [history],
  );

  return (
    <ScreenShell accessibilityLabel="Season History screen" contentStyle={styles.shellContent}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={SEASON_BG} style={styles.hero} imageStyle={styles.heroImage} resizeMode="cover">
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2,6,14,0.82)", "rgba(2,6,14,0.38)", "rgba(2,6,14,0.1)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" style={styles.heroRim} />
          <Text style={styles.kicker}>SEASON LEGACY</Text>
          <Text style={styles.title}>Season History</Text>
          <Text style={styles.subtitle}>Your archived tiers, rewards, and prestige records across completed seasons.</Text>
        </ImageBackground>

        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading season archive…</Text>
            <Text style={styles.emptyText}>Checking completed season snapshots.</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No completed seasons yet.</Text>
            <Text style={styles.emptyText}>Finish a season to build a permanent legacy card here.</Text>
            <Pressable style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]} onPress={() => router.back()}>
              <Text style={styles.ctaText}>Back to Season Hub</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{history.length}</Text>
                <Text style={styles.summaryLabel}>Seasons</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{bestSeason?.finalTier ?? 0}</Text>
                <Text style={styles.summaryLabel}>Peak Tier</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{totalRewards}</Text>
                <Text style={styles.summaryLabel}>Rewards</Text>
              </View>
            </View>

            <SectionHeader title="Archive" />
            <View style={styles.archiveList}>
              {history.map((item, index) => (
                <SeasonArchiveCard key={item.seasonId} item={item} index={index} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 52,
  },
  hero: {
    minHeight: 170,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: INK,
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.32)",
    padding: 17,
    justifyContent: "flex-end",
    marginBottom: 14,
  },
  heroImage: {
    opacity: 0.98,
  },
  heroRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.22)",
  },
  kicker: {
    color: CYAN,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  title: {
    color: "#F4FAFF",
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 9,
  },
  subtitle: {
    color: "#BBD7FF",
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 6,
    maxWidth: "82%",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: 20,
    backgroundColor: "rgba(7,17,31,0.88)",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  summaryValue: {
    color: GOLD,
    fontSize: 20,
    fontWeight: "900",
  },
  summaryLabel: {
    color: "#9FB3CE",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 3,
  },
  archiveList: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    minHeight: 178,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: INK,
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.2)",
  },
  cardArt: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  cardImage: {
    opacity: 0.94,
  },
  cardRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.22)",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  cardKicker: {
    color: CYAN,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  tierPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,214,110,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.38)",
  },
  tierPillText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "900",
  },
  cardDate: {
    color: "#BBD7FF",
    fontSize: 10.5,
    fontWeight: "800",
    marginTop: 6,
  },
  metricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  metricBox: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "rgba(3,9,20,0.62)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 5,
  },
  metricValue: {
    color: GOLD,
    fontSize: 15,
    fontWeight: "900",
  },
  metricLabel: {
    color: "#9FB3CE",
    fontSize: 8.7,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 3,
  },
  badgeText: {
    color: CYAN,
    fontSize: 10.5,
    fontWeight: "900",
    marginTop: 10,
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: "rgba(7,17,31,0.88)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.22)",
    padding: 18,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#F4FAFF",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: "#9FB3CE",
    fontSize: 11.5,
    fontWeight: "800",
    lineHeight: 16,
    textAlign: "center",
    marginTop: 6,
  },
  ctaButton: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(159,231,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.28)",
  },
  ctaText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
