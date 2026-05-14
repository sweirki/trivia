// app/(app)/shop/index.tsx
// Phase 5.1 — legacy shop route safely redirects to the unified Store / Bazaar.

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function LegacyShopRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/store");
  }, [router]);

  return (
    <View style={styles.root}>
      <Text style={styles.text}>Opening Store / Bazaar...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080811", alignItems: "center", justifyContent: "center" },
  text: { color: "#FFD34D", fontSize: 16, fontWeight: "900" },
});

