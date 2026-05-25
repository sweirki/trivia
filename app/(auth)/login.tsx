import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemedAlert } from "@/components/ThemedAlert";
import { captureError, trackEvent } from "@/observability";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showThemedAlert, themedAlert } = useThemedAlert();

  const onLogin = async () => {
    void trackEvent("auth_login_started");
    if (!email.trim() || !password) {
      showThemedAlert("Missing details", "Enter your email and password.", "warning");
      return;
    }

    try {
      await login(email, password);
      void trackEvent("auth_login_succeeded");
      router.replace("/hub");
    } catch (e: any) {
      void trackEvent("auth_login_failed", { message: e?.message ?? "unknown" });
      void captureError(e, { screen: "login" });
      showThemedAlert("Sign in failed", e?.message ?? "Please check your details and try again.", "danger");
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your progress</Text>
      </View>

      <View style={styles.card}>
        <TextInput placeholder="Email" placeholderTextColor="#6B7280" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput placeholder="Password" placeholderTextColor="#6B7280" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      </View>

      <Pressable onPress={onLogin} disabled={loading} style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}>
        <Text style={styles.primaryText}>{loading ? "Signing in..." : "Sign in"}</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/forgot")}><Text style={styles.link}>Forgot password?</Text></Pressable>
      <Pressable onPress={() => router.replace("/(auth)/signup")}><Text style={styles.link}>Create an account</Text></Pressable>
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
  input: { backgroundColor: "#1B243A", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, color: "#FFFFFF", borderWidth: 1, borderColor: "#24304C", marginBottom: 10, fontSize: 13 },
  primaryBtn: { marginTop: 4, paddingVertical: 12, borderRadius: 16, backgroundColor: "#F6C453" },
  primaryText: { textAlign: "center", fontSize: 14, fontWeight: "800", color: "#0B1220" },
  link: { marginTop: 10, fontSize: 11, color: "#9AA3B2", textAlign: "center" },
});



