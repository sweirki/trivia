import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { usePlayerStore } from "@/store/usePlayerStore";

type CardProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isLast?: boolean;
};

export default function MoreScreen() {
  const router = useRouter();

  // -----------------------------
  // PLAYER PROGRESS
  // -----------------------------
  const level = usePlayerStore((s) => s.level);
  const xp = usePlayerStore((s) => s.xp);

  const xpRequiredForLevel = (lvl: number) => lvl * 150 + lvl * lvl * 6;

  const xpRequired = useMemo(() => xpRequiredForLevel(level), [level]);
  const xpPercent = useMemo(
    () => (xpRequired > 0 ? Math.min(1, xp / xpRequired) : 0),
    [xp, xpRequired]
  );

  const xpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(xpAnim, {
      toValue: xpPercent,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [xpPercent, xpAnim]);

  // -----------------------------
  // CARD (stable grid)
  // -----------------------------
  const Card = ({ title, subtitle, onPress, isLast }: CardProps) => {
    const scale = useRef(new Animated.Value(1)).current;

    const pressIn = () => {
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    const pressOut = () => {
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
        <Animated.View
          style={[
            styles.card,
            !isLast && styles.cardSpacer,
            { transform: [{ scale }] },
          ]}
        >
          <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
            {title}
          </Text>

          {!!subtitle && (
            <Text style={styles.cardSub} numberOfLines={2} ellipsizeMode="tail">
              {subtitle}
            </Text>
          )}
        </Animated.View>
      </Pressable>
    );
  };

  const Row = ({
    left,
    right,
  }: {
    left: React.ReactNode;
    right: React.ReactNode;
  }) => {
    return (
      <View style={styles.row}>
        <View style={styles.col}>{left}</View>
        <View style={styles.col}>{right}</View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* TITLE */}
      <Text style={styles.screenTitle}>More</Text>
      <Text style={styles.screenSub}>Profile, progress, and settings</Text>

      {/* PROGRESS CARD */}
      <View style={styles.heroCard}>
        <Text style={styles.levelLabel}>Level {level}</Text>

        <View style={styles.xpBar}>
          <Animated.View
            style={[
              styles.xpFill,
              {
                width: xpAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.xpText}>
          {xp} / {xpRequired} XP
        </Text>
      </View>

      {/* QUICK ACCESS */}
      <Text style={styles.sectionTitle}>Quick Access</Text>

      <Row
        left={
          <Card
            title="Category"
            subtitle="Pick what you want to play"
            onPress={() => router.push("/play/(screens)/categorySelect" as any)}

          />
        }
        right={
          <Card
            title="Achievements"
            subtitle="Your milestones"
            onPress={() => router.push("/achievements")}
            isLast
          />
        }
      />

      {/* PROFILE */}
      <Text style={styles.sectionTitle}>Profile</Text>

      <Row
        left={
          <Card
            title="Profile"
            subtitle="Avatar & identity"
            onPress={() => router.push("/profile")}
          />
        }
        right={
          <Card
            title="Statistics"
            subtitle="Performance breakdown"
            onPress={() => router.push("/statistics" as any)}

            isLast
          />
        }
      />

      <Row
        left={
          <Card
            title="Leaderboard"
            subtitle="Global rankings"
            onPress={() => router.push("/leaderboard")}
          />
        }
        right={
          <Card title="Friends" subtitle="Social & invites" isLast />
        }
      />

      {/* ECONOMY */}
      <Text style={styles.sectionTitle}>Economy</Text>

      <Row
        left={
          <Card
            title="Store / Bazaar"
            subtitle="Items & boosts"
           onPress={() => router.push("/store")}

          />
        }
        right={<Card title="Cosmetics" subtitle="Visual upgrades" isLast />}
      />

      {/* SYSTEM */}
      <Text style={styles.sectionTitle}>System</Text>

      <Row
        left={
          <Card
            title="Settings"
            subtitle="Sound, controls"
            onPress={() => router.push("/settings")}
          />
        }
        right={<Card title="Help & Support" subtitle="FAQ & contact" isLast />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101623",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  screenTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F5B942",
    marginBottom: 4,
  },
  screenSub: {
    color: "#9AA3B2",
    marginBottom: 16,
  },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 18,
    fontSize: 13,
    fontWeight: "700",
    color: "#E5E7EB",
  },

  heroCard: {
    backgroundColor: "#1A2032",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 18,
  },

  levelLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F5B942",
    marginBottom: 8,
  },

  xpBar: {
    height: 12,
    backgroundColor: "#2A3147",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 5,
  },

  xpFill: {
    height: "100%",
    backgroundColor: "#F5B942",
  },

  xpText: {
    textAlign: "right",
    color: "#F5B942",
    fontWeight: "600",
    fontSize: 11,
  },

  // ---- GRID (NO % WIDTH, NO GAP) ----
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  col: {
    flex: 1,
  },
  cardSpacer: {
    marginRight: 12,
  },

  card: {
    minHeight: 100,
    backgroundColor: "#1A2032",
   paddingVertical: 8,
paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F5B942",
    lineHeight: 20,
    minHeight: 40,
  },

  cardSub: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9AA3B2",
  },
});
