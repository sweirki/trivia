import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemedAlert } from "@/components/ThemedAlert";
import { captureError, trackEvent } from "@/observability";

export default function ForgotScreen() {
  const router = useRouter();
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { showThemedAlert, themedAlert } = useThemedAlert();

  const onReset = async () => {
    void trackEvent("auth_password_reset_started");
    if (!email.trim()) {
      showThemedAlert("Missing email", "Enter your account email.", "warning");
      return;
    }

    try {
      await resetPassword(email);
      void trackEvent("auth_password_reset_sent");
      setSent(true);
    } catch (e: any) {
      void trackEvent("auth_password_reset_failed", { message: e?.message ?? "unknown" });
      void captureError(e, { screen: "forgot_password" });
      showThemedAlert("Reset failed", e?.message ?? "Please try again.", "danger");
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>We will send a secure reset link</Text>
      </View>

      <View style={styles.card}>
        <TextInput placeholder="Email" placeholderTextColor="#6B7280" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      </View>

      <Pressable onPress={onReset} style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}>
        <Text style={styles.primaryText}>Send reset link</Text>
      </Pressable>

      {sent && <Text style={styles.success}>Check your email for the reset link.</Text>}
      <Pressable onPress={() => router.replace("/(auth)/login")}><Text style={styles.link}>Back to sign in</Text></Pressable>
      {themedAlert}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B1220", paddingHorizontal: 20 },
  header: { marginTop: 72, alignItems: "center", marginBottom: 28 },
  title: { fontSize: 19, fontWeight: "800", color: "#F6C453" },
  subtitle: { marginTop: 4, fontSize: 11, color: "#9AA3B2", textAlign: "center" },
  card: { backgroundColor: "#141C2E", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#24304C", marginBottom: 16 },
  input: { backgroundColor: "#1B243A", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, color: "#FFFFFF", borderWidth: 1, borderColor: "#24304C", fontSize: 13 },
  primaryBtn: { marginTop: 4, paddingVertical: 12, borderRadius: 16, backgroundColor: "#F6C453" },
  primaryText: { textAlign: "center", fontSize: 14, fontWeight: "800", color: "#0B1220" },
  success: { marginTop: 10, fontSize: 11, color: "#9AA3B2", textAlign: "center" },
  link: { marginTop: 10, fontSize: 11, color: "#9AA3B2", textAlign: "center" },
});

