import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { router, usePathname } from "expo-router";

import { Text } from "@/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlayerStore } from "@/store/usePlayerStore";

import ProgressRestoredPopup from "./ProgressRestoredPopup";

type AuthGateProps = {
  children: ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const {
    user,
    loading,
    initAuth,
    needsMergePrompt,
    mergeLocalProgressToCloud,
    startFreshAccount,
    isGuest,
    continueAsGuest,
  } = useAuthStore();

  const { level, xp, coins, nickname } = usePlayerStore();
  const pathname = usePathname();

  const didInitRef = useRef(false);
  const [showMergePrompt, setShowMergePrompt] = useState(false);

  useEffect(() => {
    if (didInitRef.current) return;

    didInitRef.current = true;
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (needsMergePrompt) {
      setShowMergePrompt(true);
    }
  }, [needsMergePrompt]);

  const handleSaveProgress = async () => {
    await mergeLocalProgressToCloud();
    setShowMergePrompt(false);

    // "/merge-complete" was removed during production cleanup.
    // Redirect to the app root instead, which is a valid Expo Router route.
    router.replace("/");
  };

  const handleStartFresh = async () => {
    await startFreshAccount();
    setShowMergePrompt(false);
  };

  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/signup") || pathname?.startsWith("/forgot") || pathname?.startsWith("/verify-email");

  const handleContinueAsGuest = () => {
    continueAsGuest();
    router.replace("/hub");
  };

  const handleLogin = () => {
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user && !isGuest && !isAuthRoute) {
    return (
      <View style={styles.guestChoiceScreen}>
        <View style={styles.guestChoiceCard}>
          <Text style={styles.title}>Welcome to TriviaWorld</Text>
          <Text style={styles.subtitle}>
            Continue as a guest on this device or sign in to sync your progress.
          </Text>

          <Pressable style={styles.primaryBtn} onPress={handleContinueAsGuest}>
            <Text style={styles.primaryText}>Continue as Guest</Text>
          </Pressable>

          <Pressable style={styles.secondaryOutlineBtn} onPress={handleLogin}>
            <Text style={styles.secondaryOutlineText}>Login / Register</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <>
      {children}

      {user && <ProgressRestoredPopup visible />}

      <Modal visible={showMergePrompt} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Save your progress?</Text>

            <Text style={styles.subtitle}>
              This account does not have progress yet.
            </Text>

            <View style={styles.stats}>
              <Text style={styles.stat}>
                {nickname ?? "Player"} • Level {level}
              </Text>
              <Text style={styles.stat}>
                XP: {xp} • Coins: {coins}
              </Text>
            </View>

            <Pressable style={styles.primaryBtn} onPress={handleSaveProgress}>
              <Text style={styles.primaryText}>Save my progress</Text>
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={handleStartFresh}>
              <Text style={styles.secondaryText}>Start fresh</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  guestChoiceScreen: {
    flex: 1,
    backgroundColor: "#0B1220",
    justifyContent: "center",
    padding: 24,
  },

  guestChoiceCard: {
    backgroundColor: "#141C2E",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#24304C",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
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

  secondaryBtn: {
    marginTop: 10,
    paddingVertical: 10,
  },

  secondaryOutlineBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F6C453",
  },

  secondaryOutlineText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: "#F6C453",
  },

  secondaryText: {
    textAlign: "center",
    fontSize: 13,
    color: "#9AA3B2",
  },
});

