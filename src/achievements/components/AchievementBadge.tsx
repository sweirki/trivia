import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  achievement: {
    title?: string;
    name?: string;
    description?: string;
  };
  unlocked: boolean;
};

export default function AchievementBadge({ achievement, unlocked }: Props) {
  return (
    <View style={[styles.card, unlocked ? styles.unlocked : styles.locked]}>
      <View style={styles.topRow}>
        <Text
          style={[styles.title, unlocked ? styles.titleUnlocked : styles.titleLocked]}
          numberOfLines={1}
        >
          {achievement.title ?? achievement.name}
        </Text>

        <View style={[styles.statusIcon, unlocked ? styles.statusUnlocked : styles.statusLocked]}>
          <Text style={[styles.statusText, unlocked ? styles.statusTextUnlocked : styles.statusTextLocked]}>
            {unlocked ? "✓" : "🔒"}
          </Text>
        </View>
      </View>

      <Text style={styles.desc} numberOfLines={2}>
        {achievement.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 94,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#12182A",
    borderWidth: 1,
  },

  unlocked: {
    borderColor: "#F5B942",
  },

  locked: {
    borderColor: "#334155",
    opacity: 0.82,
  },

  topRow: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  title: {
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },

  titleUnlocked: {
    color: "#F5B942",
  },

  titleLocked: {
    color: "#CBD5E1",
  },

  desc: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 15,
    color: "#94A3B8",
  },

  statusIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  statusUnlocked: {
    borderWidth: 1,
    borderColor: "#F5B942",
  },

  statusLocked: {
    borderWidth: 1,
    borderColor: "#475569",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
  },

  statusTextUnlocked: {
    color: "#F5B942",
  },

  statusTextLocked: {
    fontSize: 10,
    color: "#CBD5E1",
  },
});

