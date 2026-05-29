import {
  Animated,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";

import AnimatedProgressBar from "@/components/AnimatedProgressBar";
import { useThemedAlert } from "@/components/ThemedAlert";
import { CosmeticCategory } from "@/cosmetics/types";
import { getCosmeticAssetSource } from "@/cosmetics/cosmeticAssets";
import { getEquippedCosmetic } from "@/cosmetics/cosmeticSelectors";
import { useArenaRankSystem } from "@/arena/store/useArenaRankSystem";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { s } from "@/arena/theme/arenaSizing";
import { usePlayerStore } from "@/store/usePlayerStore";
import { ARENA_MODE_CONFIG, formatArenaCost } from "@/arena/arenaEconomyRules";
import { formatLiveEventTimeRemaining, getActiveArenaLiveEvent, getArenaLiveEventModeTag } from "@/arena/live/arenaLiveEvents";
import {
  getArenaSeasonCountdown,
  getArenaSeasonMotivation,
  getArenaSeasonReward,
  getRankLabel,
} from "@/arena/season/arenaSeasonPrestige";
import { trackEvent, trackScreenView } from "@/observability";

import { ArenaModeCard } from "@/screens/arena/arena.components";
import { getSRPercent } from "@/screens/arena/arena.helpers";

const ARENA_HERO_ART = require("../../../assets/images/arena/arena_hero_banner.webp");
const RANKED_MODE_ART = require("../../../assets/images/arena/ranked_mode_card.webp");
const SURVIVAL_MODE_ART = require("../../../assets/images/arena/survival_mode_card.webp");
const POWER_MODE_ART = require("../../../assets/images/arena/power_mode_card.webp");
const TOURNAMENT_MODE_ART = require("../../../assets/images/arena/tournament_mode_card.webp");

export default function ArenaHub() {
  const { showThemedAlert, themedAlert } = useThemedAlert();
  const {
    rank,
    sr,
    season,
    highestSR,
    highestRank,
    seasonEndsAt,
    lastSeasonSnapshot,
    resetSeason,
    claimLastSeasonReward,
    dismissLastSeasonSnapshot,
  } = useArenaRankSystem();
  const { lastDailyPlayedAt, weeklyPlays, dailyStreak } = useTournamentStore();
  const playerCosmetics = usePlayerStore((state) => state.cosmetics);
  const equippedArenaBanner = getEquippedCosmetic(
    playerCosmetics,
    CosmeticCategory.ARENA_BANNER,
  );
  const equippedAnswerTrail = getEquippedCosmetic(
    playerCosmetics,
    CosmeticCategory.ANSWER_TRAIL,
  );
  const equippedStreakAura = getEquippedCosmetic(
    playerCosmetics,
    CosmeticCategory.STREAK_AURA,
  );
  const arenaBannerSource = getCosmeticAssetSource(equippedArenaBanner?.icon);
  const activeLiveEvent = getActiveArenaLiveEvent();
  const activeLiveEventTimeLeft = formatLiveEventTimeRemaining(activeLiveEvent.endsAt);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0.7)).current;

  React.useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.035,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
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
      ]),
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

  const seasonReward = getArenaSeasonReward(highestSR);
  const seasonCountdown = getArenaSeasonCountdown(seasonEndsAt);
  const seasonMotivation = getArenaSeasonMotivation(sr, highestSR);
  const highestRankLabel = getRankLabel(highestRank);
  const seasonExpired = seasonCountdown === "ENDING";

  const pressureLabel = isNearPromotion
    ? "Promotion Window"
    : isDangerZone
      ? "Danger Zone"
      : "Rank Pressure";
  const pressureColor = isDangerZone
    ? "#FF5C7A"
    : isNearPromotion
      ? "#FFD36B"
      : "#8FE6FF";

  return (
    <ScrollView
      testID="screen-arena"
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={ARENA_HERO_ART}
        resizeMode="cover"
        imageStyle={styles.heroImage}
        style={styles.heroCard}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(3,8,18,0.88)",
            "rgba(3,8,18,0.50)",
            "rgba(3,8,18,0.10)",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(255,255,255,0.14)",
            "rgba(60,205,255,0.04)",
            "rgba(0,0,0,0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.liveRow}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.livePill}>LIVE ARENA</Text>
          </Animated.View>

          <Text style={styles.seasonPill}>Season {season}</Text>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.heroKicker}>COMPETITIVE ECOSYSTEM</Text>
          <Text style={styles.heroTitle}>Arena Season {season}</Text>
          <Text style={styles.heroSubtitle}>
            Climb, protect your peak, and lock seasonal prestige rewards.
          </Text>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatBoxPrimary}>
            <Text style={styles.heroStatValue}>{rank.league}</Text>
            <Text style={styles.heroStatLabel}>League</Text>
          </View>

          <View style={styles.heroStatBox}>
            <Text style={styles.heroStatValueBlue}>{sr}</Text>
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
              <Image
                source={arenaBannerSource}
                style={styles.cosmeticBannerThumb}
                resizeMode="cover"
              />
            ) : null}
            <View style={styles.cosmeticStripText}>
              <Text style={styles.cosmeticStripTitle}>
                Equipped Arena Style
              </Text>
              <Text style={styles.cosmeticStripBody} numberOfLines={1}>
                {[
                  equippedArenaBanner?.name,
                  equippedAnswerTrail?.name,
                  equippedStreakAura?.name,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>
            </View>
          </View>
        )}
      </ImageBackground>

      <LinearGradient
        colors={["rgba(20,44,78,0.96)", "rgba(8,19,40,0.98)"]}
        style={styles.rankCard}
      >
        <View style={styles.rankTopRow}>
          {rank.icon ? (
            <Image source={{ uri: rank.icon }} style={styles.rankIcon} />
          ) : (
            <View style={styles.rankIconFallback}>
              <Text style={styles.rankIconFallbackText}>🏅</Text>
            </View>
          )}

          <View style={styles.rankTextBlock}>
            <Text style={styles.rankLabel}>{pressureLabel}</Text>
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
          fillColor={pressureColor}
          trackColor="rgba(190,231,255,0.16)"
          glowColor={pressureColor}
          style={styles.progressBarWrapper}
        />

        <View style={styles.pressureRow}>
          <Text style={[styles.pressureText, { color: pressureColor }]}>
            {Math.round(progress)}% through division
          </Text>
          <Text style={styles.pressureText}>Rank Shield</Text>
        </View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.seasonLiveCard,
          seasonExpired && styles.seasonLiveCardExpired,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.seasonLiveLabel}>SEASON STATUS</Text>
          <Text style={styles.seasonLiveTitle}>
            {seasonExpired ? `Season ${season} Complete` : `Season ${season} Ends In`}
          </Text>
          {seasonExpired ? (
            <Text style={styles.seasonLiveBody}>
              Close the season, lock your peak, and start the next climb.
            </Text>
          ) : null}
        </View>
        {seasonExpired ? (
          <TouchableOpacity
            style={styles.seasonResetButton}
            activeOpacity={0.88}
            onPress={() => {
              const snapshot = resetSeason();
              showThemedAlert(
                "Season Closed",
                `Season ${snapshot.season} locked at ${snapshot.highestRankLabel}. Claim ${snapshot.tokenReward} arena tokens from the season card.`,
                "success",
              );
            }}
          >
            <Text style={styles.seasonResetButtonText}>Start Next</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.seasonCountdown}>{seasonCountdown}</Text>
        )}
      </Animated.View>

      <LinearGradient
        colors={["rgba(247,211,106,0.18)", "rgba(12,28,56,0.98)"]}
        style={styles.majorCard}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.majorLabel}>DAILY ARENA</Text>
          <Text style={styles.countdownText}>Refreshes daily</Text>
        </View>

        <Text style={styles.majorTitle}>Daily Competitive Push</Text>
        <Text style={styles.majorBody}>
          Play today’s ranked pressure run and keep momentum alive.
        </Text>

        <TouchableOpacity
          testID="arena-daily-ranked-button"
          style={[
            styles.primaryButton,
            playedToday && styles.primaryButtonDisabled,
          ]}
          onPress={() => {
            if (playedToday) {
              showThemedAlert(
                "Daily Arena Complete",
                "You already completed today's Daily Arena. Come back tomorrow.",
                "info",
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
      </LinearGradient>

      <View style={styles.energyGrid}>
        <View style={[styles.energyCard, weeklyAlmostDone && styles.glowBlue]}>
          <Text style={styles.energyTitle}>Weekly Push</Text>
          <Text style={styles.energyValue}>
            {weeklyProgress}/{weeklyGoal}
          </Text>

          <AnimatedProgressBar
            percent={weeklyPercent}
            height={s(7)}
            fillColor="#4FC3F7"
            trackColor="rgba(190,231,255,0.16)"
            glowColor="#4FC3F7"
            style={styles.smallBar}
          />

          <Text style={styles.energyHint} numberOfLines={2}>
            {weeklyAlmostDone
              ? "One more run for the weekly chest."
              : "Build weekly arena momentum."}
          </Text>
        </View>

        <View style={[styles.energyCard, isOnFire && styles.glowOrange]}>
          <Text style={styles.energyTitle}>Streak Heat</Text>
          <Text style={styles.energyValue}>🔥 {safeDailyStreak}</Text>
          <Text style={styles.energyHint} numberOfLines={2}>
            {isOnFire
              ? "You are on fire. Keep the chain alive."
              : "Play daily to start your streak."}
          </Text>
        </View>
      </View>

      <View style={styles.prestigeRow}>
        <View style={styles.prestigeCard}>
          <Text style={styles.prestigeLabel}>SEASON PEAK</Text>
          <Text style={styles.prestigeTitle}>{highestRankLabel}</Text>
          <Text style={styles.prestigeText} numberOfLines={2}>
            Peak SR {highestSR}. {seasonReward.profileLabel} becomes your
            end-season flex.
          </Text>
        </View>

        <View style={styles.prestigeCard}>
          <Text style={styles.prestigeLabelBlue}>REWARD TIER</Text>
          <Text style={styles.prestigeTitle}>{seasonReward.title}</Text>
          <Text style={styles.prestigeText} numberOfLines={2}>
            {seasonReward.rewardLabel}. {seasonMotivation}
          </Text>
        </View>
      </View>

      {lastSeasonSnapshot ? (
        <View style={styles.lastSeasonCard}>
          <Text style={styles.lastSeasonLabel}>SEASON RECAP</Text>
          <Text style={styles.lastSeasonTitle}>
            Season {lastSeasonSnapshot.season} • {lastSeasonSnapshot.highestRankLabel}
          </Text>
          <Text style={styles.lastSeasonText}>
            Peak SR {lastSeasonSnapshot.highestSR} • Final SR {lastSeasonSnapshot.finalSR}
          </Text>
          <Text style={styles.lastSeasonText}>
            {lastSeasonSnapshot.rewardTitle}: {lastSeasonSnapshot.rewardLabel}
          </Text>
          <Text style={styles.lastSeasonText}>
            New season started at {lastSeasonSnapshot.softResetSR} SR.
          </Text>

          <View style={styles.lastSeasonActions}>
            <TouchableOpacity
              style={[
                styles.lastSeasonClaimButton,
                lastSeasonSnapshot.claimedAt && styles.lastSeasonClaimButtonDisabled,
              ]}
              activeOpacity={0.88}
              disabled={!!lastSeasonSnapshot.claimedAt}
              onPress={() => {
                const claimed = claimLastSeasonReward();
                showThemedAlert(
                  claimed ? "Season Reward Claimed" : "Already Claimed",
                  claimed
                    ? `+${lastSeasonSnapshot.tokenReward} arena tokens added to your Arena balance.`
                    : "This season reward was already claimed.",
                  claimed ? "success" : "info",
                );
              }}
            >
              <Text style={styles.lastSeasonClaimButtonText}>
                {lastSeasonSnapshot.claimedAt
                  ? "Claimed"
                  : `Claim +${lastSeasonSnapshot.tokenReward}`}
              </Text>
            </TouchableOpacity>

            {lastSeasonSnapshot.claimedAt ? (
              <TouchableOpacity
                style={styles.lastSeasonDismissButton}
                activeOpacity={0.88}
                onPress={dismissLastSeasonSnapshot}
              >
                <Text style={styles.lastSeasonDismissText}>Dismiss</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ) : null}

      <Animated.View
        style={[styles.eventCard, { transform: [{ scale: pulseAnim }] }]}
      >
        <Text style={styles.eventLabel}>{activeLiveEvent.label} • {activeLiveEventTimeLeft}</Text>
        <Text style={styles.eventTitle}>{activeLiveEvent.title}</Text>
        <Text style={styles.eventBody}>
          {activeLiveEvent.body}
        </Text>
        <Text style={styles.eventReward}>{activeLiveEvent.rewardLabel}</Text>
      </Animated.View>

      <View style={styles.modesWrapper}>
        <Text style={styles.sectionTitle}>Choose Arena</Text>

        <ArenaModeCard
          testID="arena-mode-ranked"
          art={RANKED_MODE_ART}
          accent="#D6A93A"
          title="Ranked Arena"
          subtitle={`Entry: ${formatArenaCost("ranked")} • ${ARENA_MODE_CONFIG.ranked.rewardLabel}.`}
          tag={getArenaLiveEventModeTag("ranked", activeLiveEvent) ?? (isNearPromotion ? "PROMOTION" : isDangerZone ? "PROTECT" : "COMPETITIVE")}
          onPress={() => {
            router.push("/(app)/arena_reset/ranked");
          }}
        />

        <ArenaModeCard
          art={SURVIVAL_MODE_ART}
          accent="#8FE6FF"
          title="Survival Arena"
          subtitle={`Entry: ${formatArenaCost("survival")} • ${ARENA_MODE_CONFIG.survival.rewardLabel}.`}
          tag="HIGH SCORE"
          onPress={() => {
            router.push("/(app)/arena_reset/survival");
          }}
        />

        <ArenaModeCard
          art={POWER_MODE_ART}
          accent="#4FC3F7"
          title="Power-Up Arena"
          subtitle={`Entry: ${formatArenaCost("power")} • ${ARENA_MODE_CONFIG.power.rewardLabel}.`}
          tag="STRATEGY"
          onPress={() => {
            router.push("/(app)/arena_reset/power");
          }}
        />

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <ArenaModeCard
            testID="arena-mode-tournaments"
            art={TOURNAMENT_MODE_ART}
            accent="#D6A93A"
            title="Tournaments"
            subtitle={`Entry: ${formatArenaCost("tournament")} • ${ARENA_MODE_CONFIG.tournament.rewardLabel}.`}
            tag="LIVE EVENT"
            onPress={() => {
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
  container: { flex: 1, backgroundColor: "#071226" },
  content: {
    alignItems: "center",
    paddingHorizontal: s(14),
    paddingTop: s(28),
    paddingBottom: s(40),
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#071226",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: "#BBD7FF", fontSize: s(16), fontWeight: "800" },

  heroCard: {
    width: "100%",
    minHeight: s(256),
    borderRadius: s(28),
    padding: s(22),
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.30)",
    marginBottom: s(14),
    overflow: "hidden",
    backgroundColor: "#0A1830",
    shadowColor: "#000",
    shadowOpacity: 0.42,
    shadowRadius: s(28),
    shadowOffset: { width: 0, height: s(12) },
    elevation: 9,
  },
  heroImage: { borderRadius: s(28) },
  liveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  livePill: {
    color: "#120D05",
    backgroundColor: "#FFD36B",
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: s(999),
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 0.8,
    overflow: "hidden",
  },
  seasonPill: {
    color: "#D8E7FF",
    backgroundColor: "rgba(7,17,35,0.66)",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.24)",
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    borderRadius: s(999),
    fontSize: s(11),
    fontWeight: "900",
    overflow: "hidden",
  },
  heroCopy: {
    maxWidth: "72%",
    marginTop: s(30),
  },
  heroKicker: {
    color: "#FFD36B",
    fontSize: s(10),
    fontWeight: "900",
    letterSpacing: 1.15,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: s(8),
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: s(28),
    fontWeight: "900",
    marginTop: s(5),
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: s(10),
  },
  heroSubtitle: {
    color: "#D8E7FF",
    fontSize: s(13),
    fontWeight: "800",
    lineHeight: s(18),
    marginTop: s(7),
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: s(7),
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: s(8),
    marginTop: "auto",
  },
  heroStatBox: {
    flex: 1,
    backgroundColor: "rgba(12,26,48,0.78)",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.24)",
    borderRadius: s(16),
    paddingVertical: s(9),
    alignItems: "center",
  },
  heroStatBoxPrimary: {
    flex: 1.18,
    backgroundColor: "rgba(247,211,106,0.16)",
    borderWidth: 1,
    borderColor: "rgba(247,211,106,0.38)",
    borderRadius: s(16),
    paddingVertical: s(9),
    alignItems: "center",
  },
  heroStatValue: { color: "#FFD36B", fontSize: s(15), fontWeight: "900" },
  heroStatValueBlue: { color: "#8FE6FF", fontSize: s(15), fontWeight: "900" },
  heroStatLabel: {
    color: "#BBD7FF",
    fontSize: s(10),
    fontWeight: "900",
    marginTop: s(3),
    textTransform: "uppercase",
    letterSpacing: 0.55,
  },

  rankCard: {
    width: "100%",
    borderRadius: s(24),
    padding: s(15),
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.24)",
    marginBottom: s(12),
    overflow: "hidden",
  },
  rankTopRow: { flexDirection: "row", alignItems: "center", gap: s(13) },
  rankIcon: { width: s(62), height: s(62) },
  rankIconFallback: {
    width: s(62),
    height: s(62),
    borderRadius: s(22),
    backgroundColor: "rgba(247,211,106,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(247,211,106,0.45)",
  },
  rankIconFallbackText: { fontSize: s(30) },
  rankTextBlock: { flex: 1 },
  rankLabel: {
    color: "#FFD36B",
    fontSize: s(10),
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  rankName: {
    color: "#FFFFFF",
    fontSize: s(19),
    fontWeight: "900",
    marginTop: s(3),
  },
  rankSubtitle: {
    color: "#BBD7FF",
    fontSize: s(12),
    fontWeight: "800",
    marginTop: s(4),
    lineHeight: s(17),
  },
  progressBarWrapper: {
    height: s(10),
    borderRadius: s(999),
    overflow: "hidden",
    marginTop: s(15),
  },
  pressureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: s(9),
  },
  pressureText: { color: "#9DB6D8", fontSize: s(11), fontWeight: "900" },

  seasonLiveCard: {
    width: "100%",
    backgroundColor: "rgba(12,28,56,0.92)",
    borderRadius: s(19),
    padding: s(14),
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.30)",
    marginBottom: s(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: s(10),
  },
  seasonLiveCardExpired: {
    borderColor: "rgba(247,211,106,0.46)",
    backgroundColor: "rgba(30,25,42,0.94)",
  },
  seasonLiveLabel: {
    color: "#8FE6FF",
    fontSize: s(10),
    fontWeight: "900",
    letterSpacing: 1,
  },
  seasonLiveTitle: {
    color: "#FFFFFF",
    fontSize: s(15),
    fontWeight: "900",
    marginTop: s(4),
  },
  seasonLiveBody: {
    color: "#BBD7FF",
    fontSize: s(10),
    fontWeight: "800",
    lineHeight: s(14),
    marginTop: s(4),
  },
  seasonResetButton: {
    backgroundColor: "#8FEAFF",
    borderRadius: s(13),
    paddingHorizontal: s(12),
    paddingVertical: s(9),
    borderWidth: 1,
    borderColor: "#C6F1FF",
  },
  seasonResetButtonText: {
    color: "#062033",
    fontSize: s(11),
    fontWeight: "900",
  },
  seasonCountdown: {
    color: "#FFD36B",
    fontSize: s(27),
    fontWeight: "900",
  },

  majorCard: {
    width: "100%",
    borderRadius: s(22),
    padding: s(15),
    borderWidth: 1,
    borderColor: "rgba(247,211,106,0.35)",
    marginBottom: s(12),
    overflow: "hidden",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  majorLabel: {
    color: "#FFD36B",
    fontSize: s(10),
    fontWeight: "900",
    letterSpacing: 1,
  },
  countdownText: { color: "#8FE6FF", fontSize: s(11), fontWeight: "900" },
  majorTitle: {
    color: "#FFFFFF",
    fontSize: s(19),
    fontWeight: "900",
    marginTop: s(9),
  },
  majorBody: {
    color: "#D8E7FF",
    fontSize: s(12),
    fontWeight: "800",
    lineHeight: s(18),
    marginTop: s(5),
  },
  primaryButton: {
    backgroundColor: "#10233D",
    borderRadius: s(16),
    paddingVertical: s(13),
    alignItems: "center",
    marginTop: s(13),
    borderWidth: 1,
    borderColor: "#D6A84F",
    shadowColor: "#4DA3FF",
    shadowOpacity: 0.28,
    shadowRadius: s(10),
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  primaryButtonDisabled: { opacity: 0.55 },
  primaryButtonText: { color: "#F7D37A", fontWeight: "900", fontSize: s(14) },

  energyGrid: {
    width: "100%",
    flexDirection: "row",
    gap: s(10),
    marginBottom: s(12),
  },
  energyCard: {
    flex: 1,
    backgroundColor: "rgba(12,28,56,0.92)",
    borderRadius: s(18),
    padding: s(13),
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.20)",
  },
  glowBlue: { borderColor: "#4FC3F7" },
  glowOrange: { borderColor: "#FF7043" },
  energyTitle: { color: "#BBD7FF", fontSize: s(11), fontWeight: "900" },
  energyValue: {
    color: "#FFFFFF",
    fontSize: s(22),
    fontWeight: "900",
    marginTop: s(6),
  },
  energyHint: {
    color: "#9DB6D8",
    fontSize: s(10),
    fontWeight: "800",
    lineHeight: s(14),
    marginTop: s(7),
  },
  smallBar: {
    height: s(7),
    borderRadius: s(999),
    overflow: "hidden",
    marginTop: s(9),
  },

  prestigeRow: {
    width: "100%",
    flexDirection: "row",
    gap: s(10),
    marginBottom: s(12),
  },
  prestigeCard: {
    flex: 1,
    backgroundColor: "rgba(8,19,40,0.96)",
    borderRadius: s(18),
    padding: s(13),
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.20)",
  },
  prestigeLabel: {
    color: "#FFD36B",
    fontSize: s(10),
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  prestigeLabelBlue: {
    color: "#8FE6FF",
    fontSize: s(10),
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  prestigeTitle: {
    color: "#FFFFFF",
    fontSize: s(16),
    fontWeight: "900",
    marginTop: s(5),
  },
  prestigeText: {
    color: "#9DB6D8",
    fontSize: s(10),
    fontWeight: "800",
    lineHeight: s(14),
    marginTop: s(5),
  },

  lastSeasonCard: {
    width: "100%",
    backgroundColor: "rgba(20,38,72,0.94)",
    borderRadius: s(18),
    padding: s(13),
    borderWidth: 1,
    borderColor: "rgba(247,211,106,0.26)",
    marginBottom: s(12),
  },
  lastSeasonLabel: {
    color: "#FFD36B",
    fontSize: s(10),
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  lastSeasonTitle: {
    color: "#FFFFFF",
    fontSize: s(15),
    fontWeight: "900",
    marginTop: s(5),
  },
  lastSeasonText: {
    color: "#BBD7FF",
    fontSize: s(11),
    fontWeight: "800",
    lineHeight: s(16),
    marginTop: s(5),
  },
  lastSeasonActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
    marginTop: s(12),
  },
  lastSeasonClaimButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8FEAFF",
    borderRadius: s(13),
    paddingVertical: s(10),
    borderWidth: 1,
    borderColor: "#C6F1FF",
  },
  lastSeasonClaimButtonDisabled: {
    backgroundColor: "rgba(75,85,105,0.72)",
    borderColor: "rgba(190,210,230,0.18)",
  },
  lastSeasonClaimButtonText: {
    color: "#062033",
    fontSize: s(11),
    fontWeight: "900",
  },
  lastSeasonDismissButton: {
    paddingHorizontal: s(12),
    paddingVertical: s(10),
    borderRadius: s(13),
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.24)",
    backgroundColor: "rgba(8,22,44,0.78)",
  },
  lastSeasonDismissText: {
    color: "#BBD7FF",
    fontSize: s(11),
    fontWeight: "900",
  },

  eventCard: {
    width: "100%",
    backgroundColor: "#0E1930",
    borderRadius: s(18),
    padding: s(14),
    borderWidth: 1,
    borderColor: "#355D9B",
    marginBottom: s(14),
    shadowColor: "#4DA3FF",
    shadowOpacity: 0.18,
    shadowRadius: s(12),
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  eventLabel: {
    color: "#F7D37A",
    fontSize: s(10),
    fontWeight: "900",
    letterSpacing: 1,
  },
  eventTitle: {
    color: "#FFFFFF",
    fontSize: s(18),
    fontWeight: "900",
    marginTop: s(7),
  },
  eventBody: {
    color: "#BFE8FF",
    fontSize: s(12),
    fontWeight: "800",
    lineHeight: s(17),
    marginTop: s(6),
  },
  eventReward: {
    color: "#8FEAFF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    marginTop: 6,
  },

  modesWrapper: { width: "100%" },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: s(18),
    fontWeight: "900",
    marginBottom: s(10),
    letterSpacing: -0.2,
  },

  cosmeticStrip: {
    marginTop: s(12),
    padding: s(10),
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: "rgba(255, 211, 77, 0.30)",
    backgroundColor: "rgba(7,17,35,0.62)",
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


