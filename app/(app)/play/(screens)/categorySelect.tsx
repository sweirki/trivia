
// app/(app)/play/(screens)/categorySelect.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";

import { useRouter } from "expo-router";
import { PLAYABLE_CATEGORIES, CATEGORIES } from "@/data/categories";

const BG = require("../../../../assets/premium/atmospheres/premium_section_bg.webp");

export default function CategorySelect() {
  const router = useRouter();

  const comingSoonCount = CATEGORIES.filter(
    (c) => !c.hasQuestions
  ).length;

  return (
    <ImageBackground
      source={BG}
      style={styles.root}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>TRIVIAWORLD</Text>

          <Text style={styles.title}>
            Choose Your{"\n"}Category
          </Text>

          <Text style={styles.subtitle}>
            Pick a trivia world and start your next challenge.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.featuredCard,
            pressed && styles.cardPressed,
          ]}
          onPress={() => router.push("/play/quick?category=random")}
        >
          <View style={styles.featuredGlow} />

          <View style={styles.featuredContent}>
            <Text style={styles.featuredLabel}>
              QUICK START
            </Text>

            <Text style={styles.featuredTitle}>
              Random Mix
            </Text>

            <Text style={styles.featuredText}>
              Instant random category challenge
            </Text>
          </View>

          <Text style={styles.featuredArrow}>›</Text>
        </Pressable>

        <View style={styles.grid}>
          {PLAYABLE_CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              onPress={() =>
                router.push(
                  `/play/quick?category=${category.id}`
                )
              }
              style={({ pressed }) => [
                styles.card,
                {
                  shadowColor: category.color,
                },
                pressed && styles.tilePressed,
              ]}
            >
              <View
                style={[
                  styles.cardGlow,
                  {
                    shadowColor: category.color,
                  },
                ]}
              />

              <View style={styles.iconWrap}>
                {category.icon ? (
                  <Image
                    source={category.icon}
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.fallbackIcon}>
                    ★
                  </Text>
                )}
              </View>

              <Text
                style={styles.cardTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {comingSoonCount > 0 && (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>
              More Worlds Incoming
            </Text>

            <Text style={styles.noticeText}>
              {comingSoonCount} future categories are hidden
              until their question packs are completed.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050816",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.62)",
  },

  container: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 112,
  },

  hero: {
    marginBottom: 18,
  },

  eyebrow: {
    color: "#D6A93A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: 5,
  },

  title: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.8,
    marginBottom: 6,
  },

  subtitle: {
    color: "#B8C3E6",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    maxWidth: "92%",
  },

  featuredCard: {
    minHeight: 88,
    borderRadius: 20,
    padding: 16,

    marginBottom: 18,

    overflow: "hidden",

    backgroundColor: "rgba(8,17,34,0.86)",

    borderWidth: 1,
    borderColor: "rgba(214,169,58,0.24)",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#D6A93A",
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },

    elevation: 5,
  },

  featuredGlow: {
    position: "absolute",
    right: -18,
    top: -14,

    width: 84,
    height: 84,
    borderRadius: 42,

    backgroundColor: "rgba(86,166,255,0.08)",
  },

  featuredContent: {
    flex: 1,
  },

  featuredLabel: {
    color: "#D6A93A",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginBottom: 4,
  },

  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 2,
  },

  featuredText: {
    color: "#AAB8E8",
    fontSize: 12,
    fontWeight: "700",
  },

  featuredArrow: {
    color: "#D6A93A",
    fontSize: 30,
    fontWeight: "700",
    marginLeft: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  card: {
    width: "31%",
    height: 108,

    borderRadius: 20,

    paddingHorizontal: 6,
    paddingVertical: 8,

    overflow: "hidden",

    backgroundColor: "rgba(10,18,36,0.92)",

    borderWidth: 1.2,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  tilePressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },

  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },

  cardGlow: {
    position: "absolute",
    top: -22,
    right: -22,

    width: 44,
    height: 44,

    borderRadius: 29,

    backgroundColor: "rgba(86,166,255,0.05)",

    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  iconWrap: {
    width: 70,
    height: 70,

    borderRadius: 22,

    backgroundColor: "rgba(18,28,52,0.22)",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 6,

    borderWidth: 1,
    borderColor: "rgba(143,183,217,0.025)",
  },

  iconImage: {
    width: 68,
    height: 68,
  },

  fallbackIcon: {
    color: "#D6A93A",
    fontSize: 36,
    fontWeight: "900",
  },

  cardTitle: {
    color: "#EAF3FF",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  notice: {
    marginTop: 18,

    borderRadius: 20,

    padding: 14,

    backgroundColor: "rgba(10,18,36,0.92)",

    borderWidth: 1,
    borderColor: "rgba(214,169,58,0.20)",
  },

  noticeTitle: {
    color: "#D6A93A",
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 4,
  },

  noticeText: {
    color: "#AAB8E8",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },

  bottomSpacer: {
    height: 42,
  },
});
