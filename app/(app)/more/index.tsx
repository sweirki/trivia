import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import ScreenShell from "@/components/ScreenShell";
import SectionHeader from "@/components/SectionHeader";
import { useTheme } from "@/theme";
import { usePlayerStore } from "@/store/usePlayerStore";

const LOBBY_HERO_ART = require("../../../assets/images/lobby/lobby_hero_banner.webp");
const CATEGORY_ART = require("../../../assets/images/lobby/category_card_art.webp");
const ACHIEVEMENTS_ART = require("../../../assets/images/lobby/achievements_card_art.webp");
const PROFILE_ART = require("../../../assets/images/lobby/profile_card_art.webp");
const STATS_ART = require("../../../assets/images/lobby/stats_card_art.webp");
const LEADERBOARD_ART = require("../../../assets/images/lobby/leaderboard_card_art.webp");
const FRIENDS_ART = require("../../../assets/images/lobby/friends_card_art.webp");
const STORE_ART = require("../../../assets/images/lobby/store_card_art.webp");
const COSMETICS_ART = require("../../../assets/images/lobby/cosmetics_card_art.webp");
const SETTINGS_ART = require("../../../assets/images/lobby/settings_card_art.webp");
const SUPPORT_ART = require("../../../assets/images/lobby/support_card_art.webp");

type LobbyCardProps = {
  title: string;
  subtitle: string;
  art: ImageSourcePropType;
  accent?: string;
  titleTone?: "gold" | "blue" | "white";
  onPress?: () => void;
};

function LobbyCard({
  title,
  subtitle,
  art,
  accent = "#6EA9FF",
  titleTone = "white",
  onPress,
}: LobbyCardProps) {
  const titleColor =
    titleTone === "gold" ? "#FFD66E" : titleTone === "blue" ? "#9FE7FF" : "#FFFFFF";

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint="Opens this lobby section"
      style={({ pressed }) => [styles.artCard, pressed && styles.pressed]}
    >
      <Image source={art} style={styles.cardArt} resizeMode="cover" />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(2,6,14,0.62)", "rgba(2,6,14,0.18)", "rgba(2,6,14,0)"]}
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.24)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={[styles.artAccent, { backgroundColor: accent }]} />
      <View pointerEvents="none" style={[styles.artBorderGlow, { borderColor: `${accent}A8` }]} />

      <View style={styles.artCopy}>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.15}
          style={[styles.artTitle, { color: titleColor }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.1}
          style={[styles.artSub, { color: accent === "#FFD66E" ? "#BEEBFF" : "#D8E7FF" }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
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
    [xp, xpRequired],
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

    const pulseLoop = Animated.loop(
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
      ]),
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [fade, pulse]);

  return (
    <ScreenShell accessibilityLabel="More lobby screen" contentStyle={styles.content}>
      <Animated.View style={{ opacity: fade }}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[theme.typography.caption, styles.kicker]}>GAME CENTER</Text>
            <Text style={[theme.typography.h1, styles.screenTitle]}>Lobby</Text>
            <Text style={[theme.typography.small, styles.screenSub]}>Play • Progress • Rewards</Text>
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
            <Text style={[theme.typography.caption, { color: theme.colors.success }]}>LIVE</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Image source={LOBBY_HERO_ART} style={styles.heroArt} resizeMode="cover" />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2,6,14,0.72)", "rgba(2,6,14,0.26)", "rgba(2,6,14,0.04)"]}
            locations={[0, 0.46, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,214,110,0.13)", "rgba(33,190,255,0.06)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroInner}>
            <View style={styles.heroTopRow}>
              <View>
                <Text style={styles.levelLabel}>Level {level}</Text>
                <Text style={styles.heroSub}>Progress runway</Text>
              </View>
              <Text style={styles.xpText}>{xp} / {xpRequired} XP</Text>
            </View>

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

            <View style={styles.walletRow}>
              <Text style={styles.walletText}>🪙 {coins}</Text>
              <Text style={styles.walletText}>💎 {gems}</Text>
              <Text style={styles.walletText}>🎟️ {tickets}</Text>
            </View>
          </View>
        </View>

        <SectionHeader title="Play" />
        <View style={styles.grid}>
          <LobbyCard
            title="Category"
            subtitle="Choose your run"
            art={CATEGORY_ART}
            accent="#58B8FF"
            titleTone="blue"
            onPress={() => router.push("/play/(screens)/categorySelect" as any)}
          />
          <LobbyCard
            title="Achievements"
            subtitle="Milestones"
            art={ACHIEVEMENTS_ART}
            accent="#FFD66E"
            titleTone="gold"
            onPress={() => router.push("/achievements")}
          />
        </View>

        <SectionHeader title="Profile" />
        <View style={styles.grid}>
          <LobbyCard
            title="Profile"
            subtitle="Avatar & identity"
            art={PROFILE_ART}
            accent="#8EDBFF"
            titleTone="blue"
            onPress={() => router.push("/profile")}
          />
          <LobbyCard
            title="Stats"
            subtitle="Performance"
            art={STATS_ART}
            accent="#4EE7FF"
            titleTone="blue"
            onPress={() => router.push("/statistics" as any)}
          />
          <LobbyCard
            title="Leaderboard"
            subtitle="Global rank"
            art={LEADERBOARD_ART}
            accent="#FFD66E"
            titleTone="gold"
            onPress={() => router.push("/leaderboard")}
          />
          <LobbyCard
            title="Friends"
            subtitle="Social invites"
            art={FRIENDS_ART}
            accent="#A977FF"
            onPress={() => router.push("/friends")}
          />
        </View>

        <SectionHeader title="Economy" />
        <View style={styles.grid}>
          <LobbyCard
            title="Store"
            subtitle="VIP & boosts"
            art={STORE_ART}
            accent="#F5B84A"
            titleTone="gold"
            onPress={() => router.push("/store")}
          />
          <LobbyCard
            title="Cosmetics"
            subtitle="Visual upgrades"
            art={COSMETICS_ART}
            accent="#B66DFF"
            onPress={() => router.push("/store?tab=cosmetics" as any)}
          />
        </View>

        <SectionHeader title="System" />
        <View style={styles.grid}>
          <LobbyCard
            title="Settings"
            subtitle="Controls"
            art={SETTINGS_ART}
            accent="#7FC7FF"
            titleTone="blue"
            onPress={() => router.push("/settings")}
          />
          <LobbyCard
            title="Support"
            subtitle="Help"
            art={SUPPORT_ART}
            accent="#43E4D8"
            titleTone="blue"
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
    paddingBottom: 52,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    color: "#7E8EA7",
    letterSpacing: 1.6,
    marginBottom: 3,
    opacity: 0.82,
  },
  screenTitle: {
    color: "#F4FAFF",
    letterSpacing: -0.4,
  },
  screenSub: {
    color: "#9FE7FF",
    marginTop: 2,
    fontWeight: "800",
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
    minHeight: 144,
    marginBottom: 18,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.42)",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  heroArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.98,
  },
  heroInner: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  levelLabel: {
    color: "#FFD66E",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.25,
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 8,
  },
  heroSub: {
    color: "#9FE7FF",
    fontSize: 12,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  xpText: {
    color: "#D8E7FF",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 8,
  },
  xpBar: {
    height: 9,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(216,231,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.16)",
  },
  xpFill: {
    height: "100%",
    backgroundColor: "#9FE7FF",
    shadowColor: "#58B8FF",
    shadowOpacity: 0.75,
    shadowRadius: 8,
  },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 11,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,214,110,0.2)",
  },
  walletText: {
    color: "#F4FAFF",
    fontSize: 12,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.88)",
    textShadowRadius: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  artCard: {
    width: "48.5%",
    minHeight: 118,
    marginBottom: 10,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.28)",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
  cardArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.98,
  },
  artAccent: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 0,
    height: 1,
    opacity: 0.76,
  },
  artBorderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
  },
  artCopy: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
    paddingRight: 8,
    zIndex: 5,
  },
  artTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.22,
    marginBottom: 1,
    textShadowColor: "rgba(0,0,0,0.96)",
    textShadowRadius: 9,
  },
  artSub: {
    fontSize: 10.5,
    fontWeight: "800",
    lineHeight: 13,
    textShadowColor: "rgba(0,0,0,0.94)",
    textShadowRadius: 7,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
});


