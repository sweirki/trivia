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
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { PLAYABLE_CATEGORIES, CATEGORIES } from "@/data/categories";

const BG = require("../../../../assets/images/modes/hub_hero_banner.webp");

const HORIZONTAL_PADDING = 18;
const TILE_GAP = 8;
const COLUMN_COUNT = 3;

export default function CategorySelect() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const comingSoonCount = CATEGORIES.filter((c) => !c.hasQuestions).length;
  const tileWidth = Math.floor(
    (width - HORIZONTAL_PADDING * 2 - TILE_GAP * (COLUMN_COUNT - 1)) /
      COLUMN_COUNT,
  );
  const tileHeight = Math.round(tileWidth * 0.9);

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <LinearGradient
        colors={[
          "rgba(7,18,42,0.34)",
          "rgba(7,22,54,0.24)",
          "rgba(3,10,26,0.50)",
        ]}
        locations={[0, 0.46, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={styles.cyanAtmosphere} />
      <View pointerEvents="none" style={styles.goldAtmosphere} />
      <View pointerEvents="none" style={styles.lowerShade} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <LinearGradient
            pointerEvents="none"
            colors={[
              "rgba(255,255,255,0.12)",
              "rgba(36,200,255,0.04)",
              "rgba(0,0,0,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View pointerEvents="none" style={styles.headerGlow} />
          <Text style={styles.eyebrow}>QUICK PLAY</Text>
          <Text style={styles.title}>Choose a World</Text>
          <Text style={styles.subtitle}>
            Pick a category, build momentum, and chase a cleaner run.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.randomCard,
            pressed && styles.randomCardPressed,
          ]}
          onPress={() =>
            router.replace(
              "/(app)/play/(screens)/quick?category=random" as any,
            )
          }
        >
          <LinearGradient
            colors={[
              "rgba(143,230,255,0.20)",
              "rgba(245,196,81,0.13)",
              "rgba(10,24,52,0.90)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View pointerEvents="none" style={styles.randomTopLine} />
          <View pointerEvents="none" style={styles.randomOrb} />
          <View style={styles.randomTextBlock}>
            <Text style={styles.randomKicker}>INSTANT CATEGORY MIX</Text>
            <Text style={styles.randomTitle}>Random Mix</Text>
            <Text style={styles.randomSub}>Fastest way into a run</Text>
          </View>
          <View style={styles.randomArrowPill}>
            <Text style={styles.randomArrow}>›</Text>
          </View>
        </Pressable>

        <View style={styles.grid}>
          {PLAYABLE_CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              onPress={() =>
                router.replace(
                  `/(app)/play/(screens)/quick?category=${category.id}` as any,
                )
              }
              accessibilityLabel={`${category.label} category`}
              accessibilityHint="Starts a quick play run in this category"
              style={({ pressed }) => [
                styles.worldTile,
                {
                  width: tileWidth,
                  height: tileHeight,
                  shadowColor: category.color,
                  borderColor: `${category.color}B8`,
                },
                pressed && styles.worldTilePressed,
              ]}
            >
              {category.icon ? (
                <Image
                  source={category.icon}
                  style={styles.cardArt}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.fallbackArt}>
                  <Text style={styles.fallbackIcon}>★</Text>
                </View>
              )}

              <LinearGradient
                pointerEvents="none"
                colors={[
                  "rgba(3,8,18,0.08)",
                  "rgba(3,12,28,0.00)",
                  "rgba(3,8,18,0.34)",
                ]}
                locations={[0, 0.45, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                pointerEvents="none"
                colors={[
                  "rgba(255,255,255,0.14)",
                  "rgba(36,200,255,0.10)",
                  "rgba(245,196,81,0.05)",
                  "rgba(0,0,0,0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View
                pointerEvents="none"
                style={[styles.artAccent, { backgroundColor: category.color }]}
              />
              <View
                pointerEvents="none"
                style={[styles.artBorderGlow, { borderColor: `${category.color}A8` }]}
              />

              <View style={styles.labelBand}>
                <Text
                  style={styles.worldLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                >
                  {category.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {comingSoonCount > 0 && (
          <View style={styles.notice}>
            <View pointerEvents="none" style={styles.noticeGlow} />
            <Text style={styles.noticeTitle}>More Worlds Incoming</Text>
            <Text style={styles.noticeText}>
              {comingSoonCount} locked worlds will unlock when their question
              packs are ready.
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
    backgroundColor: "#071226",
  },

  cyanAtmosphere: {
    position: "absolute",
    top: -118,
    right: -86,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(36,200,255,0.16)",
  },

  goldAtmosphere: {
    position: "absolute",
    top: 116,
    left: -92,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(245,196,81,0.10)",
  },

  lowerShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
    backgroundColor: "rgba(3,8,20,0.26)",
  },

  container: {
    paddingTop: 40,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 92,
  },

  headerCard: {
    overflow: "hidden",
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 12,
    backgroundColor: "rgba(10,24,52,0.66)",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.24)",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },

  headerGlow: {
    position: "absolute",
    top: -62,
    right: -42,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(143,230,255,0.12)",
  },

  eyebrow: {
    color: "#8FE6FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: 3,
    textShadowColor: "rgba(0,0,0,0.72)",
    textShadowRadius: 7,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 31,
    fontWeight: "900",
    letterSpacing: -0.7,
    textShadowColor: "rgba(0,0,0,0.82)",
    textShadowRadius: 8,
  },

  subtitle: {
    color: "#C8D8F2",
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "800",
    marginTop: 5,
  },

  randomCard: {
    minHeight: 72,
    borderRadius: 23,
    marginBottom: 12,
    paddingHorizontal: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.1,
    borderColor: "rgba(143,230,255,0.34)",
    backgroundColor: "rgba(12,28,58,0.90)",
    shadowColor: "#8FE6FF",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  randomCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },

  randomTopLine: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.26)",
  },

  randomOrb: {
    position: "absolute",
    right: 30,
    top: -38,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(86,166,255,0.16)",
  },

  randomTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  randomKicker: {
    color: "#F5C451",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.15,
    marginBottom: 2,
  },

  randomTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -0.45,
  },

  randomSub: {
    color: "#BFD9F2",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  randomArrowPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    backgroundColor: "rgba(143,230,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.32)",
  },

  randomArrow: {
    color: "#8FE6FF",
    fontSize: 30,
    lineHeight: 31,
    fontWeight: "900",
    marginTop: -2,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: TILE_GAP,
    rowGap: TILE_GAP,
  },

  worldTile: {
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#0A1930",
    borderWidth: 1,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  worldTilePressed: {
    transform: [{ scale: 0.965 }],
    opacity: 0.9,
  },

  cardArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 1,
  },

  fallbackArt: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A1930",
  },

  fallbackIcon: {
    color: "#F5C451",
    fontSize: 34,
    fontWeight: "900",
    textShadowColor: "rgba(245,196,81,0.35)",
    textShadowRadius: 12,
  },

  artAccent: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 0,
    height: 1,
    opacity: 0.95,
  },

  artBorderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    opacity: 0.95,
  },

  labelBand: {
    position: "absolute",
    left: 7,
    right: 7,
    bottom: 7,
    minHeight: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    backgroundColor: "rgba(8,22,44,0.76)",
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.34)",
  },

  worldLabel: {
    color: "#F4FAFF",
    fontSize: 11.2,
    lineHeight: 13,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.18,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 8,
  },

  notice: {
    overflow: "hidden",
    marginTop: 13,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(10,24,52,0.82)",
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.24)",
  },

  noticeGlow: {
    position: "absolute",
    top: -36,
    right: -24,
    width: 120,
    height: 90,
    borderRadius: 70,
    backgroundColor: "rgba(143,230,255,0.10)",
  },

  noticeTitle: {
    color: "#8FE6FF",
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 3,
  },

  noticeText: {
    color: "#C8D8F2",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },

  bottomSpacer: {
    height: 28,
  },
});
