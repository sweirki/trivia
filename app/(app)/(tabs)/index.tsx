// app/(app)/(tabs)/index.tsx
// Premium Hub — asset-backed, restrained, product-grade home screen.

import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { usePlayerStore } from "@/store/usePlayerStore";

const HERO_BG = require("../../../assets/premium/hub/hub_hero_atmosphere.webp");
const QUICK_BG = require("../../../assets/premium/hub/hub_mode_quick.webp");
const ARENA_BG = require("../../../assets/premium/hub/hub_mode_arena.webp");
const DAILY_BG = require("../../../assets/premium/hub/hub_mode_daily.webp");
const SHOP_BG = require("../../../assets/premium/hub/hub_mode_shop.webp");
const LOBBY_BG = require("../../../assets/premium/hub/hub_mode_lobby.webp");

type HubCard = {
  title: string;
  subtitle: string;
  eyebrow: string;
  route: string;
  image: any;
};

const PRIMARY_CARDS: HubCard[] = [
  {
    title: "Quick Play",
    subtitle: "Fast premium trivia sessions.",
    eyebrow: "INSTANT",
    route: "/play/categorySelect",
    image: QUICK_BG,
  },
  {
    title: "Ranked Arena",
    subtitle: "Climb with controlled competitive pressure.",
    eyebrow: "COMPETE",
    route: "/arena_reset/ranked",
    image: ARENA_BG,
  },
  {
    title: "Survival",
    subtitle: "Stay sharp under rising pressure.",
    eyebrow: "ENDURANCE",
    route: "/arena_reset/survival",
    image: LOBBY_BG,
  },
  {
    title: "Tournament",
    subtitle: "Bracket prestige and elite rewards.",
    eyebrow: "EVENT",
    route: "/arena_reset/tournaments",
    image: ARENA_BG,
  },
];

const SECONDARY_CARDS: HubCard[] = [
  {
    title: "Daily Rewards",
    subtitle: "Claim streak momentum.",
    eyebrow: "TODAY",
    route: "/daily",
    image: DAILY_BG,
  },
  {
    title: "Store",
    subtitle: "Premium items and boosts.",
    eyebrow: "BAZAAR",
    route: "/store",
    image: SHOP_BG,
  },
];

export default function HubScreen() {
  const router = useRouter();

  const level = usePlayerStore((s) => s.level);
  const xp = usePlayerStore((s) => s.xp);
  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);
  const tickets = usePlayerStore((s) => s.tickets);
  const nickname = usePlayerStore((s) => s.nickname);

  const displayName = nickname || "Player";
  const nextLevelXp = Math.max(1, level * 150 + level * level * 6);
  const xpRatio = Math.min(1, xp / nextLevelXp);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground source={HERO_BG} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroShade}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.eyebrow}>TRIVIA SWEIRKI</Text>
              <Text style={styles.heroTitle}>Ready to Play?</Text>
              <Text style={styles.heroSubtitle}>
                Welcome back, {displayName}. Choose your next challenge.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/profile")}
              style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
            >
              <Text style={styles.profileLevel}>LV {level}</Text>
            </Pressable>
          </View>

          <View style={styles.progressShell}>
            <View style={[styles.progressFill, { width: `${Math.max(5, xpRatio * 100)}%` }]} />
          </View>

          <View style={styles.walletRow}>
            <Wallet label="COINS" value={coins} />
            <Wallet label="GEMS" value={gems} />
            <Wallet label="TICKETS" value={tickets} />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Play</Text>
        <Text style={styles.sectionSub}>Premium competitive modes</Text>
      </View>

      <View style={styles.cardGrid}>
        {PRIMARY_CARDS.map((card) => (
          <ModeCard key={card.title} card={card} onPress={() => router.push(card.route as never)} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Service</Text>
        <Text style={styles.sectionSub}>Progression, rewards, and economy</Text>
      </View>

      <View style={styles.secondaryGrid}>
        {SECONDARY_CARDS.map((card) => (
          <ModeCard key={card.title} card={card} compact onPress={() => router.push(card.route as never)} />
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function Wallet({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.walletPill}>
      <Text style={styles.walletLabel}>{label}</Text>
      <Text style={styles.walletValue}>{value}</Text>
    </View>
  );
}

function ModeCard({
  card,
  compact,
  onPress,
}: {
  card: HubCard;
  compact?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeCard,
        compact && styles.modeCardCompact,
        pressed && styles.pressed,
      ]}
    >
      <ImageBackground source={card.image} style={styles.modeImage} imageStyle={styles.modeImageStyle}>
        <View style={styles.modeShade}>
          <Text style={styles.modeEyebrow}>{card.eyebrow}</Text>
          <Text style={styles.modeTitle}>{card.title}</Text>
          <Text style={styles.modeSubtitle}>{card.subtitle}</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#070B12",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 42,
  },
  hero: {
    minHeight: 222,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#101722",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  heroImage: {
    borderRadius: 24,
  },
  heroShade: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
    backgroundColor: "rgba(4,7,12,0.28)",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  eyebrow: {
    color: "#8FB7D9",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    color: "#B8C7D8",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    maxWidth: 230,
    marginTop: 6,
  },
  profileButton: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13,20,30,0.78)",
    borderWidth: 1,
    borderColor: "rgba(143,183,217,0.28)",
  },
  profileLevel: {
    color: "#EAF4FF",
    fontSize: 13,
    fontWeight: "900",
  },
  progressShell: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginTop: 18,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#8FB7D9",
  },
  walletRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  walletPill: {
    flex: 1,
    borderRadius: 15,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: "rgba(9,14,22,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  walletLabel: {
    color: "#6F8296",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  walletValue: {
    color: "#F4F8FC",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#F4F8FC",
    fontSize: 17,
    fontWeight: "900",
  },
  sectionSub: {
    color: "#75869A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  cardGrid: {
    gap: 12,
  },
  secondaryGrid: {
    gap: 10,
  },
  modeCard: {
    height: 124,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111823",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  modeCardCompact: {
    height: 96,
  },
  modeImage: {
    flex: 1,
  },
  modeImageStyle: {
    borderRadius: 20,
  },
  modeShade: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(4,8,14,0.22)",
  },
  modeEyebrow: {
    color: "#8FB7D9",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  modeTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.35,
  },
  modeSubtitle: {
    color: "#B4C3D4",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 4,
    maxWidth: "78%",
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
});
