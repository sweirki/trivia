// /app/(app)/daily/index.tsx
// DAILY REWARDS — premium themed screen with safe hydration guard

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  ScrollView,
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

import RewardDayBox from "@/daily/components/RewardDayBox";
import ClaimButton from "@/daily/components/ClaimButton";
import RewardFX from "@/daily/components/RewardFX";
import { getDayKeyUTC } from "@/economy/economyRules";
import { trackEvent } from "@/observability";

function usePlayerStoreHydrated() {
  const [hydrated, setHydrated] = useState(
    () => (usePlayerStore as any).persist?.hasHydrated?.() ?? true
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
  const [rewardResult, setRewardResult] = useState<{
    coins: number;
    xp: number;
    gems?: number;
    tickets?: number;
  } | null>(null);

  const displayDay = evaluation.nextStreak;
  const todayReward = getDailyReward(displayDay);

  const rewardDays = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7].map((day) => ({
        day,
        reward: getDailyReward(day),
      })),
    []
  );

  const statusText = !hydrated
    ? "Restoring your reward history..."
    : evaluation.alreadyClaimedToday
      ? "Today’s reward is locked in. Come back tomorrow to continue your run."
      : evaluation.isNewStreak && streak > 0
        ? "Your streak window expired. Claim today to restart strong."
        : `Day ${displayDay} is ready. Keep the streak alive.`;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <RewardFX trigger={fxTrigger} />

      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundSoft, theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView testID="screen-daily" contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={theme.colors.gold}
          />
          <Text style={[styles.backText, { color: theme.colors.gold }]}>Back</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={["rgba(26,37,64,0.98)", "rgba(18,26,45,0.96)"]}
          style={[styles.heroCard, { borderColor: theme.colors.border }]}
        >
          <RNView style={styles.heroTopRow}>
            <RNView>
              <Text style={[styles.kicker, { color: theme.colors.goldSoft }]}>
                DAILY LOGIN BONUS
              </Text>
              <Text style={[theme.typography.h1, styles.title]}>
                Daily Rewards
              </Text>
            </RNView>

            <RNView
              style={[
                styles.heroIcon,
                {
                  backgroundColor: "rgba(245,196,81,0.10)",
                  borderColor: theme.colors.goldDeep,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="calendar-star"
                size={22}
                color={theme.colors.gold}
              />
            </RNView>
          </RNView>

          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Claim once per day, protect your streak, and unlock better weekly rewards.
          </Text>

          <RNView style={styles.statsRow}>
            <RNView style={[styles.statPill, { borderColor: theme.colors.border }]}>
              <Text style={[styles.statValue, { color: theme.colors.gold }]}>
                {streak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Streak
              </Text>
            </RNView>

            <RNView style={[styles.statPill, { borderColor: theme.colors.border }]}>
              <Text style={[styles.statValue, { color: theme.colors.gold }]}>
                {totalClaims}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Claims
              </Text>
            </RNView>

            <RNView style={[styles.statPill, { borderColor: theme.colors.border }]}>
              <Text style={[styles.statValue, { color: theme.colors.gold }]}>
                {displayDay}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Next Day
              </Text>
            </RNView>
          </RNView>
        </LinearGradient>

        <RNView
          style={[
            styles.statusCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <RNView style={styles.statusHeader}>
            <MaterialCommunityIcons
              name={evaluation.alreadyClaimedToday ? "shield-check" : "gift-open"}
              size={20}
              color={theme.colors.gold}
            />
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
              {evaluation.alreadyClaimedToday ? "Claim Secured" : "Reward Available"}
            </Text>
          </RNView>

          <Text style={[styles.statusText, { color: theme.colors.textMuted }]}>
            {statusText}
          </Text>

          {!hydrated && (
            <RNView style={styles.loadingRow}>
              <ActivityIndicator size="small" />
              <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
                Please wait before claiming.
              </Text>
            </RNView>
          )}
        </RNView>

        <RNView style={styles.grid}>
          {rewardDays.map(({ day, reward }) => (
            <RewardDayBox
              key={day}
              day={day}
              currentDay={displayDay}
              claimed={evaluation.alreadyClaimedToday ? day <= streak : day < displayDay}
              upcoming={day > displayDay}
              coins={reward.coins}
              xp={reward.xp}
            />
          ))}
        </RNView>

        <LinearGradient
          colors={["rgba(245,196,81,0.16)", "rgba(26,37,64,0.94)"]}
          style={[styles.rewardInfo, { borderColor: theme.colors.border }]}
        >
          <RNView style={styles.rewardHeader}>
            <MaterialCommunityIcons
              name="treasure-chest"
              size={22}
              color={theme.colors.gold}
            />
            <Text style={[styles.rewardText, { color: theme.colors.gold }]}>
              {evaluation.alreadyClaimedToday ? "Tomorrow’s Path" : "Today’s Reward"}
            </Text>
          </RNView>

          <Text style={[styles.rewardValue, { color: theme.colors.text }]}>
            +{todayReward.coins} Coins • +{todayReward.xp} XP
            {todayReward.gems > 0 ? ` • +${todayReward.gems} Gems` : ""}
            {todayReward.tickets > 0 ? ` • +${todayReward.tickets} Ticket` : ""}
          </Text>
        </LinearGradient>

        <ClaimButton
          disabled={!hydrated}
          disabledLabel={!hydrated ? "Restoring Rewards..." : undefined}
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
          <RNView
            style={[
              styles.successBox,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.gold,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="party-popper"
              size={22}
              color={theme.colors.gold}
            />
            <Text style={[styles.successText, { color: theme.colors.gold }]}>
              Reward Claimed
            </Text>
            <Text style={[styles.successSub, { color: theme.colors.text }]}>
              +{rewardResult.coins} Coins • +{rewardResult.xp} XP
              {rewardResult.gems ? ` • +${rewardResult.gems} Gems` : ""}
              {rewardResult.tickets ? ` • +${rewardResult.tickets} Ticket` : ""}
            </Text>
          </RNView>
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
    fontSize: 15,
    fontWeight: "800",
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    marginBottom: 0,
    lineHeight: 34,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  statPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  statusCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  statusText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  loadingRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  rewardInfo: {
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rewardText: {
    fontSize: 15,
    fontWeight: "900",
  },
  rewardValue: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 23,
  },
  successBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },
  successText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "900",
  },
  successSub: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
