import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { Text, useTheme } from "@/theme";
import PrimaryButton from "@/components/PrimaryButton";
import ScreenShell from "@/components/ScreenShell";
import SectionHeader from "@/components/SectionHeader";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemedAccountModal } from "@/components/account/ThemedAccountModal";
import { useSettingsStore } from "@/store/useSettingsStore";

const SETTINGS_ART = require("../../../assets/images/lobby/settings_card_art.webp");
const HERO_ART = require("../../../assets/images/lobby/lobby_hero_banner.webp");

type SettingRowProps = {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
  accent?: "blue" | "gold" | "violet";
};

function SettingRow({
  title,
  subtitle,
  value,
  onChange,
  accent = "blue",
}: SettingRowProps) {
  const accentColor =
    accent === "gold" ? "#FFD66E" : accent === "violet" ? "#B88DFF" : "#9FE7FF";

  return (
    <View style={styles.settingRow}>
      <View style={[styles.rowSignal, { backgroundColor: accentColor }]} />
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSub}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "rgba(126,142,167,0.22)", true: "rgba(159,231,255,0.38)" }}
        thumbColor={value ? accentColor : "#7E8EA7"}
        ios_backgroundColor="rgba(126,142,167,0.22)"
      />
    </View>
  );
}

function SettingsPanel({
  title,
  subtitle,
  children,
  tone = "blue",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  tone?: "blue" | "gold" | "danger";
}) {
  const borderColor =
    tone === "gold"
      ? "rgba(255,214,110,0.24)"
      : tone === "danger"
        ? "rgba(255,108,108,0.28)"
        : "rgba(119,174,255,0.18)";
  const glowColor =
    tone === "gold"
      ? "rgba(255,214,110,0.76)"
      : tone === "danger"
        ? "rgba(255,108,108,0.7)"
        : "rgba(159,231,255,0.72)";

  return (
    <View style={[styles.panel, { borderColor }]}>
      <View style={[styles.panelGlow, { backgroundColor: glowColor }]} />
      <SectionHeader title={title} subtitle={subtitle} />
      {children}
    </View>
  );
}

function InfoTile({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.infoTile}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoBody}>{body}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const resendVerificationEmail = useAuthStore((s) => s.resendVerificationEmail);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const soundEffects = useSettingsStore((s) => s.soundEffects);
  const setSoundEffects = useSettingsStore((s) => s.setSoundEffects);
  const music = useSettingsStore((s) => s.music);
  const setMusic = useSettingsStore((s) => s.setMusic);
  const vibration = useSettingsStore((s) => s.vibration);
  const setVibration = useSettingsStore((s) => s.setVibration);
  const notifications = useSettingsStore((s) => s.notifications);
  const setNotifications = useSettingsStore((s) => s.setNotifications);
  const friendRequests = useSettingsStore((s) => s.friendRequests);
  const setFriendRequests = useSettingsStore((s) => s.setFriendRequests);
  const challengeAlerts = useSettingsStore((s) => s.challengeAlerts);
  const setChallengeAlerts = useSettingsStore((s) => s.setChallengeAlerts);

  const [deletePassword, setDeletePassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    danger?: boolean;
    confirmDelete?: boolean;
  } | null>(null);

  const onLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const onDeleteAccount = () => {
    if (!deletePassword) {
      setModal({
        title: "Password required",
        message: "Enter your password before deleting the account.",
      });
      return;
    }

    setModal({
      title: "Delete account?",
      message: "This permanently removes your account, social profile, and cloud progress.",
      danger: true,
      confirmDelete: true,
    });
  };

  const confirmDelete = async () => {
    setModal(null);
    setBusy(true);

    try {
      await deleteAccount(deletePassword);
      router.replace("/(auth)/signup");
    } catch (e: unknown) {
      setModal({
        title: "Delete failed",
        message: e instanceof Error ? e.message : "Please try again later.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenShell accessibilityLabel="Settings screen" contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>SYSTEM CONTROL</Text>
        <Text style={[theme.typography.h1, styles.title]}>Settings</Text>
        <Text style={styles.sub}>Tune your Arena experience, identity, notifications, and account safety.</Text>
      </View>

      <View style={styles.heroCard}>
        <Image source={SETTINGS_ART} style={styles.heroArt} resizeMode="cover" />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(2,6,14,0.82)", "rgba(2,6,14,0.34)", "rgba(2,6,14,0.06)"]}
          locations={[0, 0.48, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(159,231,255,0.17)", "rgba(255,214,110,0.07)", "rgba(0,0,0,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>PLAYER CONFIG</Text>
          <Text style={styles.heroTitle}>Make the game feel yours</Text>
          <Text style={styles.heroText}>Audio, haptics, social alerts, cloud profile, and safety controls in one place.</Text>
        </View>
      </View>

      <SettingsPanel title="Gameplay & Audio" subtitle="Feedback, rhythm, and feel.">
        <SettingRow
          title="Sound Effects"
          subtitle="Correct answers, buttons, and gameplay feedback."
          value={soundEffects}
          onChange={setSoundEffects}
        />
        <SettingRow
          title="Background Music"
          subtitle="Ambient lobby and gameplay music."
          value={music}
          onChange={setMusic}
          accent="gold"
        />
        <SettingRow
          title="Vibration Feedback"
          subtitle="Haptics for wins, streaks, and interactions."
          value={vibration}
          onChange={setVibration}
          accent="violet"
        />
      </SettingsPanel>

      <SettingsPanel title="Notifications & Social" subtitle="Challenge and friend activity.">
        <SettingRow
          title="Notifications"
          subtitle="Challenge alerts and future push notifications."
          value={notifications}
          onChange={setNotifications}
        />
        <SettingRow
          title="Friend Requests"
          subtitle="Receive social invites and friend requests."
          value={friendRequests}
          onChange={setFriendRequests}
          accent="gold"
        />
        <SettingRow
          title="Challenge Alerts"
          subtitle="Get notified when friends challenge you."
          value={challengeAlerts}
          onChange={setChallengeAlerts}
          accent="violet"
        />
        <Text style={styles.noteText}>Native push notifications require a development build and are limited inside Expo Go.</Text>
      </SettingsPanel>

      <SettingsPanel title="Account & Identity" subtitle="Profile, friends, and sign-in." tone="gold">
        {user ? (
          <>
            <View style={styles.accountBox}>
              <Text style={styles.accountLabel}>SIGNED IN AS</Text>
              <Text style={styles.accountEmail} numberOfLines={1}>{user.email}</Text>
              <Text style={styles.accountState}>{user.emailVerified ? "Verified account" : "Email not verified"}</Text>
            </View>

            {!user.emailVerified && (
              <>
                <PrimaryButton
                  title="Resend Verification Email"
                  variant="secondary"
                  onPress={async () => {
                    try {
                      await resendVerificationEmail();
                      setModal({
                        title: "Verification sent",
                        message: "A verification email was requested successfully.",
                      });
                    } catch (e: unknown) {
                      setModal({
                        title: "Failed",
                        message: e instanceof Error ? e.message : "Could not send verification.",
                      });
                    }
                  }}
                  style={styles.button}
                />

                <PrimaryButton
                  title="Refresh Verification Status"
                  variant="secondary"
                  onPress={async () => {
                    await refreshUser();
                    setModal({
                      title: "Verification Status",
                      message: useAuthStore.getState().user?.emailVerified
                        ? "Email is verified."
                        : "Email is still not verified.",
                    });
                  }}
                  style={styles.button}
                />
              </>
            )}

            <View style={styles.actionRow}>
              <Pressable
                onPress={() => router.push("/identity")}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              >
                <Text style={styles.actionButtonTitle}>Edit Identity</Text>
                <Text style={styles.actionButtonSub}>Name & avatar</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/friends")}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
              >
                <Text style={styles.actionButtonTitle}>Friends</Text>
                <Text style={styles.actionButtonSub}>Social hub</Text>
              </Pressable>
            </View>

            <PrimaryButton title="Log Out" variant="ghost" onPress={onLogout} style={styles.button} />
          </>
        ) : (
          <PrimaryButton title="Sign In / Create Account" onPress={() => router.push("/(auth)/login")} style={styles.button} />
        )}
      </SettingsPanel>

      <SettingsPanel title="Data & Storage" subtitle="Cloud and local progress.">
        <View style={styles.tileGrid}>
          <InfoTile
            title="Cloud Sync"
            body="Friends, challenges, progression, and rankings sync online through Firebase."
          />
          <InfoTile
            title="Guest Progress"
            body="Guest progress is stored locally and may be lost if the app is removed."
          />
        </View>
      </SettingsPanel>

      <View style={styles.statusStrip}>
        <Image source={HERO_ART} style={styles.statusArt} resizeMode="cover" />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(2,6,14,0.88)", "rgba(2,6,14,0.55)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.statusCopy}>
          <Text style={styles.statusLabel}>APP BUILD</Text>
          <Text style={styles.statusTitle}>Version 1.0 Production Candidate</Text>
          <Pressable
            onPress={() => router.push("/help")}
            style={({ pressed }) => [styles.supportButton, pressed && styles.pressed]}
          >
            <Text style={styles.supportButtonText}>Open Help & Support</Text>
          </Pressable>
        </View>
      </View>

      {user && (
        <SettingsPanel
          title="Danger Zone"
          subtitle="Permanently remove your account and cloud profile."
          tone="danger"
        >
          <TextInput
            value={deletePassword}
            onChangeText={setDeletePassword}
            secureTextEntry
            placeholder="Confirm password"
            placeholderTextColor="#7E8EA7"
            style={styles.input}
          />

          <PrimaryButton
            title={busy ? "Working..." : "Delete My Account"}
            variant="danger"
            loading={busy}
            onPress={onDeleteAccount}
            style={styles.button}
          />
        </SettingsPanel>
      )}

      <ThemedAccountModal
        visible={modal !== null}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        actions={
          modal?.confirmDelete
            ? [
                {
                  label: "Cancel",
                  variant: "secondary",
                  onPress: () => setModal(null),
                },
                {
                  label: "Delete Permanently",
                  variant: "danger",
                  onPress: confirmDelete,
                },
              ]
            : [
                {
                  label: "OK",
                  variant: "primary",
                  onPress: () => setModal(null),
                },
              ]
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    paddingBottom: 58,
  },
  header: {
    marginBottom: 14,
  },
  kicker: {
    color: "#7E8EA7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 4,
  },
  title: {
    color: "#F4FAFF",
    letterSpacing: -0.35,
  },
  sub: {
    color: "#9FE7FF",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    marginTop: 3,
    maxWidth: "90%",
  },
  heroCard: {
    minHeight: 150,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.28)",
    marginBottom: 14,
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.18,
    shadowRadius: 17,
    shadowOffset: { width: 0, height: 9 },
    elevation: 7,
  },
  heroArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.96,
  },
  heroCopy: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    maxWidth: "78%",
  },
  heroLabel: {
    color: "#9FE7FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  heroTitle: {
    color: "#F4FAFF",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.25,
    marginTop: 6,
    textShadowColor: "rgba(0,0,0,0.92)",
    textShadowRadius: 9,
  },
  heroText: {
    color: "#D8E7FF",
    fontSize: 11.5,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },
  panel: {
    backgroundColor: "rgba(8,17,31,0.9)",
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  panelGlow: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(159,231,255,0.11)",
    paddingVertical: 11,
  },
  rowSignal: {
    width: 4,
    height: 34,
    borderRadius: 999,
    marginRight: 11,
    opacity: 0.84,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    color: "#F4FAFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: -0.1,
  },
  settingSub: {
    color: "#8FA4BE",
    fontSize: 10.5,
    fontWeight: "700",
    lineHeight: 15,
    marginTop: 3,
  },
  noteText: {
    color: "#7E8EA7",
    fontSize: 10.5,
    fontWeight: "700",
    lineHeight: 16,
    paddingVertical: 10,
  },
  accountBox: {
    backgroundColor: "rgba(255,214,110,0.08)",
    borderColor: "rgba(255,214,110,0.18)",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 10,
    padding: 13,
  },
  accountLabel: {
    color: "#FFD66E",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  accountEmail: {
    color: "#F4FAFF",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 5,
  },
  accountState: {
    color: "#9FE7FF",
    fontSize: 10.5,
    fontWeight: "800",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "rgba(6,16,31,0.88)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionButtonTitle: {
    color: "#F4FAFF",
    fontSize: 12.5,
    fontWeight: "900",
  },
  actionButtonSub: {
    color: "#8FA4BE",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
  button: {
    marginTop: 9,
  },
  tileGrid: {
    gap: 10,
    marginTop: 6,
  },
  infoTile: {
    backgroundColor: "rgba(6,16,31,0.8)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.13)",
    padding: 13,
  },
  infoTitle: {
    color: "#F4FAFF",
    fontSize: 12.5,
    fontWeight: "900",
  },
  infoBody: {
    color: "#8FA4BE",
    fontSize: 10.5,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 5,
  },
  statusStrip: {
    minHeight: 104,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.2)",
    marginBottom: 14,
  },
  statusArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  statusCopy: {
    padding: 14,
  },
  statusLabel: {
    color: "#FFD66E",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.3,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  statusTitle: {
    color: "#D8E7FF",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },
  supportButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(159,231,255,0.14)",
    borderColor: "rgba(159,231,255,0.3)",
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  supportButtonText: {
    color: "#9FE7FF",
    fontSize: 10.5,
    fontWeight: "900",
  },
  input: {
    backgroundColor: "rgba(6,16,31,0.88)",
    borderColor: "rgba(255,108,108,0.24)",
    borderRadius: 16,
    borderWidth: 1,
    color: "#F4FAFF",
    fontSize: 12.5,
    fontWeight: "800",
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
});
