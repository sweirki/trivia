// /app/(app)/daily/index.tsx
// A+++++ DAILY REWARD SCREEN (7-Day Cycle)

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { useDailyRewardStore } from "@/store/useDailyRewardStore";

import RewardDayBox from "@/daily/components/RewardDayBox";
import ClaimButton from "@/daily/components/ClaimButton";
import RewardFX from "@/daily/components/RewardFX";

export default function DailyRewardsScreen() {
  const [fxTrigger, setFxTrigger] = useState(false);

  const router = useRouter();

 const canClaim = useDailyRewardStore((s) => s.canClaim);
const claim = useDailyRewardStore((s) => s.claim);

// TEMP: static streak display (safe placeholder)
const streak = 1;

const todayClaimed = !canClaim();

const rewards = {
  coins: 100,
  gems: 0,
  xp: 0,
};

const handleClaim = () => {
  if (!canClaim()) return;

  claim();
  setFxTrigger(true);
  setTimeout(() => setFxTrigger(false), 1200);
};


  return (
    <View style={styles.root}>
      <RewardFX trigger={fxTrigger} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Daily Rewards</Text>
        <Text style={styles.subtitle}>Come back every day to earn streak bonuses!</Text>

        {/* 7 DAY GRID */}
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <RewardDayBox
              key={day}
              day={day}
              currentDay={streak + 1}
              claimed={todayClaimed && day === streak}
              upcoming={day > streak + 1}
            />
          ))}
        </View>

        {/* Rewards summary */}
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardText}>Today's Reward:</Text>
          <Text style={styles.rewardValue}>
            +{rewards.coins} Coins  
            {rewards.gems > 0 ? ` • +${rewards.gems} Gem` : ""}  
            {rewards.xp > 0 ? ` • +${rewards.xp} XP` : ""}
          </Text>
        </View>

     <ClaimButton onClaimed={handleClaim} />


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
    marginBottom: 20,
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
});


