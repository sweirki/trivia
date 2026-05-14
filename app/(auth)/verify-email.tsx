import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
    <View style={styles.root}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>{user?.email}</Text>
      <Text style={styles.message}>{message}</Text>

      <Pressable onPress={onRefresh} disabled={busy} style={styles.primaryBtn}>
        <Text style={styles.primaryText}>{busy ? "Checking..." : "I verified"}</Text>
      </Pressable>

      <Pressable onPress={onResend} disabled={busy || cooldown > 0} style={[styles.secondaryBtn, (busy || cooldown > 0) && styles.disabledBtn]}>
        <Text style={styles.secondaryText}>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}</Text>
      </Pressable>

      <Text style={styles.note}>Repeated taps can make Firebase delay or throttle emails. One resend per minute is safer.</Text>

      <ThemedAccountModal
        visible={modal !== null}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        actions={[{ label: "OK", variant: "primary", onPress: () => setModal(null) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B1220", padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", color: "#F6C453", textAlign: "center" },
  subtitle: { marginTop: 8, fontSize: 13, color: "#FFFFFF", textAlign: "center" },
  message: { marginTop: 16, fontSize: 12, color: "#CBD5E1", textAlign: "center", lineHeight: 18 },
  note: { marginTop: 12, fontSize: 10, color: "#64748B", textAlign: "center", lineHeight: 15 },
  primaryBtn: { marginTop: 24, paddingVertical: 13, borderRadius: 16, backgroundColor: "#F6C453" },
  primaryText: { textAlign: "center", fontWeight: "800", color: "#0B1220" },
  secondaryBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 16, backgroundColor: "#1B243A", borderWidth: 1, borderColor: "#24304C" },
  disabledBtn: { opacity: 0.55 },
  secondaryText: { textAlign: "center", fontWeight: "700", color: "#F6C453" },
});

