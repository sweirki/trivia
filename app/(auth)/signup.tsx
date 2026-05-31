import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    <LinearGradient colors={["#020817", "#051625", "#071A2A"]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.heroGlow} />
        <View style={styles.header}>
          <Text style={styles.eyebrow}>NEW PLAYER</Text>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Choose your identity and start building your season profile.</Text>
        </View>

        <View style={styles.avatarSection}>
          <Text style={styles.panelLabel}>CHOOSE AVATAR</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((avatar) => {
              const selected = avatar.id === avatarId;
              return (
                <Pressable key={avatar.id} onPress={() => setAvatarId(avatar.id)} style={[styles.avatarCard, selected && styles.avatarSelected]}>
                  {selected && <View style={styles.avatarGlow} />}
                  <Image source={avatar.asset} style={styles.avatar} />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTopLine} />
          <Text style={styles.panelLabel}>ACCOUNT DETAILS</Text>
          <TextInput placeholder="Player name" placeholderTextColor="#6F7C8E" style={styles.input} maxLength={16} value={displayName} onChangeText={setDisplayName} />
          <TextInput placeholder="Email" placeholderTextColor="#6F7C8E" style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput placeholder="Password" placeholderTextColor="#6F7C8E" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
          <TextInput placeholder="Confirm password" placeholderTextColor="#6F7C8E" style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>

        <Pressable onPress={onSignup} disabled={loading} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, loading && styles.disabled]}>
          <LinearGradient colors={["#22D3EE", "#0EA5E9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGradient}>
            <Text style={styles.primaryText}>{loading ? "Creating..." : "Create account"}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => router.replace("/(auth)/login")} style={styles.linkHit}><Text style={styles.link}>Already have an account? <Text style={styles.linkStrong}>Sign in</Text></Text></Pressable>

        <ThemedAccountModal
          visible={modal !== null}
          title={modal?.title ?? ""}
          message={modal?.message ?? ""}
          actions={[{ label: "OK", variant: "primary", onPress: () => setModal(null) }]}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 36 },
  heroGlow: { position: "absolute", top: -90, alignSelf: "center", width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(34,211,238,0.10)" },
  header: { alignItems: "center", marginBottom: 22 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 2.4, color: "#22D3EE" },
  title: { marginTop: 10, fontSize: 28, fontWeight: "900", color: "#F8FAFC", textAlign: "center" },
  subtitle: { marginTop: 8, fontSize: 12, color: "#A7B4C5", textAlign: "center", lineHeight: 18 },
  avatarSection: { marginBottom: 16, borderRadius: 22, padding: 14, backgroundColor: "rgba(15,23,42,0.72)", borderWidth: 1, borderColor: "rgba(34,211,238,0.18)" },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  avatarCard: { width: 60, height: 60, borderRadius: 18, backgroundColor: "rgba(20,30,52,0.96)", borderWidth: 1, borderColor: "rgba(148,163,184,0.18)", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarSelected: { borderColor: "#22D3EE", borderWidth: 2, shadowColor: "#22D3EE", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  avatarGlow: { position: "absolute", width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(34,211,238,0.16)" },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  panel: { borderRadius: 22, padding: 16, marginBottom: 18, backgroundColor: "rgba(15,23,42,0.88)", borderWidth: 1, borderColor: "rgba(34,211,238,0.22)", shadowColor: "#22D3EE", shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 5, overflow: "hidden" },
  panelTopLine: { position: "absolute", top: 0, left: 20, right: 20, height: 1, backgroundColor: "rgba(246,196,83,0.55)" },
  panelLabel: { marginBottom: 12, fontSize: 10, fontWeight: "900", letterSpacing: 1.3, color: "#F6C453" },
  input: { minHeight: 48, backgroundColor: "rgba(20,30,52,0.96)", borderRadius: 15, paddingVertical: 12, paddingHorizontal: 14, color: "#FFFFFF", borderWidth: 1, borderColor: "rgba(148,163,184,0.18)", marginBottom: 10, fontSize: 14, fontWeight: "700" },
  primaryBtn: { borderRadius: 18, overflow: "hidden", shadowColor: "#22D3EE", shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 4 },
  primaryGradient: { paddingVertical: 15, borderRadius: 18 },
  primaryText: { textAlign: "center", fontSize: 14, fontWeight: "900", color: "#03111F" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  disabled: { opacity: 0.65 },
  linkHit: { paddingTop: 16 },
  link: { fontSize: 12, color: "#A7B4C5", textAlign: "center", fontWeight: "700" },
  linkStrong: { color: "#F6C453", fontWeight: "900" },
});
