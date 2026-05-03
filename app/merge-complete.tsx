// app/merge-complete.tsx
import { useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

import { Text } from "@/theme";
import { useAuthStore } from "@/store/useAuthStore";

export default function MergeCompleteScreen() {
  const user = useAuthStore((s) => s.user);
  const cloudProfile = useAuthStore((s) => s.cloudProfile);
  const justMerged = useAuthStore((s) => s.justMerged);

  useEffect(() => {
    // One-time ceremony guard:
    // - must be logged in
    // - must have initialized cloud profile
    // - must have just merged in this session
    const ok =
      !!user &&
      !!cloudProfile &&
      cloudProfile.profileInitialized === true &&
      justMerged === true;

    if (!ok) {
      router.replace("/");
    }
  }, [user, cloudProfile, justMerged]);

  const xp = cloudProfile?.xp ?? 0;
  const level = cloudProfile?.level ?? 1;
  const coins = cloudProfile?.coins ?? 0;

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Merge complete</Text>
        <Text style={styles.subtitle}>
          Your guest progress is now saved to this account.
        </Text>

        <View style={styles.stats}>
          <Text style={styles.stat}>Level: {level}</Text>
          <Text style={styles.stat}>XP: {xp}</Text>
          <Text style={styles.stat}>Coins: {coins}</Text>
        </View>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            useAuthStore.setState({ justMerged: false });
            router.replace("/");
          }}
        >
          <Text style={styles.primaryText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0B1220",
  },
  card: {
    backgroundColor: "#141C2E",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#24304C",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F6C453",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: "#9AA3B2",
    textAlign: "center",
  },
  stats: {
    marginVertical: 16,
    alignItems: "center",
  },
  stat: {
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 4,
  },
  primaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#F6C453",
  },
  primaryText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: "#0B1220",
  },
});

