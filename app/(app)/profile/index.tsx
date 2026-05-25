import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import ScreenShell from "@/components/ScreenShell";
import SectionHeader from "@/components/SectionHeader";
import { Text, useTheme } from "@/theme";
import { AVATARS } from "@/identity/avatars/avatarDefinitions";
import { useIdentityStore } from "@/identity/store/useIdentityStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEntitlementStore } from "@/store/entitlementStore";
import { formatVipTimeLeft } from "@/economy/vipPerks";
import { useHistoryStore } from "@/store/historyStore";
import { CosmeticCategory } from "@/cosmetics/types";
import { getEquippedCosmetic } from "@/cosmetics/cosmeticSelectors";
import { getCosmeticAssetSource } from "@/cosmetics/cosmeticAssets";

const PROFILE_PRESTIGE_BG = require("../../../assets/premium/atmospheres/profile_prestige_bg.webp");
const PROFILE_ART = require("../../../assets/images/lobby/profile_card_art.webp");
const ACHIEVEMENTS_ART = require("../../../assets/images/lobby/achievements_card_art.webp");
const STATS_ART = require("../../../assets/images/lobby/stats_card_art.webp");
const LEADERBOARD_ART = require("../../../assets/images/lobby/leaderboard_card_art.webp");
const FRIENDS_ART = require("../../../assets/images/lobby/friends_card_art.webp");
const VIP_CROWN = require("../../../assets/cosmetics/system/vip_crown_badge_01.webp");
const VIP_BANNER = require("../../../assets/cosmetics/arena-banners/arena_banner_vip_gold_01.webp");
const TROPHY_BG = require("../../../assets/cosmetics/backgrounds/bg_trophy_hall_01.webp");
const STADIUM_BG = require("../../../assets/cosmetics/backgrounds/bg_stadium_lights_01.webp");
const FOUNDER_BADGE = require("../../../assets/cosmetics/badges/badge_founder_legend.webp");
const CHAMPION_BADGE = require("../../../assets/cosmetics/badges/badge_arena_champion_01.webp");

const GOLD = "#FFD66E";
const CYAN = "#9FE7FF";
const BLUE = "#58B8FF";
const INK = "#07111F";

type HistoryEntry = {
  won?: boolean;
  totalQuestions?: number;
  correctCount?: number;
  score?: number;
};

type ArtTileProps = {
  title: string;
  sub: string;
  art: ImageSourcePropType;
  accent?: string;
  titleTone?: "gold" | "blue" | "white";
  onPress: () => void;
};

function ArtTile({
  title,
  sub,
  art,
  accent = BLUE,
  titleTone = "white",
  onPress,
}: ArtTileProps) {
  const titleColor =
    titleTone === "gold" ? GOLD : titleTone === "blue" ? CYAN : "#FFFFFF";

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${title}. ${sub}`}
      accessibilityHint="Opens this profile section"
      style={({ pressed }) => [styles.artTile, pressed && styles.pressed]}
    >
      <Image source={art} style={styles.artImage} resizeMode="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(2,6,14,0.68)", "rgba(2,6,14,0.2)", "rgba(2,6,14,0.02)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.artAccent, { backgroundColor: accent }]} />
      <View pointerEvents="none" style={[styles.artBorderGlow, { borderColor: `${accent}99` }]} />
      <View style={styles.artCopy}>
        <Text style={[styles.artTitle, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.artSub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
    </Pressable>
  );
}

function MiniStat({ label, value, tone = "blue" }: { label: string; value: string | number; tone?: "blue" | "gold" }) {
  const accent = tone === "gold" ? GOLD : CYAN;

  return (
    <View style={styles.miniStat}>
      <View style={[styles.miniStatGlow, { backgroundColor: accent }]} />
      <Text style={[styles.miniStatValue, { color: tone === "gold" ? GOLD : "#FFFFFF" }]}>
        {value}
      </Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function PrestigePanel({
  title,
  label,
  body,
  art,
  accent = GOLD,
}: {
  title: string;
  label: string;
  body: string;
  art: ImageSourcePropType;
  accent?: string;
}) {
  return (
    <View style={styles.prestigePanel}>
      <Image source={art} style={styles.panelArt} resizeMode="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(7,17,31,0.82)", "rgba(7,17,31,0.5)", "rgba(7,17,31,0.16)"]}
        locations={[0, 0.56, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.panelRim, { borderColor: `${accent}66` }]} />
      <View style={styles.panelCopy}>
        <Text style={[styles.panelLabel, { color: accent }]}>{label}</Text>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelBody}>{body}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();

  const history = useHistoryStore((s) => s.history) as HistoryEntry[];
  const totalGamesPlayed = usePlayerStore((s) => s.totalGamesPlayed);
  const totalPlayerWins = usePlayerStore((s) => s.totalWins);

  const {
    level,
    xp,
    nickname,
    avatarId: playerAvatarId,
    avatarUri,
    tournamentsWon,
    bestTournamentFinish,
    titles,
    tournamentHistory,
  } = usePlayerStore();

  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const logout = useAuthStore((s) => s.logout);

  const vipExpiresAt = useEntitlementStore((s) => s.vipExpiresAt);
  const vipTier = useEntitlementStore((s) => s.vipTier);
  const isVIPActive = Date.now() < (vipExpiresAt || 0);

  const playerCosmetics = usePlayerStore((s) => s.cosmetics);
  const equippedAvatar = getEquippedCosmetic(playerCosmetics, CosmeticCategory.AVATAR);
  const equippedFrame = getEquippedCosmetic(playerCosmetics, CosmeticCategory.AVATAR_FRAME);
  const equippedBadge = getEquippedCosmetic(playerCosmetics, CosmeticCategory.BADGE);
  const equippedBackground = getEquippedCosmetic(playerCosmetics, CosmeticCategory.PROFILE_BACKGROUND);
  const backgroundSource = getCosmeticAssetSource(equippedBackground?.icon);
  const equippedAvatarSource = getCosmeticAssetSource(equippedAvatar?.icon);

  const totalQuestions = useMemo(
    () => history.reduce((sum, g) => sum + (g.totalQuestions ?? 0), 0),
    [history],
  );
  const totalCorrect = useMemo(
    () => history.reduce((sum, g) => sum + (g.correctCount ?? g.score ?? 0), 0),
    [history],
  );
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const xpRequired = level * 150 + level * level * 6;
  const xpPercent = xpRequired > 0 ? Math.min(xp / xpRequired, 1) : 0;
  const winRate = totalGamesPlayed > 0 ? Math.round((totalPlayerWins / totalGamesPlayed) * 100) : 0;

  const displayName = nickname ?? "Player";
  const identityAvatarId = useIdentityStore((s) => s.identity?.avatarId);
  const effectiveAvatarId = identityAvatarId ?? playerAvatarId;
  const shouldShowAvatar = Boolean(user && !isGuest);
  const avatar = shouldShowAvatar
    ? (AVATARS.find((a) => a.id === effectiveAvatarId) ?? null)
    : null;

  const fade = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  useEffect(() => {
    Animated.timing(xpAnim, {
      toValue: xpPercent,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [xpAnim, xpPercent]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <ScreenShell
      accessibilityLabel="Profile screen"
      testID="screen-profile"
      scroll={false}
      padded={false}
      contentStyle={styles.shellContent}
    >
      <Image source={backgroundSource || PROFILE_PRESTIGE_BG} style={styles.backgroundArt} resizeMode="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(4,9,18,0.58)", "rgba(4,9,18,0.86)", "rgba(4,9,18,0.98)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade }}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[theme.typography.caption, styles.kicker]}>ARENA IDENTITY</Text>
              <Text style={[theme.typography.h1, styles.screenTitle]}>Profile</Text>
              <Text style={[theme.typography.small, styles.screenSub]}>Prestige • Progress • Legacy</Text>
            </View>

            <View
              style={[
                styles.liveBadge,
                isVIPActive ? styles.vipLiveBadge : styles.standardLiveBadge,
              ]}
            >
              <Animated.View
                style={[
                  styles.liveDot,
                  {
                    backgroundColor: isVIPActive ? GOLD : CYAN,
                    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
                    transform: [
                      {
                        scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }),
                      },
                    ],
                  },
                ]}
              />
              <Text style={[theme.typography.caption, { color: isVIPActive ? GOLD : CYAN }]}>
                {isVIPActive ? "VIP" : "LIVE"}
              </Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <Image source={PROFILE_ART} style={styles.heroArt} resizeMode="cover" />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(2,6,14,0.84)", "rgba(2,6,14,0.48)", "rgba(2,6,14,0.08)"]}
              locations={[0, 0.55, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,214,110,0.16)", "rgba(33,190,255,0.08)", "rgba(0,0,0,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.heroInner}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarOuterGlow}>
                  <View style={styles.avatarFrame}>
                    {shouldShowAvatar && avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
                    ) : shouldShowAvatar && avatar ? (
                      <Image source={avatar.asset} style={styles.avatar} resizeMode="cover" />
                    ) : shouldShowAvatar && equippedAvatarSource ? (
                      <Image source={equippedAvatarSource} style={styles.avatar} resizeMode="cover" />
                    ) : (
                      <View style={styles.avatarFallback} />
                    )}
                  </View>
                </View>

                <View style={styles.profileHeaderText}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.playerSub}>Level {level} • Arena Competitor</Text>

                  <View style={styles.identityBadgeRow}>
                    <View style={styles.identityBadge}>
                      <Text style={styles.identityBadgeText}>🏅 Arena Profile</Text>
                    </View>
                    {equippedBadge && (
                      <View style={styles.identityBadge}>
                        <Text style={styles.identityBadgeText}>🏆 {equippedBadge.name}</Text>
                      </View>
                    )}
                    {equippedFrame && (
                      <View style={styles.identityBadge}>
                        <Text style={styles.identityBadgeText}>✦ {equippedFrame.name}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.xpMetaRow}>
                <Text style={styles.xpLabel}>Progress runway</Text>
                <Text style={styles.xpText}>{xp} / {xpRequired} XP</Text>
              </View>
              <View style={styles.xpBar}>
                <Animated.View
                  style={[
                    styles.xpFill,
                    {
                      width: xpAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <MiniStat label="Games" value={totalGamesPlayed} />
            <MiniStat label="Wins" value={totalPlayerWins} tone="gold" />
            <MiniStat label="Accuracy" value={`${accuracy}%`} />
            <MiniStat label="Win Rate" value={`${winRate}%`} tone="gold" />
          </View>

          <View style={styles.vipPanel}>
            <Image source={VIP_BANNER} style={styles.vipPanelArt} resizeMode="cover" />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(7,17,31,0.84)", "rgba(7,17,31,0.42)", "rgba(7,17,31,0.16)"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.vipCopy}>
              <Image source={VIP_CROWN} style={styles.vipIcon} resizeMode="contain" />
              <View style={styles.vipTextWrap}>
                <Text style={styles.vipTitle}>{isVIPActive ? `VIP ${vipTier || 1} ACTIVE` : "VIP NOT ACTIVE"}</Text>
                <Text style={styles.vipSub}>
                  {isVIPActive ? `${formatVipTimeLeft(vipExpiresAt)} left` : "Upgrade preview available in Store"}
                </Text>
              </View>
              <Pressable onPress={() => router.push("/store")} style={({ pressed }) => [styles.vipButton, pressed && styles.pressed]}>
                <Text style={styles.vipButtonText}>{isVIPActive ? "Perks" : "Store"}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.accountPanel}>
            {user ? (
              <>
                <Text style={styles.accountText} numberOfLines={1}>
                  Signed in as {user.email}{user.emailVerified ? "" : " • not verified"}
                </Text>
                <View style={styles.accountButtonRow}>
                  <Pressable onPress={() => router.push("/identity")} style={({ pressed }) => [styles.accountButton, pressed && styles.pressed]}>
                    <Text style={styles.accountButtonText}>Edit profile</Text>
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      await logout();
                      router.replace("/(auth)/login");
                    }}
                    style={({ pressed }) => [styles.accountButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.accountButtonText}>Log out</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.accountText}>Playing as Guest</Text>
                <Text style={styles.accountSub}>Progress is saved on this device. Sign in to back it up.</Text>
                <Pressable onPress={() => router.push("/login")} style={({ pressed }) => [styles.accountButton, pressed && styles.pressed]}>
                  <Text style={styles.accountButtonText}>Sign in / Create account</Text>
                </Pressable>
              </>
            )}
          </View>

          <SectionHeader title="Competitive Identity" />
          <View style={styles.identityGrid}>
            <View style={styles.identityCard}>
              <Image source={CHAMPION_BADGE} style={styles.identityIcon} resizeMode="contain" />
              <Text style={styles.identityValue}>{tournamentsWon}</Text>
              <Text style={styles.identityLabel}>Tournament Wins</Text>
            </View>
            <View style={styles.identityCard}>
              <Image source={FOUNDER_BADGE} style={styles.identityIcon} resizeMode="contain" />
              <Text style={styles.identityValue}>{Math.max(totalPlayerWins, 0)}</Text>
              <Text style={styles.identityLabel}>Competitive Wins</Text>
            </View>
            <View style={styles.identityCard}>
              <Text style={styles.identityCrown}>👑</Text>
              <Text style={styles.identityValue}>#{bestTournamentFinish || "-"}</Text>
              <Text style={styles.identityLabel}>Best Finish</Text>
            </View>
          </View>

          <SectionHeader title="Profile Hub" />
          <View style={styles.grid}>
            <ArtTile title="Achievements" sub="Milestones" art={ACHIEVEMENTS_ART} accent={GOLD} titleTone="gold" onPress={() => router.push("/achievements")} />
            <ArtTile title="Statistics" sub="Performance" art={STATS_ART} accent="#4EE7FF" titleTone="blue" onPress={() => router.push("/statistics" as any)} />
            <ArtTile title="Leaderboard" sub="Global rank" art={LEADERBOARD_ART} accent={GOLD} titleTone="gold" onPress={() => router.push("/leaderboard")} />
            <ArtTile title="Friends" sub="Social invites" art={FRIENDS_ART} accent="#A977FF" onPress={() => router.push("/friends")} />
          </View>

          <PrestigePanel
            label="SEASON 1 PRESTIGE"
            title="Bronze Arena Competitor"
            body="Compete in ranked seasons, tournaments, and global leaderboards to unlock elite rewards, borders, titles, and champion cosmetics."
            art={STADIUM_BG}
            accent={GOLD}
          />

          <View style={styles.sectionCard}>
            <SectionHeader title="Titles" />
            {titles.length === 0 ? (
              <Text style={styles.empty}>No titles yet — place high in tournaments to earn some.</Text>
            ) : (
              <View style={styles.pills}>
                {titles.map((t) => (
                  <View key={t} style={styles.pill}>
                    <Text style={styles.pillText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <PrestigePanel
            label="FUTURE PRESTIGE"
            title="Elite Cosmetics & Seasonal Frames"
            body="Seasonal borders, animated frames, champion trophies, title plates, and elite identity cosmetics are arriving in future Arena seasons."
            art={TROPHY_BG}
            accent={CYAN}
          />

          <View style={styles.sectionCard}>
            <SectionHeader title="Tournament History" />
            {tournamentHistory.length === 0 ? (
              <Text style={styles.empty}>You haven’t completed any tournaments yet.</Text>
            ) : (
              tournamentHistory.map((h, i) => (
                <View key={`${h.timestamp}-${i}`} style={styles.historyRow}>
                  <Text style={styles.historyText}>
                    {h.position === 1 ? "🏆 Champion" : `#${h.position}`} • {h.totalPlayers} players
                  </Text>
                  <Text style={styles.historyDate}>{new Date(h.timestamp).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.72,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 52,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    color: "#7E8EA7",
    letterSpacing: 1.6,
    marginBottom: 3,
    opacity: 0.86,
  },
  screenTitle: {
    color: "#F4FAFF",
    letterSpacing: -0.4,
  },
  screenSub: {
    color: CYAN,
    marginTop: 2,
    fontWeight: "800",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 6,
  },
  vipLiveBadge: {
    backgroundColor: "rgba(255,214,110,0.13)",
    borderColor: "rgba(255,214,110,0.38)",
  },
  standardLiveBadge: {
    backgroundColor: "rgba(159,231,255,0.12)",
    borderColor: "rgba(159,231,255,0.34)",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  heroCard: {
    minHeight: 228,
    marginBottom: 12,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: INK,
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.42)",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 9,
  },
  heroArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.98,
  },
  heroInner: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarOuterGlow: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,214,110,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.46)",
    shadowColor: GOLD,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  avatarFrame: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(7,17,31,0.88)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 46,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 46,
    backgroundColor: "#13213A",
  },
  profileHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    color: GOLD,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.45,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 9,
  },
  playerSub: {
    color: CYAN,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
    textShadowColor: "rgba(0,0,0,0.88)",
    textShadowRadius: 7,
  },
  identityBadgeRow: {
    flexDirection: "row",
    gap: 7,
    flexWrap: "wrap",
    marginTop: 10,
  },
  identityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(7,17,31,0.62)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.28)",
  },
  identityBadgeText: {
    color: "#D8E7FF",
    fontSize: 10,
    fontWeight: "900",
  },
  xpMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  xpLabel: {
    color: CYAN,
    fontSize: 11,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.88)",
    textShadowRadius: 7,
  },
  xpText: {
    color: "#D8E7FF",
    fontSize: 11,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 8,
  },
  xpBar: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(216,231,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.16)",
  },
  xpFill: {
    height: "100%",
    backgroundColor: CYAN,
    shadowColor: BLUE,
    shadowOpacity: 0.75,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  miniStat: {
    flex: 1,
    minHeight: 72,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(7,17,31,0.9)",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.26)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  miniStatGlow: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 1,
    opacity: 0.7,
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 2,
  },
  miniStatLabel: {
    color: "#9FB3CE",
    fontSize: 9.5,
    fontWeight: "800",
    textAlign: "center",
  },
  vipPanel: {
    minHeight: 86,
    marginBottom: 12,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: INK,
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.36)",
  },
  vipPanelArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.94,
  },
  vipCopy: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    gap: 11,
  },
  vipIcon: {
    width: 42,
    height: 42,
  },
  vipTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  vipTitle: {
    color: GOLD,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0,0,0,0.92)",
    textShadowRadius: 8,
  },
  vipSub: {
    color: "#D8E7FF",
    fontSize: 10.5,
    fontWeight: "800",
    marginTop: 3,
  },
  vipButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,214,110,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.42)",
  },
  vipButtonText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "900",
  },
  accountPanel: {
    marginBottom: 14,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "rgba(7,17,31,0.74)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.18)",
    alignItems: "center",
  },
  accountText: {
    color: "#D8E7FF",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  accountSub: {
    color: "#9FB3CE",
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
  },
  accountButtonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  accountButton: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(159,231,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.28)",
  },
  accountButtonText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: "900",
  },
  identityGrid: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 16,
  },
  identityCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 20,
    backgroundColor: "rgba(7,17,31,0.88)",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.26)",
    alignItems: "center",
    justifyContent: "center",
    padding: 9,
    overflow: "hidden",
  },
  identityIcon: {
    width: 35,
    height: 35,
    marginBottom: 5,
  },
  identityCrown: {
    fontSize: 28,
    marginBottom: 5,
  },
  identityValue: {
    color: GOLD,
    fontSize: 18,
    fontWeight: "900",
  },
  identityLabel: {
    color: "#9FB3CE",
    fontSize: 9.5,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  artTile: {
    width: "48.5%",
    minHeight: 118,
    marginBottom: 10,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: INK,
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.28)",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
  artImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.98,
  },
  artAccent: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 0,
    height: 1,
    opacity: 0.76,
  },
  artBorderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
  },
  artCopy: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
    paddingRight: 8,
    zIndex: 5,
  },
  artTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.22,
    marginBottom: 1,
    textShadowColor: "rgba(0,0,0,0.96)",
    textShadowRadius: 9,
  },
  artSub: {
    color: "#D8E7FF",
    fontSize: 10.5,
    fontWeight: "800",
    lineHeight: 13,
    textShadowColor: "rgba(0,0,0,0.94)",
    textShadowRadius: 7,
  },
  prestigePanel: {
    minHeight: 136,
    marginBottom: 14,
    borderRadius: 23,
    overflow: "hidden",
    backgroundColor: INK,
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.24)",
  },
  panelArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.96,
  },
  panelRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 23,
    borderWidth: 1,
  },
  panelCopy: {
    padding: 14,
    paddingRight: 90,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 8,
    textShadowColor: "rgba(0,0,0,0.92)",
    textShadowRadius: 8,
  },
  panelBody: {
    color: "#D8E7FF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 7,
    textShadowColor: "rgba(0,0,0,0.86)",
    textShadowRadius: 6,
  },
  sectionCard: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "rgba(7,17,31,0.82)",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.22)",
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,214,110,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.32)",
  },
  pillText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "900",
  },
  historyRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(159,231,255,0.14)",
  },
  historyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  historyDate: {
    color: "#9FB3CE",
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
  },
  empty: {
    color: "#9FB3CE",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
});



