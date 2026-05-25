import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { AVATARS } from "@/identity/avatars/avatarDefinitions";
import { ThemedAccountModal } from "@/components/account/ThemedAccountModal";
import { captureError, trackEvent } from "@/observability";

export default function SignupScreen() {
  const router = useRouter();
  const { signup, loading } = useAuthStore();
  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState(AVATARS[0]?.id ?? "avatar_01");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);

  const onSignup = async () => {
    void trackEvent("auth_signup_started");
    const cleanEmail = email.trim();
    const cleanName = displayName.trim();

    if (!cleanName || !cleanEmail || password.length < 6) {
      setModal({ title: "Check details", message: "Add a name, a valid email, and a password of at least 6 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setModal({ title: "Passwords do not match", message: "Please re-enter the password confirmation so both passwords are exactly the same." });
      return;
    }

    try {
      await signup(cleanEmail, password, cleanName, avatarId);
      void trackEvent("auth_signup_succeeded");
      router.replace("/(auth)/verify-email");
    } catch (e: any) {
      void trackEvent("auth_signup_failed", { message: e?.message ?? "unknown" });
      void captureError(e, { screen: "signup" });
      setModal({ title: "Account creation failed", message: e?.message ?? "Please try again." });
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Choose your name and avatar</Text>
      </View>

      <View style={styles.avatarGrid}>
        {AVATARS.map((avatar) => {
          const selected = avatar.id === avatarId;
          return (
            <Pressable key={avatar.id} onPress={() => setAvatarId(avatar.id)} style={[styles.avatarCard, selected && styles.avatarSelected]}>
              <Image source={avatar.asset} style={styles.avatar} />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.card}>
        <TextInput placeholder="Player name" placeholderTextColor="#6B7280" style={styles.input} maxLength={16} value={displayName} onChangeText={setDisplayName} />
        <TextInput placeholder="Email" placeholderTextColor="#6B7280" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput placeholder="Password" placeholderTextColor="#6B7280" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput placeholder="Confirm password" placeholderTextColor="#6B7280" style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      </View>

      <Pressable onPress={onSignup} disabled={loading} style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}>
        <Text style={styles.primaryText}>{loading ? "Creating..." : "Create account"}</Text>
      </Pressable>

      <Pressable onPress={() => router.replace("/(auth)/login")}><Text style={styles.link}>Already have an account? Sign in</Text></Pressable>

      <ThemedAccountModal
        visible={modal !== null}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        actions={[{ label: "OK", variant: "primary", onPress: () => setModal(null) }]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B1220" },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  header: { marginTop: 72, alignItems: "center", marginBottom: 22 },
  title: { fontSize: 19, fontWeight: "800", color: "#F6C453" },
  subtitle: { marginTop: 4, fontSize: 11, color: "#9AA3B2", textAlign: "center" },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 16 },
  avatarCard: { width: 58, height: 58, borderRadius: 16, backgroundColor: "#141C2E", borderWidth: 1, borderColor: "#24304C", alignItems: "center", justifyContent: "center" },
  avatarSelected: { borderColor: "#F6C453", borderWidth: 2 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  card: { backgroundColor: "#141C2E", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#24304C", marginBottom: 16 },
  input: { backgroundColor: "#1B243A", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, color: "#FFFFFF", borderWidth: 1, borderColor: "#24304C", marginBottom: 10, fontSize: 13 },
  primaryBtn: { marginTop: 4, paddingVertical: 12, borderRadius: 16, backgroundColor: "#F6C453" },
  primaryText: { textAlign: "center", fontSize: 14, fontWeight: "800", color: "#0B1220" },
  link: { marginTop: 12, fontSize: 11, color: "#9AA3B2", textAlign: "center" },
});



