import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { router } from "expo-router";
import React from "react";
import { s } from "@/arena/theme/arenaSizing";
import { useArenaRankSystem } from "@/arena/store/useArenaRankSystem";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { usePlayerStore } from "@/store/usePlayerStore";

import { useThemedAlert } from "@/components/ThemedAlert";
import { CosmeticCategory } from "@/cosmetics/types";
import { getEquippedCosmetic } from "@/cosmetics/cosmeticSelectors";
import { getCosmeticAssetSource } from "@/cosmetics/cosmeticAssets";
import AnimatedProgressBar from "@/components/AnimatedProgressBar";
import { trackScreenView, trackEvent } from "@/observability";
import { ArenaModeCard } from "./arena.components";
import { getSRPercent } from "./arena.helpers";

export default function ArenaHub() {
  const { showThemedAlert, themedAlert } = useThemedAlert();
  const { rank, sr, season } = useArenaRankSystem();
  const { lastDailyPlayedAt, weeklyPlays, dailyStreak } = useTournamentStore();
  const playerCosmetics = usePlayerStore((state) => state.cosmetics);
  const equippedArenaBanner = getEquippedCosmetic(playerCosmetics, CosmeticCategory.ARENA_BANNER);
  const equippedAnswerTrail = getEquippedCosmetic(playerCosmetics, CosmeticCategory.ANSWER_TRAIL);
  const equippedStreakAura = getEquippedCosmetic(playerCosmetics, CosmeticCategory.STREAK_AURA);
  const arenaBannerSource = getCosmeticAssetSource(equippedArenaBanner?.icon);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0.7)).current;

  React.useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.78,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    glowLoop.start();

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, [glowAnim, pulseAnim]);

  const safeWeeklyPlays = Number.isFinite(weeklyPlays) ? weeklyPlays : 0;
  const safeDailyStreak = Number.isFinite(dailyStreak) ? dailyStreak : 0;

  const today = new Date().toDateString();
  const playedToday =
    lastDailyPlayedAt && new Date(lastDailyPlayedAt).toDateString() === today;

  const weeklyGoal = 3;
  const weeklyProgress = Math.min(safeWeeklyPlays, weeklyGoal);
  const weeklyPercent = (weeklyProgress / weeklyGoal) * 100;
  const weeklyAlmostDone = weeklyProgress === weeklyGoal - 1;

 React.useEffect(() => {
  void trackScreenView("arena_hub", {
    rank: rank?.league ?? "unknown",
    sr,
    weeklyProgress,
    dailyStreak: safeDailyStreak,
  });

  void trackEvent("arena_entered", {
    rank: rank?.league ?? "unknown",
    sr,
  });
}, [rank?.league, safeDailyStreak, sr, weeklyProgress]);

  const hasRank =
    !!rank && typeof rank.maxSR === "number" && typeof rank.minSR === "number";

  if (!hasRank) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Arena...</Text>
      </View>
    );
  }

  const progress = getSRPercent(sr, rank);
  const srToPromotion = Math.max(0, rank.maxSR - sr);
  const srFromDanger = Math.max(0, sr - rank.minSR);
  const isNearPromotion = progress >= 78;
  const isDangerZone = progress <= 18;
  const isOnFire = safeDailyStreak >= 2;

  return (
    <ScrollView testID="screen-arena" style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.liveRow}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.livePill}>LIVE ARENA</Text>
          </Animated.View>

          <Text style={styles.seasonPill}>Season {season}</Text>
        </View>

        <Text style={styles.heroTitle}>Arena Season {season}</Text>
        <Text style={styles.heroSubtitle}>
          Ranked pressure, daily arena momentum, tournament glory, seasonal rewards, and prestige progression.
        </Text>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatBox}>
            <Text style={styles.heroStatValue}>{rank.league}</Text>
            <Text style={styles.heroStatLabel}>League</Text>
          </View>

          <View style={styles.heroStatBox}>
            <Text style={styles.heroStatValue}>{sr}</Text>
            <Text style={styles.heroStatLabel}>SR</Text>
          </View>

          <View style={styles.heroStatBox}>
            <Text style={styles.heroStatValue}>{safeDailyStreak}x</Text>
            <Text style={styles.heroStatLabel}>Streak</Text>
          </View>
        </View>

        {(equippedArenaBanner || equippedAnswerTrail || equippedStreakAura) && (
          <View style={styles.cosmeticStrip}>
            {arenaBannerSource ? (
              <Image source={arenaBannerSource} style={styles.cosmeticBannerThumb} resizeMode="cover" />
            ) : null}
            <View style={styles.cosmeticStripText}>
              <Text style={styles.cosmeticStripTitle}>Equipped Arena Style</Text>
              <Text style={styles.cosmeticStripBody}>
                {[equippedArenaBanner?.name, equippedAnswerTrail?.name, equippedStreakAura?.name].filter(Boolean).join(" • ")}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Animated.View
        style={[
          styles.seasonLiveCard,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Text style={styles.seasonLiveLabel}>SEASON STATUS</Text>
        <Text style={styles.seasonLiveTitle}>Season {season} Ends In</Text>
        <Text style={styles.seasonCountdown}>12D 08H</Text>
        <Text style={styles.seasonLiveBody}>
          Top players will receive exclusive seasonal prestige, future profile borders,
          champion frames, trophy cosmetics, and elite rewards.
        </Text>
      </Animated.View>

      <View style={styles.rankCard}>
        <View style={styles.rankTopRow}>
          {rank.icon ? (
            <Image source={{ uri: rank.icon }} style={styles.rankIcon} />
          ) : (
            <View style={styles.rankIconFallback}>
              <Text style={styles.rankIconFallbackText}>🏅</Text>
            </View>
          )}

          <View style={styles.rankTextBlock}>
            <Text style={styles.rankName}>
              {rank.league} {rank.division ? `• ${rank.division}` : ""}
            </Text>

            <Text style={styles.rankSubtitle}>
              {isNearPromotion
                ? `${srToPromotion} SR from promotion. Push now.`
                : isDangerZone
                  ? `${srFromDanger} SR above danger. Protect your rank.`
                  : "Climb, protect, promote."}
            </Text>
          </View>
        </View>

        <AnimatedProgressBar
          percent={progress}
          height={s(10)}
          fillColor={isDangerZone ? "#FF5C7A" : isNearPromotion ? "#FFD36B" : "#56D67B"}
          trackColor="#2c2c3b"
          glowColor={isDangerZone ? "#FF5C7A" : isNearPromotion ? "#FFD36B" : "#56D67B"}
          style={styles.progressBarWrapper}
        />

        <View style={styles.pressureRow}>
          <Text style={[styles.pressureText, isNearPromotion && styles.goldText]}>
            {isNearPromotion ? "Promotion Window" : "Promotion"}
          </Text>

          <Text style={[styles.pressureText, isDangerZone && styles.dangerText]}>
            {isDangerZone ? "Danger Zone" : "Rank Shield"}
          </Text>
        </View>
      </View>

      <View style={styles.majorCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.majorLabel}>DAILY ARENA</Text>
          <Text style={styles.countdownText}>Refreshes daily</Text>
        </View>

        <Text style={styles.majorTitle}>⚔️ Daily Competitive Push</Text>

        <Text style={styles.majorBody}>
          Climb ranks, build streak momentum, earn rewards, and dominate today's arena rotation.
        </Text>

        <View style={styles.pressureBox}>
          <Text style={styles.pressureBoxTitle}>TODAY'S PRESSURE</Text>
          <Text style={styles.pressureBoxText}>
            Win arena battles to protect your division, increase streak bonuses,
            and unlock higher prestige rewards.
          </Text>
        </View>

        <TouchableOpacity
          testID="arena-daily-ranked-button"
          style={[styles.primaryButton, playedToday && styles.primaryButtonDisabled]}
          onPress={() => {
            if (playedToday) {
              showThemedAlert(
                "Daily Arena Complete",
                "You already completed today's Daily Arena. Come back tomorrow.",
                "info"
              );
              return;
            }

            router.push({
              pathname: "/(app)/arena_reset/ranked",
              params: { daily: "1" },
            });
          }}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryButtonText}>
            {playedToday ? "Played Today" : "Play Daily Arena"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.energyGrid}>
        <View style={[styles.energyCard, weeklyAlmostDone && styles.glowBlue]}>
          <Text style={styles.energyTitle}>Weekly Push</Text>
          <Text style={styles.energyValue}>{weeklyProgress}/{weeklyGoal}</Text>

          <AnimatedProgressBar
            percent={weeklyPercent}
            height={s(7)}
            fillColor="#4FC3F7"
            trackColor="#2d3145"
            glowColor="#4FC3F7"
            style={styles.smallBar}
          />

          <Text style={styles.energyHint}>
            {weeklyAlmostDone ? "One more run for the weekly chest." : "Build weekly arena momentum."}
          </Text>
        </View>

        <View style={[styles.energyCard, isOnFire && styles.glowOrange]}>
          <Text style={styles.energyTitle}>Streak Heat</Text>
          <Text style={styles.energyValue}>🔥 {safeDailyStreak}</Text>
          <Text style={styles.energyHint}>
            {isOnFire ? "You are on fire. Keep the chain alive." : "Play daily to start your fire streak."}
          </Text>
        </View>
      </View>

      <View style={styles.rewardCard}>
        <Text style={styles.rewardTitle}>Prestige Rewards</Text>
        <Text style={styles.rewardText}>
          Climb ranks, win cups, protect streaks, and build your profile identity with trophies, badges, coins, XP, and future cosmetics.
        </Text>
      </View>

      <View style={styles.leaderboardTease}>
        <Text style={styles.leaderboardLabel}>GLOBAL LEADERBOARDS</Text>
        <Text style={styles.leaderboardTitle}>Top 100 Arena Players</Text>
        <Text style={styles.leaderboardBody}>
          Seasonal rankings, global prestige, tournament legends, and elite competitors are arriving soon.
        </Text>
      </View>

      <Animated.View style={[styles.eventCard, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.eventLabel}>LIMITED EVENT</Text>
        <Text style={styles.eventTitle}>⚡ Lightning Cup Weekend</Text>
        <Text style={styles.eventBody}>
          Faster timers. Higher SR pressure. Exclusive rewards for top performers.
        </Text>

        <View style={styles.eventPillRow}>
          <Text style={styles.eventPill}>LIVE</Text>
          <Text style={styles.eventPill}>2x Prestige</Text>
          <Text style={styles.eventPill}>Weekend Only</Text>
        </View>
      </Animated.View>

      <View style={styles.modesWrapper}>
        <ArenaModeCard
          testID="arena-mode-ranked"
          icon="⚔️"
          title="Ranked Arena"
          subtitle="Entry: 5 tickets • Win: 200 coins + tokens."
          tag={isNearPromotion ? "PROMOTION NEAR" : isDangerZone ? "PROTECT RANK" : "COMPETITIVE"}
          onPress={() => {
            if (!usePlayerStore.getState().spendTickets(5)) {
              showThemedAlert("Not enough tickets", "Ranked Arena requires 5 tickets.", "warning");
              return;
            }

            router.push("/(app)/arena_reset/ranked");
          }}
        />

        <ArenaModeCard
          icon="💀"
          title="Survival Arena"
          subtitle="Entry: 4 tickets • Rewards scale with rounds survived."
          tag="HIGH SCORE"
          onPress={() => {
            if (!usePlayerStore.getState().spendTickets(4)) {
              showThemedAlert("Not enough tickets", "Survival Arena requires 4 tickets.", "warning");
              return;
            }

            useArenaStore.getState().resetArena();
            useArenaStore.getState().setMode("survival");
            router.push("/(app)/arena_reset/survival/SurvivalMatch");
          }}
        />

        <ArenaModeCard
          icon="⚡"
          title="Power-Up Arena"
          subtitle="Entry: 5 tickets • Score-based coin reward."
          tag="STRATEGY"
          onPress={() => {
            if (!usePlayerStore.getState().spendTickets(5)) {
              showThemedAlert("Not enough tickets", "Power-Up Arena requires 5 tickets.", "warning");
              return;
            }

            router.push("/(app)/arena_reset/power");
          }}
        />

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <ArenaModeCard
            testID="arena-mode-tournaments"
            icon="🏆"
            title="Tournaments"
            subtitle="Entry: 8 tickets • Highest-stakes Arena mode."
            tag="LIVE EVENT"
            onPress={() => {
              if (!usePlayerStore.getState().spendTickets(8)) {
                showThemedAlert("Not enough tickets", "Tournaments require 8 tickets.", "warning");
                return;
              }

              router.push("/(app)/arena_reset/tournaments");
            }}
          />
        </Animated.View>
      </View>

      {themedAlert}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090912" },
  content: { alignItems: "center", paddingHorizontal: s(14), paddingTop: s(14), paddingBottom: s(36) },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#090912",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: "#aaa", fontSize: s(16) },

  heroCard: {
    width: "100%",
    backgroundColor: "#171423",
    borderRadius: s(24),
    padding: s(20),
    borderWidth: 1,
    borderColor: "#3d315f",
    marginTop: s(76),
    marginBottom: s(14),
  },
  liveRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  livePill: {
    color: "#120d05",
    backgroundColor: "#FFD36B",
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: s(999),
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  seasonPill: {
    color: "#BBD7FF",
    backgroundColor: "#1f2b45",
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: s(999),
    fontSize: s(11),
    fontWeight: "800",
  },
  heroTitle: { color: "#fff", fontSize: s(25), fontWeight: "900", marginTop: s(14) },
  heroSubtitle: { color: "#c8c4d8", fontSize: s(14), lineHeight: s(20), marginTop: s(8) },
  heroStatsRow: { flexDirection: "row", gap: s(9), marginTop: s(14) },
  heroStatBox: {
    flex: 1,
    backgroundColor: "#211d31",
    borderRadius: s(16),
    paddingVertical: s(10),
    alignItems: "center",
  },
  heroStatValue: { color: "#FFD36B", fontSize: s(15), fontWeight: "900" },
  heroStatLabel: { color: "#8f8aa3", fontSize: s(11), marginTop: s(3) },

  seasonLiveCard: {
    width: "100%",
    backgroundColor: "#151522",
    borderRadius: s(16),
    padding: s(14),
    borderWidth: 1,
    borderColor: "#32415f",
    marginBottom: s(14),
  },
  seasonLiveLabel: {
    color: "#BBD7FF",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1,
  },
  seasonLiveTitle: {
    color: "#fff",
    fontSize: s(18),
    fontWeight: "900",
    marginTop: s(7),
  },
  seasonCountdown: {
    color: "#FFD36B",
    fontSize: s(30),
    fontWeight: "900",
    marginTop: s(8),
  },
  seasonLiveBody: {
    color: "#b9bfd2",
    fontSize: s(13),
    lineHeight: s(19),
    marginTop: s(10),
  },

  rankCard: {
    width: "100%",
    backgroundColor: "#11111d",
    borderRadius: s(22),
    padding: s(14),
    borderWidth: 1,
    borderColor: "#292844",
    marginBottom: s(14),
  },
  rankTopRow: { flexDirection: "row", alignItems: "center", gap: s(14) },
  rankIcon: { width: s(62), height: s(62) },
  rankIconFallback: {
    width: s(62),
    height: s(62),
    borderRadius: s(22),
    backgroundColor: "#232337",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFD36B",
  },
  rankIconFallbackText: { fontSize: s(30) },
  rankTextBlock: { flex: 1 },
  rankName: { color: "#fff", fontSize: s(19), fontWeight: "900" },
  rankSubtitle: { color: "#aaa6bb", fontSize: s(13), marginTop: s(5), lineHeight: s(18) },
  progressBarWrapper: {
    height: s(10),
    backgroundColor: "#2c2c3b",
    borderRadius: s(999),
    overflow: "hidden",
    marginTop: s(16),
  },
  progressBar: { height: s(10), backgroundColor: "#56D67B", borderRadius: s(999) },
  progressPromotion: { backgroundColor: "#FFD36B" },
  progressDanger: { backgroundColor: "#FF5C7A" },
  pressureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: s(10) },
  pressureText: { color: "#8f8aa3", fontSize: s(12), fontWeight: "800" },
  goldText: { color: "#FFD36B" },
  dangerText: { color: "#FF6B82" },

  majorCard: {
    width: "100%",
    backgroundColor: "#1b1624",
    borderRadius: s(22),
    padding: s(14),
    borderWidth: 1,
    borderColor: "#6d4b1e",
    marginBottom: s(14),
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  majorLabel: { color: "#FFD36B", fontSize: s(11), fontWeight: "900", letterSpacing: 1 },
  countdownText: { color: "#ffb1bf", fontSize: s(12), fontWeight: "800" },
  majorTitle: { color: "#fff", fontSize: s(19), fontWeight: "900", marginTop: s(9) },
  majorBody: { color: "#c9c2d4", fontSize: s(13), lineHeight: s(19), marginTop: s(8) },
  pressureBox: {
    backgroundColor: "#241d14",
    borderRadius: s(14),
    padding: s(12),
    marginTop: s(14),
    borderWidth: 1,
    borderColor: "#5b4721",
  },
  pressureBoxTitle: {
    color: "#FFD36B",
    fontWeight: "900",
    fontSize: s(12),
    marginBottom: s(6),
  },
  pressureBoxText: {
    color: "#d4ccba",
    fontSize: s(12),
    lineHeight: s(18),
  },
  primaryButton: {
    backgroundColor: "#FFD36B",
    borderRadius: s(15),
    paddingVertical: s(14),
    alignItems: "center",
    marginTop: s(15),
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: { color: "#16100a", fontWeight: "900", fontSize: s(15) },

  energyGrid: { width: "100%", flexDirection: "row", gap: s(12), marginBottom: s(14) },
  energyCard: {
    flex: 1,
    backgroundColor: "#121422",
    borderRadius: s(16),
    padding: s(14),
    borderWidth: 1,
    borderColor: "#262b44",
  },
  glowBlue: { borderColor: "#4FC3F7" },
  glowOrange: { borderColor: "#FF7043" },
  energyTitle: { color: "#aeb4d1", fontSize: s(12), fontWeight: "800" },
  energyValue: { color: "#fff", fontSize: s(22), fontWeight: "900", marginTop: s(7) },
  energyHint: { color: "#858aa4", fontSize: s(11), lineHeight: s(15), marginTop: s(8) },
  smallBar: {
    height: s(7),
    backgroundColor: "#2d3145",
    borderRadius: s(999),
    overflow: "hidden",
    marginTop: s(10),
  },

  rewardCard: {
    width: "100%",
    backgroundColor: "#111827",
    borderRadius: s(16),
    padding: s(14),
    borderWidth: 1,
    borderColor: "#26344f",
    marginBottom: s(14),
  },
  rewardTitle: { color: "#BBD7FF", fontSize: s(16), fontWeight: "900" },
  rewardText: { color: "#b7bfd2", fontSize: s(13), lineHeight: s(19), marginTop: s(7) },

  leaderboardTease: {
    width: "100%",
    backgroundColor: "#12131c",
    borderRadius: s(16),
    padding: s(14),
    borderWidth: 1,
    borderColor: "#2a3040",
    marginBottom: s(14),
  },
  leaderboardLabel: {
    color: "#BBD7FF",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1,
  },
  leaderboardTitle: {
    color: "#fff",
    fontSize: s(18),
    fontWeight: "900",
    marginTop: s(7),
  },
  leaderboardBody: {
    color: "#b7bfd2",
    fontSize: s(13),
    lineHeight: s(19),
    marginTop: s(8),
  },

  eventCard: {
    width: "100%",
    backgroundColor: "#21160e",
    borderRadius: s(16),
    padding: s(14),
    borderWidth: 1,
    borderColor: "#6d4b1e",
    marginBottom: s(14),
  },
  eventLabel: {
    color: "#FFD36B",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1,
  },
  eventTitle: {
    color: "#fff",
    fontSize: s(19),
    fontWeight: "900",
    marginTop: s(8),
  },
  eventBody: {
    color: "#d5cabc",
    fontSize: s(13),
    lineHeight: s(19),
    marginTop: s(8),
  },
  eventPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s(8),
    marginTop: s(14),
  },
  eventPill: {
    color: "#1a1204",
    backgroundColor: "#FFD36B",
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: s(999),
    fontSize: s(10),
    fontWeight: "900",
  },

  modesWrapper: { width: "100%", gap: s(9) },
  modeCard: {
    width: "100%",
    backgroundColor: "#151522",
    borderRadius: s(16),
    padding: s(14),
    borderWidth: 1,
    borderColor: "#28283c",
    flexDirection: "row",
    alignItems: "center",
  },
  modeIconBox: {
    width: s(42),
    height: s(42),
    borderRadius: s(14),
    backgroundColor: "#232337",
    alignItems: "center",
    justifyContent: "center",
    marginRight: s(12),
  },
  modeIcon: { fontSize: s(22) },
  modeCopy: { flex: 1 },
  modeTitleRow: { flexDirection: "row", alignItems: "center", gap: s(8), flexWrap: "wrap" },
  modeTitle: { color: "#fff", fontSize: s(15), fontWeight: "900" },
  modeTag: {
    color: "#FFD36B",
    backgroundColor: "#2b2415",
    paddingHorizontal: s(7),
    paddingVertical: s(3),
    borderRadius: s(999),
    fontSize: s(9),
    fontWeight: "900",
  },
  modeSubtitle: { color: "#9ca0b4", fontSize: s(12), lineHeight: s(17), marginTop: s(5) },
  modeArrow: { color: "#777d94", fontSize: s(26), marginLeft: s(8) },
  cosmeticStrip: {
    marginTop: s(14),
    padding: s(10),
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: "rgba(255, 211, 77, 0.28)",
    backgroundColor: "rgba(255, 211, 77, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: s(10),
  },
  cosmeticBannerThumb: {
    width: s(64),
    height: s(36),
    borderRadius: s(10),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  cosmeticStripText: { flex: 1 },
  cosmeticStripTitle: {
    color: "#FFD36B",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  cosmeticStripBody: {
    color: "#EDEBFF",
    fontSize: s(11),
    fontWeight: "700",
    marginTop: s(3),
  },
});

