import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Text } from "@/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemedAccountModal } from "@/components/account/ThemedAccountModal";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const resendVerificationEmail = useAuthStore((s) => s.resendVerificationEmail);
  const [message, setMessage] = useState("Verification email sent. Check Inbox, Spam, and Promotions.");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const onRefresh = async () => {
    setBusy(true);
    try {
      await refreshUser();
      if (useAuthStore.getState().user?.emailVerified) {
        router.replace("/hub");
      } else {
        setMessage("Still not verified. Open the email link first, then tap I verified again.");
      }
    } catch (e: any) {
      setModal({ title: "Could not check", message: e?.message ?? "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    if (cooldown > 0) {
      setMessage(`Please wait ${cooldown}s before resending. Firebase may throttle repeated emails.`);
      return;
    }

    setBusy(true);
    try {
      await resendVerificationEmail();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setMessage("Verification email requested again. Delivery can take a few minutes. Check Spam and Promotions too.");
    } catch (e: any) {
      setModal({ title: "Email not sent", message: e?.message ?? "Firebase may be throttling verification emails. Wait a few minutes and try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={["#020817", "#051625", "#071A2A"]} style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroGlow} />
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ACCOUNT SECURITY</Text>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelTopLine} />
          <Text style={styles.panelLabel}>VERIFICATION STATUS</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        <Pressable onPress={onRefresh} disabled={busy} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, busy && styles.disabled]}>
          <LinearGradient colors={["#22D3EE", "#0EA5E9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGradient}>
            <Text style={styles.primaryText}>{busy ? "Checking..." : "I verified"}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onResend} disabled={busy || cooldown > 0} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed, (busy || cooldown > 0) && styles.disabled]}>
          <Text style={styles.secondaryText}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}</Text>
        </Pressable>

        <Text style={styles.note}>Repeated taps can make Firebase delay or throttle emails. One resend per minute is safer.</Text>

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
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingTop: 64, paddingBottom: 36 },
  heroGlow: { position: "absolute", top: 40, alignSelf: "center", width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(34,211,238,0.10)" },
  header: { alignItems: "center", marginBottom: 24 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 2.4, color: "#22D3EE" },
  title: { marginTop: 10, fontSize: 28, fontWeight: "900", color: "#F8FAFC", textAlign: "center" },
  subtitle: { marginTop: 8, fontSize: 13, color: "#F6C453", textAlign: "center", fontWeight: "800" },
  panel: { borderRadius: 22, padding: 18, marginBottom: 18, backgroundColor: "rgba(15,23,42,0.88)", borderWidth: 1, borderColor: "rgba(34,211,238,0.22)", shadowColor: "#22D3EE", shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 5, overflow: "hidden" },
  panelTopLine: { position: "absolute", top: 0, left: 20, right: 20, height: 1, backgroundColor: "rgba(246,196,83,0.55)" },
  panelLabel: { marginBottom: 12, fontSize: 10, fontWeight: "900", letterSpacing: 1.3, color: "#F6C453" },
  message: { fontSize: 13, color: "#CBD5E1", textAlign: "center", lineHeight: 20, fontWeight: "700" },
  note: { marginTop: 14, fontSize: 10, color: "#6F7C8E", textAlign: "center", lineHeight: 15 },
  primaryBtn: { borderRadius: 18, overflow: "hidden", shadowColor: "#22D3EE", shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 4 },
  primaryGradient: { paddingVertical: 15, borderRadius: 18 },
  primaryText: { textAlign: "center", fontSize: 14, fontWeight: "900", color: "#03111F" },
  secondaryBtn: { marginTop: 12, paddingVertical: 14, borderRadius: 18, backgroundColor: "rgba(15,23,42,0.88)", borderWidth: 1, borderColor: "rgba(246,196,83,0.38)" },
  secondaryText: { textAlign: "center", fontWeight: "900", color: "#F6C453" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  disabled: { opacity: 0.55 },
});
