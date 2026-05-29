import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
  Image,
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
  const [bootSplashVisible, setBootSplashVisible] = useState(true);
  const [bootProgress, setBootProgress] = useState(12);

  useEffect(() => {
    if (didInitRef.current) return;

    didInitRef.current = true;
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setBootProgress((value) => Math.min(96, value + 7));
    }, 120);

    const minimumSplashTimer = setTimeout(() => {
      setBootSplashVisible(false);
    }, 1500);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(minimumSplashTimer);
    };
  }, []);

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

  if (loading || bootSplashVisible) {
    return (
      <View style={styles.bootSplash}>
        <View style={styles.bootGlow} />
        <Image
          source={require("../../assets/images/splash-icon.png")}
          style={styles.bootLogo}
          resizeMode="contain"
        />
        <Text style={styles.bootTitle}>TriviaWorld</Text>
        <Text style={styles.bootSubtitle}>Preparing your arena…</Text>
        <View style={styles.bootProgressTrack}>
          <View style={[styles.bootProgressFill, { width: `${bootProgress}%` }]} />
        </View>
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
  bootSplash: {
    flex: 1,
    backgroundColor: "#07111F",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },

  bootGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(246,196,83,0.10)",
  },

  bootLogo: {
    width: 150,
    height: 150,
    marginBottom: 14,
  },

  bootTitle: {
    color: "#F6C453",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  bootSubtitle: {
    color: "#AAB8E8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 18,
  },

  bootProgressTrack: {
    width: "72%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },

  bootProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#F6C453",
  },

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



