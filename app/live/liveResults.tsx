import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../src/lib/theme";
import LiveScoreCard from "../../src/components/LiveScoreCard";
import VictoryBanner from "../../src/components/VictoryBanner";

export default function LiveResults() {
  const router = useRouter();
  const [showBanner, setShowBanner] = useState(true);

  // these will later come from match context or route params
  const mode = "duel";
  const matchId = "demoMatch"; // temporary placeholder

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏁 Match Results</Text>

      {/* live score display */}
      <LiveScoreCard mode={mode} matchId={matchId} />

      {/* victory animation */}
      {showBanner && <VictoryBanner text="🏆 Victory!" />}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/index")}
      >
        <Text style={styles.btnText}>Return Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: theme.colors.primary,
    fontSize: 26,
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: 12,
    borderRadius: 10,
    marginTop: 30,
  },
  btnText: { color: "#fff", fontSize: 16 },
});
