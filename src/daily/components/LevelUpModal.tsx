// A+++++ LevelUpModal — fully synced with new PlayerStore
import React, { useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import ConfettiView from "./ConfettiView";
import { usePlayerStore } from "@/store/usePlayerStore";
import { feedback } from "@/feedback";

export default function LevelUpModal({ visible, onClose }) {
  const level = usePlayerStore((s) => s.level);
  const vipTier = usePlayerStore((s) => s.vipTier);

  // NEW — level-up reward package (can be expanded later)
  const rewardCoins = 20 * level;
  const rewardGems = level % 3 === 0 ? 1 : 0;

  const grantRewards = () => {
    const store = usePlayerStore.getState();
    store.addCoins(rewardCoins);
    if (rewardGems > 0) store.addGems(rewardGems);
  };

  useEffect(() => {
    if (!visible) return;

    grantRewards();
    feedback.levelUp();
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>

          <ConfettiView trigger={visible} />

          <Text style={styles.level}>
            LEVEL {level}
          </Text>

          {vipTier > 0 && (
            <Text style={styles.vip}>
              ⭐ VIP {vipTier} Bonus Active!
            </Text>
          )}

          <Text style={styles.msg}>
            You leveled up!
          </Text>

          <Text style={[styles.reward]}>
            +{rewardCoins} Coins {rewardGems > 0 ? ` • +${rewardGems} Gem` : ""}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              feedback.tap();
              onClose?.();
            }}
          >
            <Text style={styles.buttonTxt}>Continue</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.84)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    padding: 26,
    alignItems: "center",
    backgroundColor: "#101827",
    borderWidth: 1.5,
    borderColor: "rgba(246,196,83,0.42)",
    shadowColor: "#F6C453",
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  level: {
    color: "#F6C453",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  vip: {
    fontSize: 14,
    color: "#F6C453",
    marginTop: 8,
    fontWeight: "900",
  },
  msg: {
    color: "#F4FAFF",
    fontSize: 22,
    marginTop: 12,
    fontWeight: "900",
  },
  reward: {
    fontSize: 17,
    marginTop: 12,
    color: "#F6C453",
    fontWeight: "900",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#00D4FF",
    paddingVertical: 13,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginTop: 24,
    minWidth: 170,
    alignItems: "center",
  },
  buttonTxt: {
    color: "#07111F",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
