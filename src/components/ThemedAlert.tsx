import React, { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/theme";

type AlertTone = "info" | "success" | "warning" | "danger" | "error";

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

type ToneStyle = {
  icon: string;
  label: string;
  accent: string;
  glow: string;
  button: readonly [string, string];
};

const toneCopy: Record<AlertTone, ToneStyle> = {
  info: {
    icon: "✦",
    label: "Arena Notice",
    accent: "#24D7FF",
    glow: "rgba(36, 215, 255, 0.34)",
    button: ["#31E7FF", "#0EA5E9"],
  },
  success: {
    icon: "◆",
    label: "Arena Secured",
    accent: "#F7D36A",
    glow: "rgba(247, 211, 106, 0.34)",
    button: ["#FFE082", "#D6A93A"],
  },
  warning: {
    icon: "▲",
    label: "Arena Required",
    accent: "#F7D36A",
    glow: "rgba(247, 211, 106, 0.3)",
    button: ["#FFE082", "#D6A93A"],
  },
  danger: {
    icon: "!",
    label: "Arena Alert",
    accent: "#FB7185",
    glow: "rgba(251, 113, 133, 0.3)",
    button: ["#FB7185", "#E11D48"],
  },
  error: {
    icon: "!",
    label: "Arena Alert",
    accent: "#FB7185",
    glow: "rgba(251, 113, 133, 0.3)",
    button: ["#FB7185", "#E11D48"],
  },
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
        <View style={[styles.outerGlow, { borderColor: toneStyle.accent, shadowColor: toneStyle.accent }]}>
          <LinearGradient
            colors={["rgba(12, 27, 58, 0.98)", "rgba(5, 10, 27, 0.98)", "rgba(10, 20, 43, 0.98)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={[styles.topGlow, { backgroundColor: toneStyle.glow }]} />

            <View style={[styles.iconRing, { borderColor: toneStyle.accent, shadowColor: toneStyle.accent }]}>
              <Text style={[styles.icon, { color: toneStyle.accent }]}>{toneStyle.icon}</Text>
            </View>

            <Text style={[styles.kicker, { color: toneStyle.accent }]}>{toneStyle.label}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <Pressable style={({ pressed }) => [styles.buttonWrap, pressed && styles.pressed]} onPress={onClose}>
              <LinearGradient
                colors={toneStyle.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{buttonLabel}</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
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
    backgroundColor: "rgba(1, 6, 20, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  outerGlow: {
    width: "100%",
    maxWidth: 392,
    borderRadius: 28,
    borderWidth: 1.5,
    shadowOpacity: 0.42,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
    backgroundColor: "rgba(3, 10, 26, 0.98)",
  },
  card: {
    overflow: "hidden",
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
  },
  topGlow: {
    position: "absolute",
    top: -66,
    alignSelf: "center",
    width: 210,
    height: 132,
    borderRadius: 120,
    opacity: 0.95,
  },
  iconRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "rgba(2, 8, 23, 0.68)",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  icon: {
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 31,
  },
  kicker: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1.8,
    textAlign: "center",
    textTransform: "uppercase",
    marginTop: 14,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 9,
  },
  message: {
    color: "#CBD5E1",
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },
  buttonWrap: {
    marginTop: 22,
    borderRadius: 17,
    overflow: "hidden",
  },
  button: {
    borderRadius: 17,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: "#03111F",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
