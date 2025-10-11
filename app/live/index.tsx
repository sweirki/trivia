import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../src/lib/theme";

export default function LiveArenaHome() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎮 Live Arena</Text>
      <Text style={styles.subtitle}>Choose your mode</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/live/duel")}>
        <Text style={styles.btnText}>⚔️ Duel Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/live/tournament")}>
        <Text style={styles.btnText}>🏆 Tournament</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/live/daily")}>
        <Text style={styles.btnText}>📅 Daily Challenge</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/live/survival")}>
        <Text style={styles.btnText}>💀 Survival Mode</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  title: {
    color: theme.colors.accent,
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.text,
    fontSize: 18,
    marginBottom: 32,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  btnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
