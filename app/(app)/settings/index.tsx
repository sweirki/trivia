import React, { useState } from "react";
import { StyleSheet, Switch, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { Text, useTheme } from "@/theme";
import GoldCard from "@/components/GoldCard";
import PrimaryButton from "@/components/PrimaryButton";
import ScreenShell from "@/components/ScreenShell";
import SectionHeader from "@/components/SectionHeader";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemedAccountModal } from "@/components/account/ThemedAccountModal";
import { useSettingsStore } from "@/store/useSettingsStore";

function SettingRow({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.settingRow,
        {
          paddingVertical: theme.spacing.md,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingSub, { color: theme.colors.textMuted }]}>
          {subtitle}
        </Text>
      </View>

      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const resendVerificationEmail = useAuthStore(
    (s) => s.resendVerificationEmail
  );
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
      message:
        "This permanently removes your account, social profile, and cloud progress.",
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
    <ScreenShell contentStyle={styles.content}>
      <Text style={[theme.typography.h1, styles.title]}>Settings</Text>
      <Text style={[theme.typography.body, styles.sub]}>
        Audio, gameplay, notifications, account, social systems, and cloud
        controls.
      </Text>

      <GoldCard variant="default" padding="lg" style={styles.card}>
        <SectionHeader title="Gameplay & Audio" />

        <SettingRow
          title="Sound Effects"
          subtitle="Correct answers, buttons, and gameplay feedback"
          value={soundEffects}
          onChange={setSoundEffects}
        />

        <SettingRow
          title="Background Music"
          subtitle="Ambient lobby and gameplay music"
          value={music}
          onChange={setMusic}
        />

        <SettingRow
          title="Vibration Feedback"
          subtitle="Haptics for wins, streaks, and interactions"
          value={vibration}
          onChange={setVibration}
        />
      </GoldCard>

      <GoldCard variant="default" padding="lg" style={styles.card}>
        <SectionHeader title="Notifications & Social" />

        <SettingRow
          title="Notifications"
          subtitle="Challenge alerts and future push notifications"
          value={notifications}
          onChange={setNotifications}
        />

        <SettingRow
          title="Friend Requests"
          subtitle="Receive social invites and friend requests"
          value={friendRequests}
          onChange={setFriendRequests}
        />

        <SettingRow
          title="Challenge Alerts"
          subtitle="Get notified when friends challenge you"
          value={challengeAlerts}
          onChange={setChallengeAlerts}
        />

        <Text style={[theme.typography.small, styles.infoText]}>
          Native push notifications require a development build and are limited
          inside Expo Go.
        </Text>
      </GoldCard>

      <GoldCard variant="premium" padding="lg" style={styles.card}>
        <SectionHeader title="Account & Identity" />

        {user ? (
          <>
            <View
              style={[
                styles.accountBox,
                {
                  backgroundColor: theme.colors.surfaceSoft,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.accountEmail}>{user.email}</Text>
              <Text style={[theme.typography.small, styles.accountState]}>
                {user.emailVerified
                  ? "Verified account"
                  : "Email not verified"}
              </Text>
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
                        message:
                          "A verification email was requested successfully.",
                      });
                    } catch (e: unknown) {
                      setModal({
                        title: "Failed",
                        message:
                          e instanceof Error
                            ? e.message
                            : "Could not send verification.",
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

            <PrimaryButton
              title="Edit Name & Avatar"
              variant="secondary"
              onPress={() => router.push("/identity")}
              style={styles.button}
            />

            <PrimaryButton
              title="Manage Friends"
              variant="secondary"
              onPress={() => router.push("/friends")}
              style={styles.button}
            />

            <PrimaryButton
              title="Log Out"
              variant="ghost"
              onPress={onLogout}
              style={styles.button}
            />
          </>
        ) : (
          <PrimaryButton
            title="Sign In / Create Account"
            onPress={() => router.push("/(auth)/login")}
            style={styles.button}
          />
        )}
      </GoldCard>

      <GoldCard variant="default" padding="lg" style={styles.card}>
        <SectionHeader title="Data & Storage" />

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.surfaceSoft,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={styles.infoTitle}>Cloud Sync</Text>
          <Text style={[theme.typography.small, styles.infoBody]}>
            Friends, challenges, progression, and rankings sync online through
            Firebase.
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.surfaceSoft,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={styles.infoTitle}>Guest Progress</Text>
          <Text style={[theme.typography.small, styles.infoBody]}>
            Guest progress is stored locally and may be lost if the app is
            removed.
          </Text>
        </View>
      </GoldCard>

      <GoldCard variant="default" padding="lg" style={styles.card}>
        <SectionHeader title="Legal & Support" />

        <PrimaryButton
          title="Open Help & Support"
          variant="secondary"
          onPress={() => router.push("/help")}
          style={styles.button}
        />

        <View style={styles.versionRow}>
          <Text style={[theme.typography.small, styles.versionLabel]}>
            App Version
          </Text>
          <Text style={styles.versionValue}>1.0 Production Candidate</Text>
        </View>
      </GoldCard>

      {user && (
        <GoldCard variant="danger" padding="lg" style={styles.card}>
          <SectionHeader
            title="Danger Zone"
            subtitle="Permanently remove your account and cloud profile."
          />

          <TextInput
            value={deletePassword}
            onChangeText={setDeletePassword}
            secureTextEntry
            placeholder="Confirm password"
            placeholderTextColor={theme.colors.textSubtle}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceSoft,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
          />

          <PrimaryButton
            title={busy ? "Working..." : "Delete My Account"}
            variant="danger"
            loading={busy}
            onPress={onDeleteAccount}
            style={styles.button}
          />
        </GoldCard>
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
    paddingTop: 14,
  },
  title: {
    marginBottom: 6,
  },
  sub: {
    marginBottom: 4,
    lineHeight: 21,
  },
  card: {
    marginTop: 14,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    fontWeight: "800",
    fontSize: 14,
  },
  settingSub: {
    marginTop: 4,
    lineHeight: 18,
    fontSize: 12,
  },
  infoText: {
    marginTop: 14,
    lineHeight: 18,
  },
  accountBox: {
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
    borderWidth: 1,
  },
  accountEmail: {
    fontWeight: "800",
  },
  accountState: {
    marginTop: 5,
  },
  button: {
    marginTop: 9,
  },
  infoCard: {
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
  },
  infoTitle: {
    fontWeight: "800",
    marginBottom: 6,
  },
  infoBody: {
    lineHeight: 19,
  },
  versionRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  versionLabel: {
    fontWeight: "700",
  },
  versionValue: {
    fontWeight: "800",
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
});

