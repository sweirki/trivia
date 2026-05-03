// RewardDayBox.tsx — A+++++ Day Tile for Daily Rewards

import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function RewardDayBox({ day, currentDay, claimed, upcoming }) {
  const isToday = day === currentDay;
  const isPast = day < currentDay && !claimed;

  // Animation for the "today" tile glow
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isToday && !claimed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 700,
            useNativeDriver: false,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 700,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isToday, claimed]);

  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,215,0,0.25)", "rgba(255,215,0,0.55)"],
  });

  return (
    <Animated.View
      style={[
        styles.box,
        isToday && !claimed && { borderColor: glowColor, shadowColor: "#FFD700" },
        claimed && styles.claimed,
        upcoming && styles.upcoming,
      ]}
    >
      <Text style={styles.dayLabel}>Day {day}</Text>

      {/* State indicator */}
      {claimed ? (
        <Text style={styles.claimedText}>CLAIMED</Text>
      ) : upcoming ? (
        <Text style={styles.lockedText}>Locked</Text>
      ) : isToday ? (
        <Text style={styles.todayText}>Today</Text>
      ) : (
        <Text style={styles.pastText}>Done</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.15)",
  },

  dayLabel: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },

  todayText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  claimed: {
    backgroundColor: "rgba(255,215,0,0.18)",
    borderColor: "#FFD700",
  },

  claimedText: {
    color: "#FFD700",
    fontWeight: "900",
    fontSize: 15,
  },

  lockedText: {
    color: "#777",
    fontSize: 14,
    fontWeight: "700",
  },

  pastText: {
    color: "#AAA",
    fontSize: 14,
    fontWeight: "700",
  },

  upcoming: {
    opacity: 0.4,
  },
});



