import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/theme";

type Action = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
};

type Props = {
  visible: boolean;
  title: string;
  message: string;
  actions: Action[];
};

export function ThemedAccountModal({ visible, title, message, actions }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={actions[0]?.onPress}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            {actions.map((action) => {
              const danger = action.variant === "danger";
              const primary = action.variant === "primary";
              return (
                <Pressable
                  key={action.label}
                  onPress={action.onPress}
                  style={({ pressed }) => [
                    styles.button,
                    primary && styles.primary,
                    danger && styles.danger,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={[styles.buttonText, primary && styles.primaryText, danger && styles.dangerText]}>{action.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(2, 6, 23, 0.84)", alignItems: "center", justifyContent: "center", padding: 22 },
  card: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    backgroundColor: "#101827",
    borderWidth: 1.5,
    borderColor: "rgba(159,231,255,0.28)",
    padding: 22,
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: { fontSize: 21, fontWeight: "900", color: "#F4FAFF", textAlign: "center" },
  message: { marginTop: 10, fontSize: 14, color: "#CBD5E1", textAlign: "center", lineHeight: 21, fontWeight: "700" },
  actions: { marginTop: 20, gap: 10 },
  button: { paddingVertical: 13, paddingHorizontal: 14, borderRadius: 16, backgroundColor: "rgba(27,36,58,0.95)", borderWidth: 1, borderColor: "rgba(159,231,255,0.18)" },
  primary: { backgroundColor: "#00D4FF", borderColor: "#00D4FF" },
  danger: { backgroundColor: "#991B1B", borderColor: "#EF4444" },
  buttonText: { color: "#D8E7FF", fontWeight: "900", textAlign: "center" },
  primaryText: { color: "#07111F" },
  dangerText: { color: "#FFFFFF" },
});
