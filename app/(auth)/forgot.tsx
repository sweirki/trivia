import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    <LinearGradient colors={["#020817", "#051625", "#071A2A"]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.heroGlow} />
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SECURE ACCOUNT</Text>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>We will send a secure reset link to your account email.</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTopLine} />
          <Text style={styles.panelLabel}>RESET LINK</Text>
          <TextInput placeholder="Email" placeholderTextColor="#6F7C8E" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        </View>

        <Pressable onPress={onReset} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
          <LinearGradient colors={["#22D3EE", "#0EA5E9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGradient}>
            <Text style={styles.primaryText}>Send reset link</Text>
          </LinearGradient>
        </Pressable>

        {sent && <Text style={styles.success}>Check your email for the reset link.</Text>}
        <Pressable onPress={() => router.replace("/(auth)/login")} style={styles.linkHit}><Text style={styles.link}>Back to sign in</Text></Pressable>
      </ScrollView>
      {themedAlert}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 72, paddingBottom: 36 },
  heroGlow: { position: "absolute", top: -80, alignSelf: "center", width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(34,211,238,0.10)" },
  header: { alignItems: "center", marginBottom: 28 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 2.4, color: "#22D3EE" },
  title: { marginTop: 10, fontSize: 28, fontWeight: "900", color: "#F8FAFC", textAlign: "center" },
  subtitle: { marginTop: 8, fontSize: 12, color: "#A7B4C5", textAlign: "center", lineHeight: 18 },
  panel: { borderRadius: 22, padding: 16, marginBottom: 18, backgroundColor: "rgba(15,23,42,0.88)", borderWidth: 1, borderColor: "rgba(34,211,238,0.22)", shadowColor: "#22D3EE", shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 5, overflow: "hidden" },
  panelTopLine: { position: "absolute", top: 0, left: 20, right: 20, height: 1, backgroundColor: "rgba(246,196,83,0.55)" },
  panelLabel: { marginBottom: 12, fontSize: 10, fontWeight: "900", letterSpacing: 1.3, color: "#F6C453" },
  input: { minHeight: 48, backgroundColor: "rgba(20,30,52,0.96)", borderRadius: 15, paddingVertical: 12, paddingHorizontal: 14, color: "#FFFFFF", borderWidth: 1, borderColor: "rgba(148,163,184,0.18)", fontSize: 14, fontWeight: "700" },
  primaryBtn: { borderRadius: 18, overflow: "hidden", shadowColor: "#22D3EE", shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 4 },
  primaryGradient: { paddingVertical: 15, borderRadius: 18 },
  primaryText: { textAlign: "center", fontSize: 14, fontWeight: "900", color: "#03111F" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  success: { marginTop: 14, fontSize: 12, color: "#3DDC97", textAlign: "center", fontWeight: "800" },
  linkHit: { paddingTop: 16 },
  link: { fontSize: 12, color: "#A7B4C5", textAlign: "center", fontWeight: "700" },
});
