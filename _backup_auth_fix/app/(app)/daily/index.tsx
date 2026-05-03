// /app/(app)/daily/index.tsx
// DAILY REWARDS — C2 ENGINE (LOCKED)

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { evaluateDailyClaim } from "@/daily/dailyLogic";

import { usePlayerStore } from "@/store/usePlayerStore";
import { claimDailyReward } from "@/daily/dailyService";
import { getDailyReward } from "@/daily/rewardTable";

import RewardDayBox from "@/daily/components/RewardDayBox";
import ClaimButton from "@/daily/components/ClaimButton";
import RewardFX from "@/daily/components/RewardFX";

export default function DailyRewardsScreen() {
  const router = useRouter();

  const daily = usePlayerStore((s) => s.daily);
  const streak = daily?.streak ?? 0;
  const lastClaimDate = daily?.lastClaimDate ?? null;

  const today = new Date().toISOString().slice(0, 10);
  const evaluation = evaluateDailyClaim(
  lastClaimDate,
  today
);


 
  const [fxTrigger, setFxTrigger] = useState(false);
  const [rewardResult, setRewardResult] = useState<{
    coins: number;
    xp: number;
  } | null>(null);

  const nextStreak = evaluation.canClaim ? streak + 1 : streak;

  const todayReward = getDailyReward(nextStreak);

  return (
    <View style={styles.root}>
      <RewardFX trigger={fxTrigger} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Daily Rewards</Text>
        <Text style={styles.subtitle}>
          Come back every day to build your streak
        </Text>

        {/* Streak */}
        <Text style={styles.streakText}>
          🔥 Current streak: {streak} day{streak === 1 ? "" : "s"}
        </Text>

        {/* 7 Day Grid */}
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <RewardDayBox
              key={day}
              day={day}
              currentDay={nextStreak}
             claimed={!evaluation.canClaim && day === streak}

              upcoming={day > nextStreak}
            />
          ))}
        </View>

        {/* Reward Summary */}
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardText}>Today’s Reward</Text>
          <Text style={styles.rewardValue}>
            +{todayReward.coins} Coins
            {todayReward.xp > 0 ? ` • +${todayReward.xp} XP` : ""}
          </Text>
        </View>

        {/* Claim Button */}
    <ClaimButton />



        {/* Success Feedback */}
        {rewardResult && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>🎉 Reward Claimed!</Text>
            <Text style={styles.successSub}>
              +{rewardResult.coins} Coins
              {rewardResult.xp > 0 ? ` • +${rewardResult.xp} XP` : ""}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  content: {
    padding: 20,
    paddingBottom: 80,
  },

  backText: {
    color: "#FFD700",
    fontSize: 16,
    marginBottom: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFD700",
    marginBottom: 4,
  },

  subtitle: {
    color: "#FFEABE",
    fontSize: 14,
    marginBottom: 12,
  },

  streakText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 18,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  rewardInfo: {
    marginBottom: 22,
  },

  rewardText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "700",
  },

  rewardValue: {
    color: "#FFF",
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
  },

  successBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
  },

  successText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "800",
  },

  successSub: {
    color: "#FFF",
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
  },
});
