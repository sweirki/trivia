import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import GoldCard from "@/components/GoldCard";
import ScreenShell from "@/components/ScreenShell";
import SectionHeader from "@/components/SectionHeader";
import { useTheme } from "@/theme";
import { usePlayerStore } from "@/store/usePlayerStore";

type LobbyCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  variant?: "default" | "soft" | "premium" | "success" | "danger";
  onPress?: () => void;
};

function LobbyCard({
  title,
  subtitle,
  icon,
  variant = "default",
  onPress,
}: LobbyCardProps) {
  const theme = useTheme();

  return (
    <GoldCard
      pressable
      onPress={onPress}
      variant={variant}
      padding="md"
      style={styles.cardWrap}
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint="Opens this lobby section"
    >
      <View
        style={[
          styles.iconBubble,
          { backgroundColor: `${theme.colors.gold}16`, borderColor: theme.colors.border },
        ]}
      >
        <Text accessible={false} style={styles.cardIcon}>{icon}</Text>
      </View>

      <Text allowFontScaling maxFontSizeMultiplier={1.2} style={[theme.typography.bodyStrong, styles.cardTitle]} numberOfLines={1}>
        {title}
      </Text>
      <Text allowFontScaling maxFontSizeMultiplier={1.15} style={[theme.typography.small, styles.cardSub]} numberOfLines={2}>
        {subtitle}
      </Text>
    </GoldCard>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const theme = useTheme();

  const level = usePlayerStore((s) => s.level);
  const xp = usePlayerStore((s) => s.xp);
  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);
  const tickets = usePlayerStore((s) => s.tickets);

  const xpRequiredForLevel = (lvl: number) => lvl * 150 + lvl * lvl * 6;
  const xpRequired = useMemo(() => xpRequiredForLevel(level), [level]);
  const xpPercent = useMemo(
    () => (xpRequired > 0 ? Math.min(1, xp / xpRequired) : 0),
    [xp, xpRequired]
  );

  const xpAnim = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(xpAnim, {
      toValue: xpPercent,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [xpPercent, xpAnim]);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
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
      ])
    ).start();
  }, [fade, pulse]);

  return (
    <ScreenShell accessibilityLabel="More lobby screen" contentStyle={styles.content}>
      <Animated.View style={{ opacity: fade }}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[theme.typography.caption, styles.kicker]}>
              GAME CENTER
            </Text>
            <Text style={[theme.typography.h1, styles.screenTitle]}>
              Lobby
            </Text>
            <Text style={[theme.typography.small, styles.screenSub]}>
              Play, profile, rewards, and store
            </Text>
          </View>

          <View
            style={[
              styles.liveBadge,
              {
                backgroundColor: `${theme.colors.success}1F`,
                borderColor: `${theme.colors.success}55`,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.liveDot,
                {
                  backgroundColor: theme.colors.success,
                  opacity: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.45, 1],
                  }),
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.25],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text style={[theme.typography.caption, { color: theme.colors.success }]}>
              LIVE
            </Text>
          </View>
        </View>

        <GoldCard variant="premium" padding="lg" style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[theme.typography.h3, styles.levelLabel]}>
                Level {level}
              </Text>
              <Text style={[theme.typography.small, styles.heroSub]}>
                Progress runway
              </Text>
            </View>
            <Text style={[theme.typography.caption, styles.xpText]}>
              {xp} / {xpRequired} XP
            </Text>
          </View>

          <View
            style={[
              styles.xpBar,
              { backgroundColor: theme.colors.surfaceSoft },
            ]}
          >
            <Animated.View
              style={[
                styles.xpFill,
                {
                  backgroundColor: theme.colors.gold,
                  width: xpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.walletRow,
              { borderTopColor: theme.colors.border },
            ]}
          >
            <Text style={styles.walletText}>🪙 {coins}</Text>
            <Text style={styles.walletText}>💎 {gems}</Text>
            <Text style={styles.walletText}>🎟️ {tickets}</Text>
          </View>
        </GoldCard>

        <SectionHeader title="Play" />
        <View style={styles.grid}>
          <LobbyCard
            title="Category"
            subtitle="Pick exactly what you want to play"
            icon="🎯"
            variant="soft"
            onPress={() => router.push("/play/(screens)/categorySelect" as any)}
          />
          <LobbyCard
            title="Achievements"
            subtitle="Track milestones and rewards"
            icon="🏅"
            variant="soft"
            onPress={() => router.push("/achievements")}
          />
        </View>

        <SectionHeader title="Profile" />
        <View style={styles.grid}>
          <LobbyCard
            title="Profile"
            subtitle="Avatar, identity, and style"
            icon="🧑"
            onPress={() => router.push("/profile")}
          />
          <LobbyCard
            title="Stats"
            subtitle="Performance breakdown"
            icon="📊"
            variant="soft"
            onPress={() => router.push("/statistics" as any)}
          />
          <LobbyCard
            title="Leaderboard"
            subtitle="Global rankings"
            icon="🏆"
            variant="soft"
            onPress={() => router.push("/leaderboard")}
          />
          <LobbyCard
            title="Friends"
            subtitle="Social and invites"
            icon="🤝"
            onPress={() => router.push("/friends")}
          />
        </View>

        <SectionHeader title="Economy" />
        <View style={styles.grid}>
          <LobbyCard
            title="Store"
            subtitle="VIP, gems, and boosts"
            icon="🛒"
            variant="soft"
            onPress={() => router.push("/store")}
          />
          <LobbyCard
            title="Cosmetics"
            subtitle="Visual upgrades"
            icon="✨"
            onPress={() => router.push("/store?tab=cosmetics" as any)}
          />
        </View>

        <SectionHeader title="System" />
        <View style={styles.grid}>
          <LobbyCard
            title="Settings"
            subtitle="Sound and controls"
            icon="⚙️"
            onPress={() => router.push("/settings")}
          />
          <LobbyCard
            title="Support"
            subtitle="Help and contact"
            icon="💬"
            variant="soft"
            onPress={() => router.push("/help")}
          />
        </View>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    letterSpacing: 1.6,
    marginBottom: 3,
    opacity: 0.8,
  },
  screenTitle: {
    letterSpacing: -0.4,
  },
  screenSub: {
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  heroCard: {
    marginBottom: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  levelLabel: {
    marginBottom: 2,
  },
  heroSub: {
    opacity: 0.9,
  },
  xpText: {
    marginTop: 3,
  },
  xpBar: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
  },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  walletText: {
    color: "#E8EDF7",
    fontSize: 12,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardWrap: {
    width: "48.5%",
    minHeight: 94,
    marginBottom: 10,
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 15,
  },
  cardTitle: {
    marginBottom: 3,
  },
  cardSub: {
    lineHeight: 15,
  },
});

