import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Achievement = {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  type?: "one_time" | "progress";
  threshold?: number;
};

type Props = {
  achievement: Achievement;
  unlocked: boolean;
};

type Tone = "gold" | "cyan" | "violet" | "emerald";

const ART_BY_ID: Record<string, ImageSourcePropType> = {
  G1_01_FIRST_GAME: require("../../../assets/images/achievements/achievement_ranked_climber_card.webp"),
  G1_02_FIRST_WIN: require("../../../assets/images/achievements/achievement_first_victory_card.webp"),
  G1_03_FIRST_LOSS: require("../../../assets/images/achievements/achievement_learning_curve_card.webp"),
  G1_04_PROFILE_CREATED: require("../../../assets/images/achievements/achievement_identity_card.webp"),
  G1_05_COME_BACK_TOMORROW: require("../../../assets/images/achievements/achievement_see_you_card.webp"),

  G2_01_10_GAMES: require("../../../assets/images/achievements/achievement_volume_10_card.webp"),
  G2_02_50_GAMES: require("../../../assets/images/achievements/achievement_volume_50_card.webp"),
  G2_03_100_GAMES: require("../../../assets/images/achievements/achievement_volume_100_card.webp"),

  G2_04_10_WINS: require("../../../assets/images/achievements/achievement_wins_10_card.webp"),
  G2_05_50_WINS: require("../../../assets/images/achievements/achievement_wins_50_card.webp"),
  G2_06_100_WINS: require("../../../assets/images/achievements/achievement_wins_100_card.webp"),

  G3_01_FLAWLESS_WIN: require("../../../assets/images/achievements/achievement_flawless_victory_card.webp"),
  G3_02_SPEED_RUNNER: require("../../../assets/images/achievements/achievement_speed_runner_card.webp"),
  G3_03_WIN_STREAK_3: require("../../../assets/images/achievements/achievement_arena_streak_card.webp"),
  G3_04_WIN_STREAK_5: require("../../../assets/images/achievements/achievement_arena_loyalist_card.webp"),
  G3_05_PERFECT_DAY: require("../../../assets/images/achievements/achievement_perfect_day_card.webp"),

  G4_01_3_DAY_STREAK: require("../../../assets/images/achievements/achievement_daily_streak_card.webp"),
  G4_02_7_DAY_STREAK: require("../../../assets/images/achievements/achievement_perfect_day_card.webp"),
  G4_03_14_DAY_STREAK: require("../../../assets/images/achievements/achievement_precision_master_card.webp"),
  G4_04_EARLY_BIRD: require("../../../assets/images/achievements/achievement_early_bird_card.webp"),
  G4_05_NIGHT_OWL: require("../../../assets/images/achievements/achievement_night_owl_card.webp"),

  G5_01_FIRST_COINS: require("../../../assets/images/achievements/achievement_first_coins_card.webp"),
  G5_02_BIG_SPENDER: require("../../../assets/images/achievements/achievement_big_spender_card.webp"),
  G5_03_CUSTOM_LOOK: require("../../../assets/images/achievements/achievement_style_upgrade_card.webp"),
  G5_04_SAVER: require("../../../assets/images/achievements/achievement_saver_card.webp"),
};

const TONE_BY_ID: Record<string, Tone> = {
  G1_02_FIRST_WIN: "gold",
  G2_04_10_WINS: "gold",
  G2_05_50_WINS: "gold",
  G2_06_100_WINS: "gold",
  G3_01_FLAWLESS_WIN: "gold",
  G5_01_FIRST_COINS: "gold",
  G5_02_BIG_SPENDER: "gold",
  G5_04_SAVER: "gold",

  G1_01_FIRST_GAME: "cyan",
  G1_03_FIRST_LOSS: "cyan",
  G1_05_COME_BACK_TOMORROW: "cyan",
  G2_01_10_GAMES: "cyan",
  G2_02_50_GAMES: "cyan",
  G3_02_SPEED_RUNNER: "cyan",
  G3_03_WIN_STREAK_3: "cyan",
  G3_04_WIN_STREAK_5: "cyan",
  G4_01_3_DAY_STREAK: "cyan",
  G4_02_7_DAY_STREAK: "cyan",
  G4_03_14_DAY_STREAK: "cyan",
  G4_04_EARLY_BIRD: "cyan",
  G4_05_NIGHT_OWL: "cyan",

  G1_04_PROFILE_CREATED: "violet",
  G2_03_100_GAMES: "violet",
  G5_03_CUSTOM_LOOK: "violet",
};

function getToneColor(tone: Tone) {
  if (tone === "gold") return "#FFD66E";
  if (tone === "violet") return "#B58CFF";
  if (tone === "emerald") return "#8CFFCB";
  return "#9FE7FF";
}

function AchievementArtCard({
  achievement,
  unlocked,
  art,
}: Props & { art?: ImageSourcePropType }) {
  const title = achievement.title ?? achievement.name ?? "Achievement";
  const tone = achievement.id ? TONE_BY_ID[achievement.id] ?? "cyan" : "cyan";
  const accent = getToneColor(tone);

  return (
    <View style={[styles.card, unlocked ? styles.cardUnlocked : styles.cardLocked]}>
      {art ? (
        <Image
          source={art}
          style={[styles.art, !unlocked && styles.lockedArt]}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(7,17,31,0.98)",
            "rgba(11,34,54,0.96)",
            "rgba(5,10,20,0.98)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(2,6,14,0.24)",
          "rgba(2,6,14,0.04)",
          "rgba(2,6,14,0)",
        ]}
        locations={[0, 0.48, 1]}
        start={{ x: 0, y: 0.52 }}
        end={{ x: 1, y: 0.52 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(0,0,0,0)",
          "rgba(0,0,0,0.04)",
          "rgba(1,5,12,0.28)",
        ]}
        locations={[0, 0.58, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[
          unlocked ? `${accent}24` : "rgba(159,231,255,0.12)",
          "rgba(255,255,255,0.025)",
          "rgba(0,0,0,0)",
        ]}
        locations={[0, 0.34, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255,255,255,0.08)",
          "rgba(255,255,255,0.014)",
          "rgba(255,255,255,0)",
        ]}
        locations={[0, 0.28, 1]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        style={styles.sheen}
      />

      

      <View
        pointerEvents="none"
        style={[styles.topAccent, { backgroundColor: unlocked ? accent : "#7FC7FF" }]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.borderGlow,
          { borderColor: unlocked ? `${accent}A6` : "rgba(126,199,255,0.34)" },
        ]}
      />

      <View style={styles.statusRow}>
        <View style={[styles.statusPill, unlocked ? styles.statusPillUnlocked : styles.statusPillLocked]}>
          <Text style={[styles.statusText, unlocked ? styles.statusTextUnlocked : styles.statusTextLocked]}>
            {unlocked ? "CLAIMED" : "LOCKED"}
          </Text>
        </View>

        <View style={[styles.checkDot, unlocked ? styles.checkDotUnlocked : styles.checkDotLocked]}>
          <Text style={[styles.checkText, unlocked ? styles.checkTextUnlocked : styles.checkTextLocked]}>
            {unlocked ? "✓" : ""}
          </Text>
        </View>
      </View>

      <View style={styles.copy}>
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(3,9,20,0)",
            "rgba(3,9,20,0.34)",
            "rgba(3,9,20,0.58)",
          ]}
          locations={[0, 0.34, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.copyPlate}
        />

        <Text
          style={[styles.title, unlocked ? styles.titleUnlocked : styles.titleLocked]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.84}
        >
          {title}
        </Text>

        <Text
          style={[styles.desc, unlocked ? styles.descUnlocked : styles.descLocked]}
          numberOfLines={2}
        >
          {achievement.description}
        </Text>

        {achievement.type === "progress" && achievement.threshold ? (
          <Text style={styles.goal}>Goal · {achievement.threshold}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function AchievementBadge({ achievement, unlocked }: Props) {
  const art = achievement.id ? ART_BY_ID[achievement.id] : undefined;

  return (
    <AchievementArtCard
      achievement={achievement}
      unlocked={unlocked}
      art={art}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 130,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    backgroundColor: "#050B18",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.20,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  cardUnlocked: {
    borderColor: "rgba(159,231,255,0.42)",
    opacity: 1,
  },
  cardLocked: {
    borderColor: "rgba(126,199,255,0.32)",
    opacity: 1,
  },
  art: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 1,
  },
  lockedArt: {
    opacity: 0.98,
  },
  lockedVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(24,58,88,0.04)",
  },
  sheen: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.36,
  },
  topAccent: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 0,
    height: 1,
    opacity: 0.9,
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
  },
  statusRow: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillUnlocked: {
    backgroundColor: "rgba(6,18,34,0.58)",
    borderColor: "rgba(159,231,255,0.34)",
  },
  statusPillLocked: {
    backgroundColor: "rgba(16,35,58,0.62)",
    borderColor: "rgba(159,231,255,0.24)",
  },
  statusText: {
    fontSize: 7.4,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  statusTextUnlocked: {
    color: "#9FE7FF",
  },
  statusTextLocked: {
    color: "#D8E7FF",
  },
  checkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  checkDotUnlocked: {
    backgroundColor: "rgba(7,17,31,0.64)",
    borderColor: "rgba(255,214,110,0.6)",
  },
  checkDotLocked: {
    backgroundColor: "rgba(18,42,67,0.48)",
    borderColor: "rgba(159,231,255,0.22)",
  },
  checkText: {
    fontWeight: "900",
    lineHeight: 16,
  },
  checkTextUnlocked: {
    color: "#FFD66E",
    fontSize: 13,
  },
  checkTextLocked: {
    color: "#7E8EA7",
    fontSize: 12,
  },
  copy: {
    flex: 1,
    zIndex: 4,
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 12,
  },
  copyPlate: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
  },
  title: {
    fontSize: 15.4,
    lineHeight: 18.5,
    fontWeight: "900",
    letterSpacing: -0.16,
    textShadowColor: "rgba(0,0,0,0.92)",
    textShadowRadius: 10,
  },
  titleUnlocked: {
    color: "#F4FAFF",
  },
  titleLocked: {
    color: "#F1F7FF",
  },
  desc: {
    marginTop: 5,
    fontSize: 10.6,
    lineHeight: 14,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.88)",
    textShadowRadius: 8,
  },
  descUnlocked: {
    color: "#E1EEFF",
  },
  descLocked: {
    color: "#D8E7FF",
  },
  goal: {
    marginTop: 5,
    color: "#FFD66E",
    fontSize: 8.7,
    lineHeight: 10.4,
    fontWeight: "900",
    letterSpacing: 0.72,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.82)",
    textShadowRadius: 8,
  },
});


