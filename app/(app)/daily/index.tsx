// /app/(app)/daily/index.tsx
// DAILY REWARDS — premium asset-driven screen with safe hydration guard

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text, View, useTheme } from "@/theme";
import { evaluateDailyClaim } from "@/daily/dailyLogic";

import { usePlayerStore } from "@/store/usePlayerStore";
import { getDailyReward } from "@/daily/rewardTable";

import ClaimButton from "@/daily/components/ClaimButton";
import RewardFX from "@/daily/components/RewardFX";
import { getDayKeyUTC } from "@/economy/economyRules";
import { trackEvent } from "@/observability";

const DAILY_HERO_ART = require("../../../assets/images/daily/daily_hero_banner.webp");
const DAY_CLAIMED_ART = require("../../../assets/images/daily/day_claimed_card.webp");
const DAY_ACTIVE_ART = require("../../../assets/images/daily/day_active_card.webp");
const DAY_LOCKED_ART = require("../../../assets/images/daily/day_locked_card.webp");
const REWARD_CHEST_ART = require("../../../assets/images/daily/reward_chest_panel.webp");

type RewardState = "claimed" | "active" | "locked";

type DailyReward = {
  coins: number;
  xp: number;
  gems?: number;
  tickets?: number;
};

function usePlayerStoreHydrated() {
  const [hydrated, setHydrated] = useState(
    () => (usePlayerStore as any).persist?.hasHydrated?.() ?? true,
  );

  useEffect(() => {
    const persistApi = (usePlayerStore as any).persist;
    if (!persistApi?.onFinishHydration) return;

    setHydrated(persistApi.hasHydrated?.() ?? true);
    const unsubscribe = persistApi.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => unsubscribe?.();
  }, []);

  return hydrated;
}

function formatReward(reward: DailyReward) {
  const parts = [`+${reward.coins} Coins`, `+${reward.xp} XP`];

  if ((reward.gems ?? 0) > 0) parts.push(`+${reward.gems} Gems`);
  if ((reward.tickets ?? 0) > 0) parts.push(`+${reward.tickets} Ticket`);

  return parts.join(" • ");
}

function getRewardState({
  day,
  displayDay,
  streak,
  alreadyClaimedToday,
}: {
  day: number;
  displayDay: number;
  streak: number;
  alreadyClaimedToday: boolean;
}): RewardState {
  if (alreadyClaimedToday) return day <= streak ? "claimed" : "locked";
  if (day < displayDay) return "claimed";
  if (day === displayDay) return "active";
  return "locked";
}

function RewardTile({
  day,
  reward,
  state,
}: {
  day: number;
  reward: DailyReward;
  state: RewardState;
}) {
  const art =
    state === "claimed"
      ? DAY_CLAIMED_ART
      : state === "active"
        ? DAY_ACTIVE_ART
        : DAY_LOCKED_ART;

  const extraReward = [
    `+${reward.xp} XP`,
    (reward.gems ?? 0) > 0 ? `+${reward.gems} Gem${reward.gems === 1 ? "" : "s"}` : null,
    (reward.tickets ?? 0) > 0 ? `+${reward.tickets} Ticket${reward.tickets === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <RNView
      style={[
        styles.rewardTile,
        state === "active" && styles.rewardTileActive,
        state === "claimed" && styles.rewardTileClaimed,
        state === "locked" && styles.rewardTileLocked,
      ]}
    >
      <ImageBackground
        source={art}
        resizeMode="cover"
        style={styles.rewardTileBackground}
        imageStyle={styles.rewardTileImage}
      >
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(5,10,20,0.06)",
            "rgba(5,10,20,0.24)",
            "rgba(5,10,20,0.80)",
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <RNView style={styles.rewardTileContent}>
          <RNView style={styles.rewardTileHeader}>
            <Text style={styles.rewardDayText}>DAY {day}</Text>

            {state === "claimed" && (
              <MaterialCommunityIcons name="check-decagram" size={15} color="#8FE6FF" />
            )}

            {state === "locked" && (
              <MaterialCommunityIcons name="lock-outline" size={15} color="#8EA6C6" />
            )}
          </RNView>

          <RNView style={styles.rewardTileCenter}>
            <Text style={styles.rewardTileValue}>{reward.coins}</Text>
            <Text style={styles.rewardTileLabel}>COINS</Text>
          </RNView>

          <Text numberOfLines={1} style={styles.rewardTileSub}>
            {extraReward}
          </Text>
        </RNView>
      </ImageBackground>
    </RNView>
  );
}

export default function DailyRewardsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const hydrated = usePlayerStoreHydrated();

  const daily = usePlayerStore((s) => s.daily);
  const syncing = usePlayerStore((s) => s.syncing);
  const streak = daily?.streak ?? 0;
  const lastClaimDate = daily?.lastClaimDate ?? null;
  const totalClaims = daily?.totalClaims ?? 0;

  const today = getDayKeyUTC();
  const evaluation = evaluateDailyClaim(lastClaimDate, today, streak);

  const [fxTrigger, setFxTrigger] = useState(false);
  const [rewardResult, setRewardResult] = useState<DailyReward | null>(null);

  const displayDay = evaluation.nextStreak;
  const todayReward = getDailyReward(displayDay) as DailyReward;

  const rewardDays = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7].map((day) => ({
        day,
        reward: getDailyReward(day) as DailyReward,
      })),
    [],
  );

  const statusTitle = !hydrated
    ? "Restoring Rewards"
    : evaluation.alreadyClaimedToday
      ? "Claim Secured"
      : "Reward Available";

  const statusText = !hydrated
    ? "Restoring your reward history..."
    : evaluation.alreadyClaimedToday
      ? "Today is locked in. Return tomorrow to extend the streak."
      : evaluation.isNewStreak && streak > 0
        ? "Your streak window expired. Claim today to restart strong."
        : `Day ${displayDay} is ready. Keep the streak alive.`;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}> 
      <RewardFX trigger={fxTrigger} />

      <LinearGradient
        colors={["#071226", "#0B1D38", "#071226"]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView testID="screen-daily" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#F7D36A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <ImageBackground
          source={DAILY_HERO_ART}
          resizeMode="cover"
          imageStyle={styles.heroImage}
          style={styles.heroCard}
        >
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(4,8,18,0.10)", "rgba(4,8,18,0.28)", "rgba(4,8,18,0.80)"]}
            locations={[0, 0.48, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,255,255,0.16)", "rgba(60,205,255,0.05)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <RNView style={styles.heroTopRow}>
            <RNView style={styles.heroCopy}>
              <Text style={styles.kicker}>DAILY LOGIN BONUS</Text>
              <Text style={[theme.typography.h1, styles.title]}>Daily Rewards</Text>
              <Text style={styles.subtitle}>Claim daily. Protect your streak. Unlock richer rewards.</Text>
            </RNView>

            <RNView style={styles.heroIcon}>
              <MaterialCommunityIcons name="calendar-star" size={22} color="#F7D36A" />
            </RNView>
          </RNView>

          <RNView style={styles.statsRow}>
            <RNView style={styles.statPill}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </RNView>
            <RNView style={styles.statPill}>
              <Text style={styles.statValueBlue}>{totalClaims}</Text>
              <Text style={styles.statLabel}>Claims</Text>
            </RNView>
            <RNView style={styles.statPill}>
              <Text style={styles.statValue}>{displayDay}</Text>
              <Text style={styles.statLabel}>Next</Text>
            </RNView>
          </RNView>
        </ImageBackground>

        <LinearGradient
          colors={["rgba(20,44,78,0.96)", "rgba(9,22,46,0.98)"]}
          style={styles.statusCard}
        >
          <RNView style={styles.statusHeader}>
            <MaterialCommunityIcons
              name={evaluation.alreadyClaimedToday ? "shield-check" : "gift-open"}
              size={20}
              color={evaluation.alreadyClaimedToday ? "#8FE6FF" : "#F7D36A"}
            />
            <Text style={styles.statusTitle}>{statusTitle}</Text>
          </RNView>

          <Text style={styles.statusText}>{statusText}</Text>

          {(!hydrated || syncing) && (
            <RNView style={styles.loadingRow}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>{syncing ? "Syncing rewards..." : "Please wait before claiming."}</Text>
            </RNView>
          )}
        </LinearGradient>

        <RNView style={styles.grid}>
          {rewardDays.map(({ day, reward }) => (
            <RewardTile
              key={day}
              day={day}
              reward={reward}
              state={getRewardState({
                day,
                displayDay,
                streak,
                alreadyClaimedToday: evaluation.alreadyClaimedToday,
              })}
            />
          ))}
        </RNView>

        <ImageBackground
          source={REWARD_CHEST_ART}
          resizeMode="cover"
          imageStyle={styles.rewardInfoImage}
          style={styles.rewardInfo}
        >
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(5,10,20,0.14)", "rgba(5,10,20,0.36)", "rgba(5,10,20,0.82)"]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <RNView style={styles.rewardHeader}>
            <MaterialCommunityIcons name="treasure-chest" size={22} color="#F7D36A" />
            <Text style={styles.rewardText}>
              {evaluation.alreadyClaimedToday ? "Tomorrow’s Path" : "Today’s Reward"}
            </Text>
          </RNView>

          <Text style={styles.rewardValue}>{formatReward(todayReward)}</Text>
        </ImageBackground>

        <ClaimButton
          disabled={!hydrated || syncing}
          disabledLabel={!hydrated ? "Restoring Rewards..." : syncing ? "Syncing Rewards..." : undefined}
          onClaimed={(result: any) => {
            if (result?.success) {
              setRewardResult(result.reward);
              setFxTrigger((v) => !v);
              void trackEvent("daily_reward_claimed", {
                streak: result.streak ?? displayDay,
                coins: result.reward?.coins ?? 0,
                xp: result.reward?.xp ?? 0,
              });
            }
          }}
        />

        {rewardResult && (
          <LinearGradient colors={["rgba(247,211,106,0.20)", "rgba(12,28,56,0.98)"]} style={styles.successBox}>
            <MaterialCommunityIcons name="party-popper" size={22} color="#F7D36A" />
            <Text style={styles.successText}>Reward Claimed</Text>
            <Text style={styles.successSub}>{formatReward(rewardResult)}</Text>
          </LinearGradient>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 72,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    color: "#F7D36A",
    fontSize: 15,
    fontWeight: "900",
  },
  heroCard: {
    minHeight: 216,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.28)",
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#0A1830",
    shadowColor: "#000",
    shadowOpacity: 0.42,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 9,
  },
  heroImage: {
    borderRadius: 26,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    maxWidth: "72%",
  },
  kicker: {
    color: "#F7D36A",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.25,
    marginBottom: 3,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 0,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 10,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(247,211,106,0.55)",
    backgroundColor: "rgba(247,211,106,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    color: "#D8E7FF",
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 7,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: "auto",
  },
  statPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.26)",
    borderRadius: 15,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "rgba(7,17,35,0.62)",
  },
  statValue: {
    color: "#F7D36A",
    fontSize: 18,
    fontWeight: "900",
  },
  statValueBlue: {
    color: "#8FE6FF",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "#BBD4EF",
    marginTop: 2,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  statusCard: {
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.22)",
    padding: 14,
    marginBottom: 12,
    overflow: "hidden",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  statusText: {
    color: "#BBD4EF",
    marginTop: 6,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  loadingRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#BBD4EF",
    fontSize: 12,
    fontWeight: "800",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  rewardTile: {
    width: "31.8%",
    height: 118,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(120,176,230,0.30)",
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#071A30",
    shadowColor: "#000",
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  rewardTileBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  rewardTileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  rewardTileActive: {
    borderColor: "rgba(247,211,106,0.88)",
    shadowColor: "#F7D36A",
    shadowOpacity: 0.24,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  rewardTileClaimed: {
    borderColor: "rgba(143,230,255,0.62)",
  },
  rewardTileLocked: {
    borderColor: "rgba(120,148,185,0.24)",
    opacity: 0.86,
  },
  rewardTileContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 9,
    justifyContent: "space-between",
  },
  rewardTileHeader: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rewardDayText: {
    color: "#CFE8FF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.65,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },
  rewardTileCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: 6,
  },
  rewardTileValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 31,
    letterSpacing: -0.45,
    textShadowColor: "rgba(0,0,0,0.98)",
    textShadowRadius: 9,
  },
  rewardTileLabel: {
    color: "#F7D36A",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.55,
    textTransform: "uppercase",
    marginTop: 1,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },
  rewardTileSub: {
    color: "#9FD9FF",
    fontSize: 10,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },
  rewardInfo: {
    minHeight: 122,
    marginBottom: 12,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(247,211,106,0.34)",
    padding: 14,
    overflow: "hidden",
    backgroundColor: "#0A1830",
    justifyContent: "flex-end",
  },
  rewardInfoImage: {
    borderRadius: 21,
  },
  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rewardText: {
    color: "#F7D36A",
    fontSize: 15,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowRadius: 7,
  },
  rewardValue: {
    color: "#FFFFFF",
    marginTop: 8,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  successBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(247,211,106,0.46)",
    alignItems: "center",
    overflow: "hidden",
  },
  successText: {
    color: "#F7D36A",
    marginTop: 6,
    fontSize: 15,
    fontWeight: "900",
  },
  successSub: {
    color: "#FFFFFF",
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});
