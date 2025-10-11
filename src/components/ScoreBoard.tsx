import React from "react";
import { View, Text, ImageBackground } from "react-native";
import { colors, spacing } from "../lib/theme";

type Props = {
  score: number;
  streak: number;
};

export default function ScoreBoard({ score, streak }: Props) {
  return (
    <ImageBackground
      source={require("../../assets/images/scoreboard-bg.png")}
      style={{
        width: "100%",
        padding: spacing.md,
        borderRadius: 16,
        alignItems: "center",
        marginBottom: spacing.md,
      }}
      imageStyle={{ borderRadius: 16 }}
    >
      <Text style={{ color: colors.text, fontSize: 18 }}>
        Score: {score.toFixed(0)}
      </Text>
      <Text style={{ color: colors.secondary, marginTop: 4 }}>
        🔥 Streak: {streak}
      </Text>
    </ImageBackground>
  );
}
