// HUB_FULL_SCREEN_CODE_PASS
// /app/(app)/hub/index.tsx — Redesigned TriviaWorld Hub
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { auth } from "@/firebase/firebase";
import { ACHIEVEMENT_META } from "@/data/achievementMeta";
import { useQuickGameStore } from "@/store/useQuickGameStore";
import { useIdentityStore } from "@/identity/store/useIdentityStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AVATARS } from "@/identity/avatars/avatarDefinitions";
import { useSeasonStore } from "@/seasons/store/useSeasonStore";
import { useSeasonCountdown } from "@/seasons/hooks/useSeasonCountdown";
import { useChallengesStore } from "@/challenges/store/useChallengesStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useEntitlementStore } from "@/store/entitlementStore";
import { useAchievementsStore } from "@/store/achievementsStore";
import {
  getDayKeyUTC,
  xpRequiredForLevel,
  WEEKLY_DAILY_REWARD,
  WEEKLY_DAILY_TARGET,
} from "@/economy/economyRules";
import { getWeekKeyUTC } from "@/weekly/weeklyLogic";
import {
  getRankProgress,
  HUB_MODE_TONES,
  type HubModeTone,
} from "@/screens/hub/hub.helpers";

const HUB_HERO = require("../../../assets/images/modes/hub_hero_banner.webp");
const QUICK_PLAY_ART = require("../../../assets/images/modes/quick_play_card_art.webp");
const ARENA_ART = require("../../../assets/images/modes/arena_mode_art.webp");
const DAILY_ART = require("../../../assets/images/modes/daily_mode_art.webp");
const LOBBY_ART = require("../../../assets/images/modes/lobby_mode_art.webp");
const SHOP_ART = require("../../../assets/images/modes/shop_mode_art.webp");

export default function HubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const avatarId = useIdentityStore((s) => s.identity?.avatarId);
  const avatar =
    user && !isGuest && avatarId
      ? (AVATARS.find((a) => a.id === avatarId) ?? null)
      : null;

  const { ended } = useSeasonCountdown();
  const resetSeason = useSeasonStore((s) => s.resetSeason);

  const level = usePlayerStore((s) => s.level);
  const xp = usePlayerStore((s) => s.xp);
  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);
  const tickets = usePlayerStore((s) => s.tickets);
  const dailyStreak = usePlayerStore((s) => s.daily?.streak ?? 0);
  const lastClaimDate = usePlayerStore((s) => s.daily?.lastClaimDate ?? null);
  const weekly = usePlayerStore(
    (s) => s.weekly ?? { weekKey: "", progress: 0, claimed: false },
  );

  const justLeveledUp = usePlayerStore((s) => s.justLeveledUp);
  const clearLevelUpFlag = usePlayerStore((s) => s.clearLevelUpFlag);

  const vipExpiresAt = useEntitlementStore((s) => s.vipExpiresAt);
  const vipTier = useEntitlementStore((s) => s.vipTier);
  const isVIPActive = Date.now() < (vipExpiresAt || 0);

  const todayChallenge = useChallengesStore((s) => s.getTodayDailyChallenge());
  const ensureTodayDailyChallenge = useChallengesStore(
    (s) => s.ensureTodayDailyChallenge,
  );

  const achievements = useAchievementsStore((s) => s.achievements);
  const activeAchievement = Object.values(achievements).find(
    (a: any) => !a.unlocked,
  );

  const todayKey = getDayKeyUTC();
  const currentWeekKey = getWeekKeyUTC();
  const lastDailyPlayDate = (weekly as any).lastDailyPlayDate ?? null;

  const weeklyTarget = WEEKLY_DAILY_TARGET;
  const weeklyReward = WEEKLY_DAILY_REWARD;
  const weeklyProgress = Math.max(
    weekly.weekKey === currentWeekKey ? weekly.progress : 0,
    Math.min(dailyStreak, weeklyTarget),
  );

  const xpRequired = xpRequiredForLevel(level);
  const xpPercent = xpRequired > 0 ? Math.min(1, xp / xpRequired) : 0;
  const rankProgress = getRankProgress(xp);

  const fade = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ensureTodayDailyChallenge();
  }, [ensureTodayDailyChallenge]);

  useEffect(() => {
    if (!ended) return;

    const uid = auth.currentUser?.uid ?? null;
    if (uid) resetSeason(uid);
  }, [ended, resetSeason]);

  useEffect(() => {
    if (dailyStreak <= 0) return;

    const currentProgress =
      weekly.weekKey === currentWeekKey ? weekly.progress : 0;
    const repairedProgress = Math.max(
      currentProgress,
      Math.min(dailyStreak, weeklyTarget),
    );

    if (
      weekly.weekKey !== currentWeekKey ||
      weekly.progress < repairedProgress
    ) {
      usePlayerStore.getState().setWeekly({
        ...weekly,
        weekKey: currentWeekKey,
        progress: repairedProgress,
        claimed: weekly.weekKey === currentWeekKey ? weekly.claimed : false,
        lastDailyPlayDate,
      } as any);
    }
  }, [currentWeekKey, dailyStreak, lastDailyPlayDate, weekly, weeklyTarget]);

  useEffect(() => {
    if (!justLeveledUp) return;

    const timer = setTimeout(clearLevelUpFlag, 3000);
    return () => clearTimeout(timer);
  }, [justLeveledUp, clearLevelUpFlag]);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(xpAnim, {
      toValue: xpPercent,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [fade, pulse, xpAnim, xpPercent]);

  const todayStatus = useMemo(() => {
    if (!todayChallenge) return "Loading…";
    if (lastDailyPlayDate === todayKey) return "Completed today ✓";
    return "Play Now →";
  }, [lastDailyPlayDate, todayChallenge, todayKey]);

  const startDailyGame = () => {
    if (!todayChallenge || lastDailyPlayDate === todayKey) return;

    const game = useQuickGameStore.getState();
    game.initGame("daily", "daily");
    router.push("/(app)/play/game");
  };

  return (
    <Animated.ScrollView
      testID="screen-hub"
      style={[styles.container, { opacity: fade }]}
      contentContainerStyle={[styles.content, { paddingBottom: 96 + insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable
          testID="hub-profile-button"
          accessibilityLabel="Open Profile"
          onPress={() => router.push("/profile")}
          style={({ pressed }) => [
            styles.avatarWrap,
            pressed && styles.pressed,
          ]}
        >
          {avatar ? (
            <Image source={avatar.asset} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </Pressable>

        <View style={styles.economyCluster}>
          <CurrencyChip
            icon={require("../../assets/icons/coin.png")}
            value={coins}
          />
          <CurrencyChip
            icon={require("../../assets/icons/gem.png")}
            value={gems}
          />
          <CurrencyChip
            icon={require("../../assets/icons/ticket.png")}
            value={tickets}
          />
        </View>

        {isVIPActive ? (
          <View style={styles.vipBadge}>
            <Text style={styles.vipText}>VIP {vipTier || 1}</Text>
          </View>
        ) : (
          <Pressable
            testID="hub-vip-store-button"
            accessibilityLabel="Open VIP Store"
            onPress={() => router.push("/store?tab=vip" as any)}
            style={({ pressed }) => [
              styles.vipBadgeLocked,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.vipTextLocked}>VIP OFF</Text>
          </Pressable>
        )}
      </View>

      <ImageBackground
        source={HUB_HERO}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(3,8,18,0.04)",
            "rgba(3,10,22,0.20)",
            "rgba(3,8,18,0.58)",
          ]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroAtmosphereShade}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(255,255,255,0.20)",
            "rgba(36,200,255,0.08)",
            "rgba(0,0,0,0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroTopSheen}
        />
        <View style={styles.heroShade}>
          <Text style={styles.heroKicker}>TRIVIA SWEIRKI</Text>
          <Text style={styles.heroTitle}>Ready to Play?</Text>
          <Text style={styles.heroSub}>
            Enter a premium trivia run with focused pacing and clean rewards.
          </Text>

          <ProgressPill
            level={level}
            xp={xp}
            xpRequired={xpRequired}
            xpAnim={xpAnim}
            dailyStreak={dailyStreak}
            onLongPress={() => router.push("/leaderboard")}
          />
        </View>
      </ImageBackground>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Play</Text>
        <Text style={styles.sectionHint}>
          Focused modes and live progression
        </Text>
      </View>

      <ModeCard
        testID="hub-quick-play-button"
        title="Quick Play"
        subtitle="Instant category mix • Clean XP pacing"
        cta="Play"
        art={QUICK_PLAY_ART}
        large
        pulse={pulse}
        tone={HUB_MODE_TONES.quick}
        onPress={() => router.push("/play/quick?category=random" as any)}
      />

      <View style={styles.grid}>
        <ModeCard
          testID="hub-arena-button"
          title="Arena"
          subtitle="Competitive"
          art={ARENA_ART}
          tone={HUB_MODE_TONES.arena}
          compact
          onPress={() => router.push("/arena_reset" as any)}
        />

        <ModeCard
          testID="hub-daily-button"
          title="Daily"
          subtitle="Rewards • Streak"
          art={DAILY_ART}
          tone={HUB_MODE_TONES.daily}
          compact
          badge={lastClaimDate !== todayKey}
          onPress={() => router.push("/daily" as any)}
        />

        <ModeCard
          testID="hub-lobby-button"
          title="Lobby"
          subtitle="Profile • More"
          art={LOBBY_ART}
          tone={HUB_MODE_TONES.lobby}
          compact
          onPress={() => router.push("/more")}
        />

        <ModeCard
          testID="hub-shop-button"
          title="Shop"
          subtitle="VIP • Store"
          art={SHOP_ART}
          tone={HUB_MODE_TONES.shop}
          compact
          onPress={() => router.push("/store" as any)}
        />
      </View>

      <InfoCard title="Today">
        <Pressable
          accessibilityLabel="Today's Challenge"
          onPress={startDailyGame}
          style={({ pressed }) => [
            styles.infoRow,
            pressed &&
              todayChallenge &&
              lastDailyPlayDate !== todayKey &&
              styles.pressed,
          ]}
        >
          <View>
            <Text style={styles.infoLabel}>🎯 Today’s Challenge</Text>
            <Text style={styles.infoSub}>Daily streak pressure</Text>
          </View>
          <Text
            style={[
              styles.infoValue,
              todayChallenge &&
                lastDailyPlayDate !== todayKey &&
                styles.greenText,
            ]}
          >
            {todayStatus}
          </Text>
        </Pressable>
      </InfoCard>

      <InfoCard title="This Week">
        <View style={styles.infoRow}>
          <View>
            <Text style={styles.infoLabel}>🗓️ Weekly Challenge</Text>
            <Text style={styles.infoSub}>
              Complete {weeklyTarget} Daily games this week
            </Text>
          </View>
          <Text style={styles.infoValue}>
            {Math.min(weeklyProgress, weeklyTarget)} / {weeklyTarget}
          </Text>
        </View>

        <View style={styles.bar}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(1, weeklyProgress / weeklyTarget) * 100}%` },
            ]}
          />
        </View>

        {weeklyProgress >= weeklyTarget && !weekly.claimed && (
          <Pressable
            style={({ pressed }) => [
              styles.claimButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              usePlayerStore.getState().claimWeeklyReward(weeklyReward)
            }
          >
            <Text style={styles.claimText}>Claim Weekly Reward</Text>
          </Pressable>
        )}

        {weekly.claimed && (
          <Text style={styles.claimedText}>Weekly reward claimed ✓</Text>
        )}
      </InfoCard>

      {rankProgress.next && (
        <InfoCard title="Rank Progress">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {rankProgress.current.name} → {rankProgress.next.name}
            </Text>
            <Text style={styles.infoValue}>{rankProgress.remaining} XP</Text>
          </View>

          <View style={styles.bar}>
            <Animated.View
              style={[
                styles.barFill,
                {
                  width: xpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </InfoCard>
      )}

      {activeAchievement && (
        <Pressable
          style={({ pressed }) => [
            styles.achievementCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/achievements" as any)}
        >
          <Text style={styles.achievementTitle}>Achievement in progress</Text>
          <Text style={styles.achievementText}>
            {ACHIEVEMENT_META[(activeAchievement as any).id]?.title ??
              (activeAchievement as any).id}{" "}
            — {(activeAchievement as any).progress} /{" "}
            {(activeAchievement as any).target}
          </Text>
        </Pressable>
      )}

      {justLeveledUp && (
        <View style={styles.levelUpOverlay} pointerEvents="none">
          <View style={styles.levelUpCard}>
            <Text style={styles.levelUpTitle}>Level Up!</Text>
            <Text style={styles.levelUpText}>You reached Level {level}</Text>
          </View>
        </View>
      )}
    </Animated.ScrollView>
  );
}

function CurrencyChip({ icon, value }: { icon: any; value: number }) {
  return (
    <View style={styles.currencyChip}>
      <Image source={icon} style={styles.currencyIcon} />
      <Text style={styles.currencyText}>{value}</Text>
    </View>
  );
}

function ProgressPill({
  level,
  xp,
  xpRequired,
  xpAnim,
  dailyStreak,
  onLongPress,
}: {
  level: number;
  xp: number;
  xpRequired: number;
  xpAnim: Animated.Value;
  dailyStreak: number;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      testID="hub-level-card"
      accessibilityLabel="Level Card"
      onLongPress={onLongPress}
      delayLongPress={600}
      style={({ pressed }) => [styles.progressPill, pressed && styles.pressed]}
    >
      <View style={styles.progressTop}>
        <Text style={styles.progressLevel}>Level {level}</Text>
        <Text style={styles.progressXp}>
          {xp} / {xpRequired} XP
        </Text>
      </View>

      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: xpAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <Text style={styles.streakText}>
        🔥 Streak: {dailyStreak} day{dailyStreak === 1 ? "" : "s"}
      </Text>
    </Pressable>
  );
}

function ModeCard({
  title,
  subtitle,
  cta,
  art,
  onPress,
  testID,
  large,
  compact,
  badge,
  pulse,
  tone = HUB_MODE_TONES.quick,
}: {
  title: string;
  subtitle: string;
  cta?: string;
  art: any;
  onPress: () => void;
  testID: string;
  large?: boolean;
  compact?: boolean;
  badge?: boolean;
  pulse?: Animated.Value;
  tone?: HubModeTone;
}) {
  const isShop = title === "Shop";
  const isArena = title === "Arena";
  const isDaily = title === "Daily";
  const isLobby = title === "Lobby";

  const glowStyle = pulse
    ? {
        backgroundColor: tone.glow,
        opacity: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.1, 0.22],
        }),
        transform: [
          {
            scale: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.015],
            }),
          },
        ],
      }
    : null;

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeCard,
        large && styles.modeCardLarge,
        compact && styles.modeCardCompact,
        pressed && styles.pressed,
      ]}
    >
      {pulse && (
        <Animated.View
          pointerEvents="none"
          style={[styles.cardGlow, glowStyle]}
        />
      )}

      <View style={styles.modeSurface}>
        <Image
          source={art}
          style={[
            styles.modeArtLayer,
            { opacity: tone.artOpacity },
            large && styles.quickArtLayer,
            compact && styles.compactArtLayer,
            isShop && styles.shopArtLayer,
            isDaily && styles.dailyArtLayer,
            isArena && styles.arenaArtLayer,
            isLobby && styles.lobbyArtLayer,
          ]}
        />

        <LinearGradient
          pointerEvents="none"
          colors={tone.sheen}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modeMaterialSheen}
        />

      

        <LinearGradient
          pointerEvents="none"
          colors={
  compact
    ? ["rgba(3,8,18,0.22)", "rgba(3,10,22,0.04)", "transparent"]
    : ["rgba(3,8,18,0.62)", "rgba(3,10,22,0.22)", "rgba(3,10,22,0.02)"]
}
          start={{ x: 0, y: 0.45 }}
          end={{ x: 1, y: 0.45 }}
          style={styles.modeReadabilityShade}
        />

        <LinearGradient
          pointerEvents="none"
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.modeBottomVignette}
        />

        <View
          style={[styles.modeAccentBar, { backgroundColor: tone.accent }]}
        />

        <View
          style={[styles.modeOverlay, compact && styles.modeOverlayCompact]}
        >
          <View style={styles.modeCopy}>
            <Text
              style={[styles.modeTitle, compact && styles.modeTitleCompact]}
              numberOfLines={1}
            >
              {title}
            </Text>

            <Text
              style={[styles.modeSub, compact && styles.modeSubCompact]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>

            {cta && (
              <View style={styles.ctaPill}>
                <Text style={styles.ctaText}>{cta}</Text>
              </View>
            )}
          </View>

          {badge && <View style={styles.redBadge} />}
        </View>
      </View>
    </Pressable>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const isToday = title === "Today";
  const isWeek = title === "This Week";

  return (
    <LinearGradient
      colors={
        isToday
          ? ["rgba(16,42,72,0.96)", "rgba(6,24,46,0.98)"]
          : ["rgba(15,34,62,0.95)", "rgba(6,20,42,0.98)"]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.infoCard}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255,255,255,0.16)",
          "rgba(36,200,255,0.04)",
          "rgba(0,0,0,0)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.infoSheen}
      />
      <View
        pointerEvents="none"
        style={[
          styles.infoCornerGlow,
          isToday && styles.infoCornerGlowToday,
          isWeek && styles.infoCornerGlowWeek,
        ]}
      />
      <Text style={styles.infoTitle}>{title}</Text>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071226",
  },

  content: {
    paddingHorizontal: 17,
    paddingTop: 20,
    paddingBottom: 96,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },

  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(143,183,217,0.34)",
  },

  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "#12223A",
  },

  economyCluster: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  currencyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18,31,54,0.88)",
    borderWidth: 1,
    borderColor: "rgba(169,218,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  currencyIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    marginRight: 4,
  },

  currencyText: {
    color: "#D5EFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  vipBadge: {
    backgroundColor: "#8FE6FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  vipText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "900",
  },

  vipBadgeLocked: {
    backgroundColor: "rgba(31,45,74,0.96)",
    borderWidth: 1,
    borderColor: "rgba(169,218,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  vipTextLocked: {
    color: "#AEB7C8",
    fontSize: 11,
    fontWeight: "900",
  },

  hero: {
    minHeight: 236,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#0A1830",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.26)",
    shadowColor: "#000",
    shadowOpacity: 0.38,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 9,
  },

  heroImage: {
    resizeMode: "cover",
    opacity: 1,
  },

  heroAtmosphereShade: {
    ...StyleSheet.absoluteFillObject,
  },

  heroTopSheen: {
    ...StyleSheet.absoluteFillObject,
  },

  heroShade: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 19,
    paddingTop: 25,
  },

  heroKicker: {
    color: "#BFE8FF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  heroTitle: {
    color: "#F4FAFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.35,
  },

  heroSub: {
    color: "#C2D3E8",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 12,
    maxWidth: "74%",
  },

  progressPill: {
    backgroundColor: "rgba(8,18,38,0.68)",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.28)",
    borderRadius: 20,
    padding: 11,
    marginTop: 10,
  },

  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  progressLevel: {
    color: "#A9CBE7",
    fontSize: 12,
    fontWeight: "900",
  },

  progressXp: {
    color: "#E9EDF7",
    fontSize: 11,
    fontWeight: "800",
  },

  progressBar: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(190,231,255,0.18)",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#8FE6FF",
  },

  streakText: {
    color: "#A9CBE7",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "right",
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#F4FAFF",
    fontSize: 15,
    fontWeight: "900",
  },

  sectionHint: {
    color: "#9CB1CB",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  modeCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0A172C",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.22)",
    shadowColor: "#000",
    shadowOpacity: 0.48,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 9,
  },

  modeCardLarge: {
    minHeight: 136,
    marginBottom: 16,
  },

  modeCardCompact: {
    width: "48%",
    minHeight: 124,
    marginBottom: 14,
    borderColor: "rgba(190,231,255,0.28)",
  },

  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#8FE6FF",
    borderRadius: 24,
  },

  modeSurface: {
    flex: 1,
    backgroundColor: "#0A1930",
    overflow: "hidden",
    justifyContent: "center",
  },

  modeAccentBar: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: "#8FB7D9",
    opacity: 0.54,
  },

  modeArt: {
    flex: 1,
  },

  modeArtImage: {
    resizeMode: "cover",
  },

  modeMaterialSheen: {
    ...StyleSheet.absoluteFillObject,
  },

  modeIconReveal: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "58%",
  },

  modeReadabilityShade: {
    ...StyleSheet.absoluteFillObject,
  },

  modeBottomVignette: {
    ...StyleSheet.absoluteFillObject,
  },

  modeOverlay: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },

  modeOverlayCompact: {
    padding: 12,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },

  modeCopy: {
    maxWidth: "70%",
  },

  modeTitle: {
    color: "#F4FAFF",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: -0.35,
  },

 modeTitleCompact: {
  color: "#FFFFFF",
  fontSize: 12,
  lineHeight: 15,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 8,
  },

  modeSub: {
    color: "#C1D6ED",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },

  modeSubCompact: {
    color: "#BDD4EC",
    fontSize: 9,
    lineHeight: 12,
    textShadowColor: "rgba(0,0,0,0.86)",
    textShadowRadius: 6,
  },

  ctaPill: {
    marginTop: 13,
    alignSelf: "flex-start",
    backgroundColor: "#D7F3FF",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: "#A9CBE7",
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },

  ctaText: {
    color: "#061223",
    fontSize: 11,
    fontWeight: "900",
  },

  redBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  infoCard: {
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.22)",
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.38,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },

  infoGoldGlow: {
    position: "absolute",
    top: -32,
    right: -18,
    width: 132,
    height: 88,
    borderRadius: 80,
    backgroundColor: "rgba(169,203,231,0.08)",
  },

  infoTitle: {
    color: "#CBEFFF",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 12,
    textShadowColor: "rgba(169,203,231,0.16)",
    textShadowRadius: 7,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  infoLabel: {
    color: "#F2F7FF",
    fontSize: 11,
    fontWeight: "900",
  },

  infoSub: {
    color: "#A8BAD4",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },

  infoValue: {
    color: "#D5EFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  greenText: {
    color: "#35F2A1",
  },

  bar: {
    height: 9,
    borderRadius: 999,
    backgroundColor: "rgba(190,231,255,0.16)",
    marginTop: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.14)",
  },

  barFill: {
    height: "100%",
    backgroundColor: "#8FE6FF",
    shadowColor: "#A9CBE7",
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },

  claimButton: {
    marginTop: 14,
    backgroundColor: "#8FE6FF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },

  claimText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "900",
  },

  claimedText: {
    color: "#35F2A1",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 13,
  },

  achievementCard: {
    backgroundColor: "rgba(18,36,66,0.96)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.28)",
    borderRadius: 22,
    padding: 18,
    marginTop: 14,
  },

  achievementTitle: {
    color: "#A9CBE7",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
  },

  achievementText: {
    color: "#D2DEF0",
    fontSize: 13,
    fontWeight: "700",
  },

  levelUpOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  levelUpCard: {
    backgroundColor: "#12223A",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.26)",
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 30,
    alignItems: "center",
  },

  levelUpTitle: {
    color: "#A9CBE7",
    fontSize: 22,
    fontWeight: "900",
  },

  levelUpText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },


  modeArtLayer: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  quickArtLayer: {
    transform: [{ scale: 1.03 }],
  },

  compactArtLayer: {
    transform: [{ scale: 1.08 }],
  },

  shopArtLayer: {
    opacity: 1,
    transform: [{ scale: 1.18 }],
  },

  dailyArtLayer: {
    opacity: 1,
    transform: [{ scale: 1.13 }],
  },

  arenaArtLayer: {
    opacity: 0.98,
    transform: [{ scale: 1.11 }],
  },

  lobbyArtLayer: {
    opacity: 0.98,
    transform: [{ scale: 1.12 }],
  },

  iconSpotlight: {
    position: "absolute",
    right: -18,
    top: 8,
    width: 132,
    height: 100,
    borderRadius: 72,
    opacity: 0.34,
  },

  iconSpotlightShop: {
    opacity: 0.348,
    right: -10,
    top: 4,
    width: 142,
    height: 108,
  },

  iconSpotlightDaily: {
    opacity: 0.344,
  },

  infoSheen: {
    ...StyleSheet.absoluteFillObject,
  },

  infoCornerGlow: {
    position: "absolute",
    top: -34,
    right: -18,
    width: 132,
    height: 88,
    borderRadius: 80,
    backgroundColor: "rgba(36,200,255,0.12)",
  },

  infoCornerGlowToday: {
    backgroundColor: "rgba(47,224,162,0.14)",
  },

  infoCornerGlowWeek: {
    backgroundColor: "rgba(143,183,217,0.14)",
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});


