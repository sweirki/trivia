// RewardDayBox.tsx — premium themed day tile for Daily Rewards

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, useTheme } from "@/theme";

type RewardDayBoxProps = {
  day: number;
  currentDay: number;
  claimed: boolean;
  upcoming: boolean;
  coins?: number;
  xp?: number;
};

export default function RewardDayBox({
  day,
  currentDay,
  claimed,
  upcoming,
  coins,
  xp,
}: RewardDayBoxProps) {
  const theme = useTheme();
  const isToday = day === currentDay && !claimed;

  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isToday) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [isToday, glow]);

  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.gold],
  });

  const iconName = claimed
    ? "check-circle"
    : isToday
      ? "gift-open"
      : "lock-outline";

  return (
    <Animated.View
      style={[
        styles.shell,
        {
          borderColor: theme.colors.border,
          shadowColor: theme.colors.gold,
        },
        isToday && { borderColor: glowColor, shadowOpacity: 0.38 },
        claimed && { borderColor: theme.colors.goldDeep },
        upcoming && styles.upcoming,
      ]}
    >
      <LinearGradient
        colors={
          isToday
            ? ["rgba(245,196,81,0.22)", "rgba(21,30,51,0.96)"]
            : claimed
              ? ["rgba(245,196,81,0.14)", "rgba(26,37,64,0.96)"]
              : ["rgba(26,37,64,0.92)", "rgba(18,26,45,0.96)"]
        }
        style={styles.gradient}
      >
        <View
          style={[
            styles.iconBubble,
            {
              backgroundColor: isToday
                ? "rgba(245,196,81,0.18)"
                : "rgba(255,255,255,0.06)",
              borderColor: claimed || isToday ? theme.colors.goldDeep : theme.colors.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={19}
            color={claimed || isToday ? theme.colors.gold : theme.colors.textSubtle}
          />
        </View>

        <Text style={[styles.dayLabel, { color: theme.colors.gold }]}>
          Day {day}
        </Text>

        <Text
          style={[
            styles.stateText,
            {
              color: claimed
                ? theme.colors.goldSoft
                : isToday
                  ? theme.colors.text
                  : theme.colors.textSubtle,
            },
          ]}
        >
          {claimed ? "CLAIMED" : isToday ? "READY" : "LOCKED"}
        </Text>

        {(coins || xp) && (
          <Text style={[styles.rewardText, { color: theme.colors.textMuted }]}>
            +{coins ?? 0}c{xp ? ` • ${xp}xp` : ""}
          </Text>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "31%",
    minHeight: 108,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    overflow: "hidden",
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  gradient: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: "900",
  },
  stateText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  rewardText: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  upcoming: {
    opacity: 0.58,
  },
});
