import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/theme";

type Props = {
  visible: boolean;
  achievement: {
    id: string;
    name?: string;
    description?: string;
  } | null;
  onClose: () => void;
};

export default function AchievementModal({
  visible,
  achievement,
  onClose,
}: Props) {
  const theme = useTheme();

  if (!visible || !achievement) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.title, { color: theme.colors.gold }]}>
            {achievement.name ?? "Achievement Unlocked"}
          </Text>

          <Text style={[styles.desc, { color: theme.colors.textMuted }]}>
            {achievement.description ?? "You unlocked a new achievement."}
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  desc: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    fontWeight: "700",
    color: "#000",
    fontSize: 16,
  },
});


