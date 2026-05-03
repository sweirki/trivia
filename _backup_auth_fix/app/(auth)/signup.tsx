import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { Text } from "@/theme";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export default function SignupScreen() {
  const router = useRouter();
  const { signup, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignup = async () => {
    try {
      await signup(email.trim(), password);
      router.replace("/hub");
    } catch (e) {
      console.log("Signup error", e);
    }
  };

  return (
    <View style={styles.root}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Save your progress and level up across devices
        </Text>
      </View>

      {/* ===== CARD ===== */}
      <View style={styles.card}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#6B7280"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#6B7280"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* ===== PRIMARY BUTTON ===== */}
      <Pressable
        onPress={onSignup}
        disabled={loading}
        style={({ pressed }) => [
          styles.primaryBtn,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={styles.primaryText}>
          {loading ? "Creating…" : "Create account"}
        </Text>
      </Pressable>

      {/* ===== LINK ===== */}
      <Pressable onPress={() => router.replace("/(auth)/login")}>
        <Text style={styles.link}>
          Already have an account? Sign in
        </Text>
      </Pressable>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B1220",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 72,
    alignItems: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#F6C453",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#9AA3B2",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#141C2E",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#24304C",
    marginBottom: 16,
  },

  input: {
    backgroundColor: "#1B243A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#24304C",
    marginBottom: 10,
    fontSize: 13,
  },

  primaryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#F6C453",
  },

  primaryText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: "#0B1220",
  },

  link: {
    marginTop: 10,
    fontSize: 11,
    color: "#9AA3B2",
    textAlign: "center",
  },
});
