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
  overlay: { flex: 1, backgroundColor: "rgba(2, 6, 23, 0.78)", alignItems: "center", justifyContent: "center", padding: 22 },
  card: { width: "100%", maxWidth: 380, borderRadius: 22, backgroundColor: "#101827", borderWidth: 1, borderColor: "#2B3654", padding: 18 },
  title: { fontSize: 18, fontWeight: "900", color: "#F6C453", textAlign: "center" },
  message: { marginTop: 10, fontSize: 13, color: "#CBD5E1", textAlign: "center", lineHeight: 19 },
  actions: { marginTop: 18, gap: 10 },
  button: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 15, backgroundColor: "#1B243A", borderWidth: 1, borderColor: "#2B3654" },
  primary: { backgroundColor: "#F6C453", borderColor: "#F6C453" },
  danger: { backgroundColor: "#991B1B", borderColor: "#B91C1C" },
  buttonText: { color: "#F6C453", fontWeight: "800", textAlign: "center" },
  primaryText: { color: "#07111F" },
  dangerText: { color: "#FFFFFF" },
});



