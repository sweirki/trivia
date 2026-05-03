import React from "react";
import { StyleSheet, Image } from "react-native";
import { Text, useTheme } from "@/theme";
import GoldCard from "@/components/GoldCard";
import GoldButton from "@/components/GoldButton";

export default function DailyRewardCard({ onClaim }: { onClaim: () => void }) {
  const theme = useTheme();

  return (
    <GoldCard style={styles.card}>
      <Image
        source={require("@assets/images/icon.png")}
        style={styles.icon}
      />

      <Text style={[theme.typography.h2, { fontSize: 14, marginTop: 4 }]}>
        Daily Reward
      </Text>

      <Text
        style={[
          theme.typography.small,
          { fontSize: 10, marginTop: 1, color: theme.colors.goldSoft },
        ]}
      >
        Claim your bonus XP
      </Text>

      <GoldButton
        title="Claim"
        onPress={onClaim}
        style={{ marginTop: 8, width: "100%" }}
        textStyle={{ fontSize: 12 }}
      />
    </GoldCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    width: 24,       // (was 28)
    height: 24,
    resizeMode: "contain",
  },
});


