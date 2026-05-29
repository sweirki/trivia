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

const BG = require("../../../../assets/premium/atmospheres/premium_section_bg.webp");

const HORIZONTAL_PADDING = 18;
const TILE_GAP = 8;
const COLUMN_COUNT = 3;

export default function CategorySelect() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const comingSoonCount = CATEGORIES.filter((c) => !c.hasQuestions).length;
  const tileWidth = Math.floor(
    (width - HORIZONTAL_PADDING * 2 - TILE_GAP * (COLUMN_COUNT - 1)) /
      COLUMN_COUNT
  );
  const tileHeight = Math.round(tileWidth * 0.86);

  return (
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.66)",
          "rgba(3,6,24,0.42)",
          "rgba(0,0,0,0.78)",
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>QUICK PLAY</Text>
          <Text style={styles.title}>Choose a World</Text>
          <Text style={styles.subtitle}>Cinematic worlds. Fast start. Clear identity.</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.randomCard,
            pressed && styles.randomCardPressed,
          ]}
          onPress={() => router.replace("/(app)/play/(screens)/quick?category=random" as any)}
        >
          <LinearGradient
            colors={[
              "rgba(214,169,58,0.18)",
              "rgba(55,139,255,0.12)",
              "rgba(6,13,31,0.88)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.randomOrb} />
          <View style={styles.randomTextBlock}>
            <Text style={styles.randomKicker}>INSTANT CATEGORY MIX</Text>
            <Text style={styles.randomTitle}>Random Mix</Text>
          </View>
          <Text style={styles.randomArrow}>›</Text>
        </Pressable>

        <View style={styles.grid}>
          {PLAYABLE_CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => router.replace(`/(app)/play/(screens)/quick?category=${category.id}` as any)}
              accessibilityLabel={`${category.label} category`}
              accessibilityHint="Starts a quick play run in this category"
              style={({ pressed }) => [
                styles.worldTile,
                {
                  width: tileWidth,
                  height: tileHeight,
                  shadowColor: category.color,
                  borderColor: `${category.color}A8`,
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
                colors={["rgba(2,6,14,0.22)", "rgba(2,6,14,0.04)", "rgba(2,6,14,0)"]}
                locations={[0, 0.44, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                pointerEvents="none"
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.10)", "rgba(0,0,0,0.48)"]}
                locations={[0, 0.48, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                pointerEvents="none"
                colors={["rgba(255,214,110,0.18)", "rgba(33,190,255,0.14)", "rgba(0,0,0,0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View pointerEvents="none" style={[styles.artAccent, { backgroundColor: category.color }]} />
              <View pointerEvents="none" style={[styles.artBorderGlow, { borderColor: `${category.color}99` }]} />

              <View style={styles.labelBand}>
                <Text
                  style={styles.worldLabel}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.68}
                >
                  {category.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {comingSoonCount > 0 && (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>More Worlds Incoming</Text>
            <Text style={styles.noticeText}>
              {comingSoonCount} locked worlds will unlock when their question packs
              are ready.
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
    backgroundColor: "#02040D",
  },

  container: {
    paddingTop: 42,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 92,
  },

  headerRow: {
    marginBottom: 10,
  },

  eyebrow: {
    color: "#D6A93A",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: 3,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  subtitle: {
    color: "#AEBBE6",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 3,
  },

  randomCard: {
    minHeight: 62,
    borderRadius: 21,
    marginBottom: 10,
    paddingHorizontal: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(214,169,58,0.34)",
    backgroundColor: "rgba(6,13,31,0.84)",
    shadowColor: "#D6A93A",
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 7,
  },

  randomCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },

  randomOrb: {
    position: "absolute",
    right: 38,
    top: -34,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(86,166,255,0.10)",
  },

  randomTextBlock: {
    flex: 1,
  },

  randomKicker: {
    color: "#D6A93A",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.15,
    marginBottom: 2,
  },

  randomTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.45,
  },

  randomArrow: {
    color: "#F7D86B",
    fontSize: 30,
    lineHeight: 31,
    fontWeight: "900",
    marginLeft: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: TILE_GAP,
    rowGap: TILE_GAP,
  },

  worldTile: {
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#07111F",
    borderWidth: 1,
    shadowOpacity: 0.30,
    shadowRadius: 15,
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
    backgroundColor: "#07111F",
  },

  fallbackIcon: {
    color: "#D6A93A",
    fontSize: 34,
    fontWeight: "900",
    textShadowColor: "rgba(214,169,58,0.35)",
    textShadowRadius: 12,
  },

  artAccent: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 0,
    height: 1,
    opacity: 0.92,
  },

  artBorderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1,
    opacity: 0.95,
  },

  labelBand: {
    position: "absolute",
    left: 7,
    right: 7,
    bottom: 7,
    minHeight: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    backgroundColor: "rgba(1,3,13,0.70)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.28)",
  },

  worldLabel: {
    color: "#F1F6FF",
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.18,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 8,
  },

  notice: {
    marginTop: 12,
    borderRadius: 20,
    padding: 13,
    backgroundColor: "rgba(7,15,32,0.70)",
    borderWidth: 1,
    borderColor: "rgba(214,169,58,0.22)",
  },

  noticeTitle: {
    color: "#D6A93A",
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 3,
  },

  noticeText: {
    color: "#AAB8E8",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },

  bottomSpacer: {
    height: 28,
  },
});
