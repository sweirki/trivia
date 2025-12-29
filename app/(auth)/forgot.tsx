import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Text } from "@/theme";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
export default function ForgotScreen() {
  const router = useRouter();
  const { resetPassword } = useAuthStore();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onReset = async () => {
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e) {
      console.log("Reset error", e);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Reset password</Text>
      <Text style={styles.subtitle}>
        Enter your email to receive a reset link.
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#777"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={onReset}>
        <Text style={styles.primaryText}>Send reset link</Text>
      </TouchableOpacity>

      {sent && (
        <Text style={{ color: "#FBECC5", marginTop: 10 }}>
          Check your email for the reset link.
        </Text>
      )}

      <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
        <Text style={styles.link}>Back to login</Text>
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
    fontSize: 26,
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
    marginTop: 4,
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


