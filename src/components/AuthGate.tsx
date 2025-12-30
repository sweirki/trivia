import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { useAuthStore } from "@/store/useAuthStore";
import ProgressRestoredPopup from "./ProgressRestoredPopup";

export default function AuthGate({ children }) {
  const { user, loading, initAuth, welcomePopup } = useAuthStore();
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    initAuth();
  }, [initAuth]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🚫 NO REDIRECT HERE
 return (
  <>
    {children}
    {user && welcomePopup && <ProgressRestoredPopup visible />}
  </>
);

  return (
    <>
      {children}
      {welcomePopup && <ProgressRestoredPopup visible />}
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
