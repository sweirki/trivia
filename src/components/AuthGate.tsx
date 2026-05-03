import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";

import { Text } from "@/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { router } from "expo-router";

import ProgressRestoredPopup from "./ProgressRestoredPopup";

export default function AuthGate({ children }) {
 const {
  user,
  loading,
  initAuth,
  needsMergePrompt,
  mergeLocalProgressToCloud,
  startFreshAccount,
} = useAuthStore();


  const { level, xp, coins, nickname } = usePlayerStore();

  const didInitRef = useRef(false);
  const [showMergePrompt, setShowMergePrompt] = useState(false);

  // ---------------------------------------------------------
  // Init auth ONCE
  // ---------------------------------------------------------
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    initAuth();
  }, [initAuth]);

  // ---------------------------------------------------------
  // Show merge prompt ONCE when eligible
  // ---------------------------------------------------------
  useEffect(() => {
    if (needsMergePrompt) {
      setShowMergePrompt(true);
    }
  }, [needsMergePrompt]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      {children}

      {/* Existing popup */}
      {user && <ProgressRestoredPopup visible />}

      {/* ------------------------------------------------- */}
      {/* MERGE PROMPT (PHASE 10D-4) */}
      {/* ------------------------------------------------- */}
      <Modal
        visible={showMergePrompt}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>
              Save your progress?
            </Text>

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

                    <Pressable
              style={styles.primaryBtn}
              onPress={async () => {
                await mergeLocalProgressToCloud();
                setShowMergePrompt(false);
                router.replace("/merge-complete");
              }}
            >

              <Text style={styles.primaryText}>
                Save my progress
              </Text>
            </Pressable>

          <Pressable
  style={styles.secondaryBtn}
  onPress={async () => {
    await startFreshAccount();
    setShowMergePrompt(false);
  }}
>

              <Text style={styles.secondaryText}>
                Start fresh
              </Text>
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

  secondaryText: {
    textAlign: "center",
    fontSize: 13,
    color: "#9AA3B2",
  },
});

