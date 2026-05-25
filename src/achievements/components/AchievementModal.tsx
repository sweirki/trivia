import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  visible: boolean;
  achievement: {
    id: string;
    title?: string;
    name?: string;
    description?: string;
  } | null;
  onClose: () => void;
};

export default function AchievementModal({ visible, achievement, onClose }: Props) {
  if (!visible || !achievement) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(14,32,58,0.98)", "rgba(7,17,31,0.98)", "rgba(5,10,20,0.99)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(159,231,255,0.18)", "rgba(255,214,110,0.08)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.topGlow} />
          <Text style={styles.kicker}>ACHIEVEMENT UNLOCKED</Text>
          <Text style={styles.title}>{achievement.title ?? achievement.name ?? "Achievement"}</Text>
          <Text style={styles.desc}>{achievement.description ?? "You unlocked a new achievement."}</Text>

          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    padding: 24,
    alignItems: "center",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.24)",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: "rgba(255,214,110,0.82)",
  },
  kicker: {
    color: "#9FE7FF",
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  title: {
    color: "#F4FAFF",
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.25,
    textAlign: "center",
  },
  desc: {
    color: "#BBD7FF",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    minWidth: 142,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "rgba(255,214,110,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.42)",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFD66E",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
});


