import React, { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/theme";

type AlertTone = "info" | "success" | "warning" | "danger";

type AlertState = {
  title: string;
  message: string;
  tone: AlertTone;
  buttonLabel: string;
};

type ThemedAlertModalProps = AlertState & {
  visible: boolean;
  onClose: () => void;
};

const toneCopy: Record<AlertTone, { icon: string; label: string; border: string }> = {
  info: { icon: "✨", label: "Notice", border: "#F6C453" },
  success: { icon: "🏆", label: "Success", border: "#22C55E" },
  warning: { icon: "🎟️", label: "Action Needed", border: "#F59E0B" },
  danger: { icon: "⚠️", label: "Problem", border: "#EF4444" },
};

export function ThemedAlertModal({
  visible,
  title,
  message,
  tone,
  buttonLabel,
  onClose,
}: ThemedAlertModalProps) {
  const toneStyle = toneCopy[tone] ?? toneCopy.info;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { borderColor: toneStyle.border }]}>
          <Text style={styles.icon}>{toneStyle.icon}</Text>
          <Text style={styles.kicker}>{toneStyle.label}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onClose}>
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function useThemedAlert() {
  const [alertState, setAlertState] = useState<AlertState | null>(null);

  const showThemedAlert = useCallback(
    (title: string, message: string, tone: AlertTone = "info", buttonLabel = "OK") => {
      setAlertState({ title, message, tone, buttonLabel });
    },
    []
  );

  const closeThemedAlert = useCallback(() => {
    setAlertState(null);
  }, []);

  const themedAlert = useMemo(
    () => (
      <ThemedAlertModal
        visible={!!alertState}
        title={alertState?.title ?? ""}
        message={alertState?.message ?? ""}
        tone={alertState?.tone ?? "info"}
        buttonLabel={alertState?.buttonLabel ?? "OK"}
        onClose={closeThemedAlert}
      />
    ),
    [alertState, closeThemedAlert]
  );

  return { showThemedAlert, themedAlert };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  card: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 26,
    backgroundColor: "#101827",
    borderWidth: 1.5,
    padding: 22,
    shadowColor: "#F6C453",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  icon: {
    fontSize: 34,
    textAlign: "center",
    marginBottom: 8,
  },
  kicker: {
    color: "#F6C453",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    textAlign: "center",
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },
  message: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#F6C453",
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.86,
  },
  buttonText: {
    color: "#07111F",
    fontSize: 14,
    fontWeight: "900",
  },
});



