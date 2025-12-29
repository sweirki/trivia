// AuthGate.tsx — PASSIVE, SAFE, FINAL
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import ProgressRestoredPopup from "./ProgressRestoredPopup";

export default function AuthGate({ children }) {
  const { user, loading, initAuth, welcomePopup } = useAuthStore();
  const didInitRef = useRef(false);

  // Initialize auth ONCE
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    initAuth();
  }, [initAuth]);

  // While auth is resolving, block rendering
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ❗ NO ROUTING HERE
  // ❗ NO REDIRECTS HERE
  // ❗ NO SIDE EFFECTS

  return (
    <>
      {children}
      {user && welcomePopup && <ProgressRestoredPopup visible />}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
