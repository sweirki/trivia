// AuthGate.tsx — STABLE VERSION (No reruns, no segment tracking)

import React, { useEffect, useRef } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import ProgressRestoredPopup from "./ProgressRestoredPopup";

export default function AuthGate({ children }) {
  const router = useRouter();
  const { user, loading, initAuth, welcomePopup } = useAuthStore();

  // Prevent double initialization
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      initAuth();
    }
  }, []);

  // Handles navigation AFTER auth resolves
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/(auth)/login");
    } else {
      router.replace("/hub");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FFD775" size="large" />
      </View>
    );
  }

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
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
});


