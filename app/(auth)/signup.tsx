import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
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
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Start saving your progress in the cloud</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#777"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#777"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={onSignup} disabled={loading}>
        <Text style={styles.primaryText}>
          {loading ? "Creating..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 22,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FBECC5",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#D8C7A0",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: "#fff",
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 14,
  },
  primaryBtn: {
    backgroundColor: "#FFD775",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  primaryText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  link: {
    color: "#FBECC5",
    marginTop: 8,
    fontSize: 14,
  },
});


