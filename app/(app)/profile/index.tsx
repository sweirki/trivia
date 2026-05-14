import {
  Image,
  View,
  ScrollView,
  Pressable,
} from "react-native";

import { Text } from "@/theme";
import ScreenShell from "@/components/ScreenShell";
import { AVATARS } from "@/identity/avatars/avatarDefinitions";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEntitlementStore } from "@/store/entitlementStore";
import { formatVipTimeLeft } from "@/economy/vipPerks";
import { useRouter } from "expo-router";
import { useHistoryStore } from "@/store/historyStore";
import AnimatedProgressBar from "@/components/AnimatedProgressBar";
import GoldCard from "@/components/GoldCard";
import { CosmeticCategory } from "@/cosmetics/types";
import { getEquippedCosmetic } from "@/cosmetics/cosmeticSelectors";
import { getCosmeticAssetSource } from "@/cosmetics/cosmeticAssets";
import { Grid, Section, Stat, Tile, profileStyles as styles } from "./profile.components";

export default function ProfileScreen() {
  const router = useRouter();

  const history = useHistoryStore((s) => s.history) as Array<{
  won?: boolean;
  totalQuestions?: number;
  correctCount?: number;
  score?: number;
}>;
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

  const totalGames = totalGamesPlayed;
  const totalWins = totalPlayerWins;

  const totalQuestions = history.reduce(
    (sum, g) => sum + (g.totalQuestions ?? 0),
    0
  );

  const totalCorrect = history.reduce(
    (sum, g) => sum + (g.correctCount ?? g.score ?? 0),
    0
  );

  const accuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const xpRequired = level * 150 + level * level * 6;
  const xpPercent = xpRequired > 0 ? Math.min(xp / xpRequired, 1) : 0;

  const displayName = nickname ?? "Player";
  const playerCosmetics = usePlayerStore((s) => s.cosmetics);
  const equippedAvatar = getEquippedCosmetic(playerCosmetics, CosmeticCategory.AVATAR);
  const equippedFrame = getEquippedCosmetic(playerCosmetics, CosmeticCategory.AVATAR_FRAME);
  const equippedBadge = getEquippedCosmetic(playerCosmetics, CosmeticCategory.BADGE);
  const equippedBackground = getEquippedCosmetic(playerCosmetics, CosmeticCategory.PROFILE_BACKGROUND);
  const backgroundSource = getCosmeticAssetSource(equippedBackground?.icon);
  const equippedAvatarSource = getCosmeticAssetSource(equippedAvatar?.icon);

  const shouldShowAvatar = Boolean(user && !isGuest);
  const avatar = shouldShowAvatar
    ? AVATARS.find((a) => a.id === playerAvatarId)
    : null;

  return (
    <ScreenShell accessibilityLabel="Profile screen" testID="screen-profile">
      {backgroundSource && (
        <Image
          source={backgroundSource}
          style={styles.profileBackground}
          resizeMode="cover"
        />
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GoldCard variant="premium" padding="md" style={styles.heroCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarFrame}>
              {shouldShowAvatar && avatarUri ? (
              <Image
  source={{ uri: avatarUri }}
  style={styles.avatar}
  resizeMode="cover"
/>
              ) : shouldShowAvatar && equippedAvatarSource ? (
               <Image
  source={equippedAvatarSource}
  style={styles.avatar}
  resizeMode="cover"
/>
              ) : shouldShowAvatar && avatar ? (
              <Image
  source={avatar.asset}
  style={styles.avatar}
  resizeMode="cover"
/>
              ) : (
                <View style={[styles.avatar, { backgroundColor: "#1B243A" }]} />
              )}
            </View>

            <View style={styles.profileHeaderText}>
              <Text style={styles.title}>{displayName}</Text>

              <Text style={styles.sub}>
                Level {level} • {xp} XP
              </Text>

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
                    <Text style={styles.identityBadgeText}>🖼 {equippedFrame.name}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View
            style={[
              styles.vipProfileBadge,
              isVIPActive
                ? styles.vipProfileBadgeActive
                : styles.vipProfileBadgeLocked,
            ]}
          >
            <Text
              style={[
                styles.vipProfileText,
                isVIPActive
                  ? styles.vipProfileTextActive
                  : styles.vipProfileTextLocked,
              ]}
            >
              {isVIPActive ? `VIP ${vipTier || 1} ACTIVE ✓` : "VIP NOT ACTIVE"}
            </Text>

            <Text style={styles.vipProfileSub}>
              {isVIPActive
                ? `${formatVipTimeLeft(vipExpiresAt)} left`
                : "Upgrade preview available in Store"}
            </Text>
          </View>

          <View style={styles.seasonBanner}>
            <Text style={styles.seasonBannerLabel}>SEASON 1 PRESTIGE</Text>
            <Text style={styles.seasonBannerTitle}>
              Bronze Arena Competitor
            </Text>
            <Text style={styles.seasonBannerBody}>
              Compete in ranked seasons, tournaments, and global leaderboards
              to unlock elite rewards, borders, titles, and champion cosmetics.
            </Text>
          </View>

          <AnimatedProgressBar
            percent={xpPercent * 100}
            height={10}
            fillColor="#F6C453"
            trackColor="#1B243A"
            glowColor="#F6C453"
            style={styles.xpBar}
          />

          <Text style={styles.xpText}>
            {xp} / {xpRequired} XP
          </Text>
        </GoldCard>

        <GoldCard variant="soft" padding="md" style={styles.accountBox}>
          {user ? (
            <>
              <Text style={styles.accountText}>
                Signed in as {user.email}
                {user.emailVerified ? "" : " • not verified"}
              </Text>

              <View style={styles.accountButtonRow}>
                <Pressable
                  onPress={() => router.push("/identity")}
                  style={({ pressed }) => [
                    styles.accountButton,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.accountButtonText}>Edit profile</Text>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    await logout();
                    router.replace("/(auth)/login");
                  }}
                  style={({ pressed }) => [
                    styles.accountButton,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.accountButtonText}>Log out</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.accountText}>Playing as Guest</Text>
              <Text style={styles.accountSub}>
                Progress is saved on this device. Sign in to back it up.
              </Text>

              <Pressable
                onPress={() => router.push("/login")}
                style={({ pressed }) => [
                  styles.accountButton,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.accountButtonText}>
                  Sign in / Create account
                </Text>
              </Pressable>
            </>
          )}
        </GoldCard>

        <View style={styles.statsRow}>
          <Stat label="Games" value={totalGames} />
          <Stat label="Wins" value={totalWins} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
        </View>

        <Section title="Competitive Identity">
          <View style={styles.identityRow}>
            <View style={styles.identityCard}>
              <Text style={styles.identityValue}>🏆 {tournamentsWon}</Text>
              <Text style={styles.identityLabel}>Tournament Wins</Text>
            </View>

            <View style={styles.identityCard}>
              <Text style={styles.identityValue}>🔥 {Math.max(totalWins, 0)}</Text>
              <Text style={styles.identityLabel}>Competitive Wins</Text>
            </View>

            <View style={styles.identityCard}>
              <Text style={styles.identityValue}>
                👑 #{bestTournamentFinish || "-"}
              </Text>
              <Text style={styles.identityLabel}>Best Finish</Text>
            </View>
          </View>
        </Section>

        <Section title="Quick Access">
          <Grid>
            <Tile
              title="Achievements"
              sub="Your milestones"
              onPress={() => router.push("/achievements")}
            />
            <Tile
              title="Leaderboard"
              sub="Global rankings"
              onPress={() => router.push("/leaderboard")}
            />
          </Grid>
        </Section>

        <Section title="Profile">
          <Grid>
            <Tile
              title="Statistics"
              sub="Performance breakdown"
              onPress={() => router.push("/statistics" as any)}
            />
            <Tile
              title="Friends"
              sub="Social & invites"
              onPress={() => router.push("/friends")}
            />
          </Grid>
        </Section>

        <Section title="Titles">
          {titles.length === 0 ? (
            <Text style={styles.empty}>
              No titles yet — place high in tournaments to earn some.
            </Text>
          ) : (
            <View style={styles.pills}>
              {titles.map((t) => (
                <View key={t} style={styles.pill}>
                  <Text style={styles.pillText}>{t}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.futurePrestigeCard}>
            <Text style={styles.futurePrestigeLabel}>FUTURE PRESTIGE</Text>
            <Text style={styles.futurePrestigeTitle}>
              Elite Cosmetics & Seasonal Frames
            </Text>
            <Text style={styles.futurePrestigeBody}>
              Seasonal borders, animated frames, champion trophies, title
              plates, and elite identity cosmetics are arriving in future Arena
              seasons.
            </Text>
          </View>
        </Section>

        <Section title="Tournament History">
          {tournamentHistory.length === 0 ? (
            <Text style={styles.empty}>
              You haven’t completed any tournaments yet.
            </Text>
          ) : (
            tournamentHistory.map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyText}>
                  {h.position === 1 ? "🏆 Champion" : `#${h.position}`} •{" "}
                  {h.totalPlayers} players
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(h.timestamp).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </Section>
      </ScrollView>
    </ScreenShell>
  );
}
