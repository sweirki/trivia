import React, { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import ScreenShell from "@/components/ScreenShell";
import SectionHeader from "@/components/SectionHeader";
import { Text, useTheme } from "@/theme";

const SUPPORT_ART = require("../../../assets/images/lobby/support_card_art.webp");
const HERO_ART = require("../../../assets/images/lobby/lobby_hero_banner.webp");

const FAQS = [
  {
    q: "How do challenges work?",
    a: "Send a challenge to a friend. Both players complete the same match, then the winner is decided after both results sync.",
  },
  {
    q: "Why can’t I receive push notifications?",
    a: "Expo Go limits notification testing on newer SDKs. Use a local development build for real push notification testing.",
  },
  {
    q: "What happens if I play as a guest?",
    a: "Guest progress stays on this device. Cloud syncing, account recovery, and social systems require signing in.",
  },
  {
    q: "How do I restore VIP purchases?",
    a: "Open Store and use Restore Purchases. The app checks your entitlement status again through RevenueCat.",
  },
  {
    q: "Why does my leaderboard rank change?",
    a: "Rankings update from player performance, XP, wins, streaks, and refresh timing.",
  },
  {
    q: "Can I change my avatar and identity?",
    a: "Yes. Open Profile or Settings, then edit your name and avatar from the identity screen.",
  },
  {
    q: "What if my challenge gets stuck?",
    a: "Return to Friends and refresh. Challenge completion syncs automatically after both players finish.",
  },
  {
    q: "Can I play offline?",
    a: "Some solo gameplay works locally, but social systems, cloud saves, rankings, and challenges require internet access.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      style={({ pressed }) => [styles.faqCard, pressed && styles.pressed]}
      accessibilityLabel={q}
    >
      <View style={styles.faqTopRow}>
        <Text style={styles.question}>{q}</Text>
        <Text style={styles.chevron}>{open ? "−" : "+"}</Text>
      </View>
      {open && <Text style={styles.answer}>{a}</Text>}
    </Pressable>
  );
}

function SupportAction({
  title,
  sub,
  onPress,
}: {
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
      accessibilityLabel={title}
    >
      <View style={styles.actionGlow} />
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSub}>{sub}</Text>
    </Pressable>
  );
}

export default function HelpSupportScreen() {
  const theme = useTheme();

  return (
    <ScreenShell accessibilityLabel="Help and support screen" contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>PLAYER SUPPORT</Text>
        <Text style={[theme.typography.h1, styles.title]}>Support</Text>
        <Text style={styles.sub}>Fix issues, understand systems, and contact the team.</Text>
      </View>

      <View style={styles.heroCard}>
        <Image source={SUPPORT_ART} style={styles.heroArt} resizeMode="cover" />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(2,6,14,0.82)", "rgba(2,6,14,0.38)", "rgba(2,6,14,0.06)"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(159,231,255,0.15)", "rgba(255,214,110,0.08)", "rgba(0,0,0,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>SUPPORT CENTER</Text>
          <Text style={styles.heroTitle}>Help when the run breaks</Text>
          <Text style={styles.heroText}>Gameplay, accounts, purchases, rankings, challenges, and cloud sync.</Text>
        </View>
      </View>

      <View style={styles.statusStrip}>
        <Image source={HERO_ART} style={styles.statusArt} resizeMode="cover" />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(2,6,14,0.86)", "rgba(2,6,14,0.58)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.statusCopy}>
          <Text style={styles.statusLabel}>APP STATUS</Text>
          <Text style={styles.statusTitle}>Version 1.0 • Cloud Profiles • Social Challenges • VIP</Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Quick Support" />
        <View style={styles.actionGrid}>
          <SupportAction
            title="Contact Support"
            sub="Bugs, purchases, sync, or account issues"
            onPress={() => Linking.openURL("mailto:support@sweirki.com")}
          />
          <SupportAction
            title="Send Feedback"
            sub="Modes, cosmetics, balance, and progression ideas"
            onPress={() => Linking.openURL("mailto:feedback@sweirki.com")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Frequently Asked Questions" />
        {FAQS.map((item) => (
          <FAQItem key={item.q} q={item.q} a={item.a} />
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    paddingBottom: 58,
  },
  header: {
    marginBottom: 14,
  },
  kicker: {
    color: "#7E8EA7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 4,
  },
  title: {
    color: "#F4FAFF",
    letterSpacing: -0.35,
  },
  sub: {
    color: "#9FE7FF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
    maxWidth: "86%",
  },
  heroCard: {
    minHeight: 150,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.28)",
    marginBottom: 13,
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.18,
    shadowRadius: 17,
    shadowOffset: { width: 0, height: 9 },
    elevation: 7,
  },
  heroArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.96,
  },
  heroCopy: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    maxWidth: "78%",
  },
  heroLabel: {
    color: "#9FE7FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  heroTitle: {
    color: "#F4FAFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: -0.25,
    textShadowColor: "rgba(0,0,0,0.92)",
    textShadowRadius: 9,
  },
  heroText: {
    color: "#D8E7FF",
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },
  statusStrip: {
    minHeight: 76,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.22)",
    marginBottom: 16,
  },
  statusArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  statusCopy: {
    padding: 13,
  },
  statusLabel: {
    color: "#FFD66E",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.3,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  statusTitle: {
    color: "#D8E7FF",
    fontSize: 11.5,
    fontWeight: "800",
    marginTop: 5,
    lineHeight: 15,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },
  section: {
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minHeight: 96,
    backgroundColor: "rgba(8,17,31,0.88)",
    borderWidth: 1,
    borderColor: "rgba(119,174,255,0.18)",
    borderRadius: 20,
    padding: 13,
    overflow: "hidden",
  },
  actionGlow: {
    position: "absolute",
    top: 0,
    left: 13,
    right: 13,
    height: 1,
    backgroundColor: "rgba(159,231,255,0.7)",
  },
  actionTitle: {
    color: "#F4FAFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: -0.1,
  },
  actionSub: {
    color: "#8FA4BE",
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  faqCard: {
    backgroundColor: "rgba(8,17,31,0.88)",
    borderWidth: 1,
    borderColor: "rgba(119,174,255,0.16)",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 9,
  },
  faqTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  question: {
    flex: 1,
    color: "#F4FAFF",
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "900",
  },
  chevron: {
    color: "#FFD66E",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },
  answer: {
    color: "#93A9C4",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 9,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(159,231,255,0.12)",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
});


