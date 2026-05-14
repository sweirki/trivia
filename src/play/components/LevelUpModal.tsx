// A+++++ LevelUpModal — fully synced with new PlayerStore
import React, { useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/theme";
import ConfettiView from "./ConfettiView";
import { usePlayerStore } from "@/store/usePlayerStore";
import { feedback } from "@/feedback";

export default function LevelUpModal({ visible, onClose }) {
  const theme = useTheme();

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
        <View style={[styles.card, { backgroundColor: theme.colors.backgroundSoft }]}>

          <ConfettiView trigger={visible} />

          <Text style={[styles.level, { color: theme.colors.gold }]}>
            LEVEL {level}
          </Text>

          {vipTier > 0 && (
            <Text style={styles.vip}>
              ⭐ VIP {vipTier} Bonus Active!
            </Text>
          )}

          <Text style={[styles.msg, { color: theme.colors.text }]}>
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
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },
  level: {
    fontSize: 32,
    fontWeight: "900",
  },
  vip: {
    fontSize: 16,
    color: "#FFD700",
    marginTop: 8,
  },
  msg: {
    fontSize: 22,
    marginTop: 12,
    fontWeight: "700",
  },
  reward: {
    fontSize: 18,
    marginTop: 12,
    color: "#FFD700",
    fontWeight: "800",
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 25,
  },
  buttonTxt: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
});




