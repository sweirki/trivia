import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../src/lib/theme";
import ArenaCountdown from "../../src/components/ArenaCountdown";

export default function DailyScreen() {
  const [status, setStatus] = useState<"idle" | "countdown" | "active">("idle");
  const router = useRouter();

  const handleStart = () => setStatus("countdown");
  const handleCountdownComplete = () => {
    setStatus("active");
    router.push("/live/liveLobby");
  };

  return (
    <View style={styles.container}>
      {status === "idle" && (
        <>
          <Text style={styles.title}>📅 Daily Challenge</Text>
          <Text style={styles.text}>Everyone answers the same questions today!</Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.btnText}>Start Daily Challenge</Text>
          </TouchableOpacity>
        </>
      )}

      {status === "countdown" && (
        <ArenaCountdown onComplete={handleCountdownComplete} />
      )}

      {status === "active" && (
        <Text style={styles.text}>Loading daily match...</Text>
      )}
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
    fontSize: 28,
    marginBottom: 12,
    fontWeight: "bold",
  },
  text: {
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
