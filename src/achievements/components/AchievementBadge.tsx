import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AchievementBadge({
  achievement,
  unlocked,
}: {
  achievement: any;
  unlocked: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        unlocked ? styles.unlocked : styles.locked,
      ]}
    >
      <Text
        style={[
          styles.title,
          unlocked ? styles.titleUnlocked : styles.titleLocked,
        ]}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>

      <Text style={styles.desc} numberOfLines={3}>
        {achievement.description}
      </Text>

      {!unlocked && <Text style={styles.lock}>LOCKED</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 136,
    borderRadius: 18,
    padding: 14,
    justifyContent: "space-between",
   backgroundColor: "#12182A",
borderWidth: 1,
borderColor: "#2A334A",

  },

  unlocked: {
    borderColor: "#F5B942",
  },

  locked: {
    borderColor: "#334155",
  },

 title: {
  fontSize: 13,
  fontWeight: "800",
  color: "#E5E7EB",
  lineHeight: 17,
},

  titleUnlocked: {
    color: "#F5B942",
  },

  titleLocked: {
    color: "#CBD5E1",
  },

  desc: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
    color: "#94A3B2",
  },

 lock: {
  marginTop: 6,
  fontSize: 8,
  fontWeight: "700",
  color: "#b0c57e",
  letterSpacing: 1.2,
},


});

