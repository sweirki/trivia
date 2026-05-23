import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import ScreenShell from "@/components/ScreenShell";
import { getFriendsLeaderboard } from "@/social/getFriendsLeaderboard";
import { sendChallenge } from "@/social/sendChallenge";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlayerStore } from "@/store/usePlayerStore";

const LEADERBOARD_ART = require("../../assets/images/lobby/leaderboard_card_art.webp");
const LOBBY_HERO_ART = require("../../assets/images/lobby/lobby_hero_banner.webp");
const PROFILE_PRESTIGE_BG = require("../../assets/premium/atmospheres/profile_prestige_bg.webp");
const TROPHY_HALL_BG = require("../../assets/cosmetics/backgrounds/bg_trophy_hall_01.webp");
const STADIUM_LIGHTS_BG = require("../../assets/cosmetics/backgrounds/bg_stadium_lights_01.webp");

type Tab = "global" | "friends";

type LeaderboardRow = {
  uid: string;
  displayName?: string;
  username?: string;
  nickname?: string;
  xp?: number;
  totalWins?: number;
  challengeWins?: number;
  challengePlayed?: number;
  rankValue: number;
};

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

export default function LeaderboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const nickname = usePlayerStore((s) => s.nickname);
  const xp = usePlayerStore((s) => s.xp);
  const totalWins = usePlayerStore((s) => s.totalWins);
  const level = usePlayerStore((s) => s.level);

  const [tab, setTab] = useState<Tab>("global");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);

  const localRow = useMemo<LeaderboardRow | null>(() => {
    if (!user?.uid) return null;

    return {
      uid: user.uid,
      displayName: nickname ?? user.email ?? "You",
      xp,
      totalWins,
      rankValue: xp,
      challengeWins: totalWins,
      challengePlayed: Math.max(totalWins + 2, totalWins),
    };
  }, [nickname, totalWins, user?.email, user?.uid, xp]);

  useEffect(() => {
    let active = true;

    if (!user?.uid) {
      setRows([]);
      setLoading(false);
      return;
    }

    if (tab === "global") {
      const fakeGlobal: LeaderboardRow[] = [
        {
          uid: "top-1",
          displayName: "ShadowFox",
          xp: 14200,
          totalWins: 822,
          challengeWins: 402,
          challengePlayed: 510,
          rankValue: 14200,
        },
        {
          uid: "top-2",
          displayName: "MindStrike",
          xp: 13850,
          totalWins: 781,
          challengeWins: 355,
          challengePlayed: 470,
          rankValue: 13850,
        },
        {
          uid: "top-3",
          displayName: "NovaIQ",
          xp: 13220,
          totalWins: 744,
          challengeWins: 330,
          challengePlayed: 451,
          rankValue: 13220,
        },
      ];

      const combined = [...fakeGlobal];
      if (localRow) combined.push(localRow);

      setRows(combined.sort((a, b) => b.rankValue - a.rankValue));
      setLoading(false);
      return;
    }

    setLoading(true);

    getFriendsLeaderboard(user.uid)
      .then((result) => {
        if (!active) return;
        const friendRows = result as LeaderboardRow[];
        setRows(friendRows.length > 0 ? friendRows : localRow ? [localRow] : []);
      })
      .catch(() => {
        if (!active) return;
        setRows(localRow ? [localRow] : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [localRow, tab, user?.uid]);

  const orderedRows = useMemo(
    () => [...rows].sort((a, b) => b.rankValue - a.rankValue),
    [rows],
  );

  const myRank = user?.uid
    ? orderedRows.findIndex((item) => item.uid === user.uid) + 1
    : 0;

  if (!user) {
    return (
      <ScreenShell accessibilityLabel="Leaderboard sign in screen" contentStyle={styles.shellContent}>
        <Image source={PROFILE_PRESTIGE_BG} style={styles.backgroundArt} resizeMode="cover" />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(3,7,15,0.18)", "rgba(3,7,15,0.72)", "rgba(3,7,15,0.96)"]}
          locations={[0, 0.46, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.signInCard}>
          <Image source={LEADERBOARD_ART} style={styles.signInArt} resizeMode="cover" />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2,6,14,0.84)", "rgba(2,6,14,0.38)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.signInCopy}>
            <Text style={styles.kicker}>GLOBAL ARENA</Text>
            <Text style={styles.title}>Leaderboard</Text>
            <Text style={styles.subtitle}>Sign in to enter the seasonal ladder and track your arena rank.</Text>
          </View>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell accessibilityLabel="Leaderboard screen" contentStyle={styles.shellContent}>
      <Image source={PROFILE_PRESTIGE_BG} style={styles.backgroundArt} resizeMode="cover" />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(3,7,15,0.16)", "rgba(3,7,15,0.74)", "rgba(3,7,15,0.97)"]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>GLOBAL ARENA</Text>
            <Text style={styles.title}>Leaderboard</Text>
            <Text style={styles.subtitle}>Seasonal rank • rivals • prestige</Text>
          </View>

          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Image source={LEADERBOARD_ART} style={styles.heroArt} resizeMode="cover" />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2,6,14,0.78)", "rgba(2,6,14,0.36)", "rgba(2,6,14,0.04)"]}
            locations={[0, 0.48, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,214,110,0.16)", "rgba(33,190,255,0.09)", "rgba(0,0,0,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroInner}>
            <View style={styles.heroTopRow}>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE SEASON</Text>
              </View>
              <Text style={styles.seasonPill}>Season 1</Text>
            </View>

            <Text style={styles.heroTitle}>Competitive Rankings</Text>
            <Text style={styles.heroSubtitle}>
              Climb the Arena ladder, defend your standing, and build your championship identity.
            </Text>

            <View style={styles.heroStats}>
              <HeroStat label="Your Rank" value={myRank > 0 ? `#${myRank}` : "—"} />
              <HeroStat label="Level" value={level} />
              <HeroStat label="XP" value={formatNumber(xp)} />
            </View>
          </View>
        </View>

        <View style={styles.tabsRow}>
          <LeaderboardTab title="Global" selected={tab === "global"} onPress={() => setTab("global")} />
          <LeaderboardTab title="Friends" selected={tab === "friends"} onPress={() => setTab("friends")} />
        </View>

        <View style={styles.infoCard}>
          <Image
            source={tab === "global" ? TROPHY_HALL_BG : STADIUM_LIGHTS_BG}
            style={styles.infoArt}
            resizeMode="cover"
          />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(7,17,31,0.88)", "rgba(7,17,31,0.58)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.infoCopy}>
            <Text style={styles.infoLabel}>{tab === "global" ? "SEASONAL LADDER" : "FRIEND RIVALS"}</Text>
            <Text style={styles.infoBody}>
              {tab === "global"
                ? "Elite competitors are climbing for prestige, future champion rewards, and season identity."
                : "Challenge friends directly and turn every match into a social rivalry."}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading leaderboard…</Text>
          </View>
        ) : orderedRows.length === 0 ? (
          <View style={styles.emptyCard}>
            <Image source={LOBBY_HERO_ART} style={styles.emptyArt} resizeMode="cover" />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(2,6,14,0.9)", "rgba(2,6,14,0.55)"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.emptyTitle}>No rivals yet</Text>
            <Text style={styles.emptyBody}>
              {tab === "friends"
                ? "Add players to build your rivalry network."
                : "No leaderboard data yet."}
            </Text>
          </View>
        ) : (
          <View style={styles.rankingStack}>
            {orderedRows.map((item, index) => (
              <RankingRow
                key={item.uid}
                item={item}
                index={index}
                isMe={item.uid === user.uid}
                isTop3={index <= 2 && tab === "global"}
                tab={tab}
                onChallenge={async () => {
                  await sendChallenge(user.uid, item.uid);
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.heroStatCard}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function LeaderboardTab({
  title,
  selected,
  onPress,
}: {
  title: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={`${title} leaderboard tab`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.tabButton, selected && styles.activeTab, pressed && styles.pressed]}
    >
      <Text style={[styles.tabText, selected && styles.activeTabText]}>{title}</Text>
    </Pressable>
  );
}

function RankingRow({
  item,
  index,
  isMe,
  isTop3,
  tab,
  onChallenge,
}: {
  item: LeaderboardRow;
  index: number;
  isMe: boolean;
  isTop3: boolean;
  tab: Tab;
  onChallenge: () => Promise<void>;
}) {
  const name = item.displayName || item.nickname || item.username || (isMe ? "You" : "Player");
  const xpValue = typeof item.xp === "number" ? item.xp : item.rankValue;
  const winsValue = typeof item.totalWins === "number" ? item.totalWins : 0;
  const rankLabel = `#${index + 1}`;
  const tierLabel = index === 0 ? "CHAMP" : index === 1 ? "ELITE" : index === 2 ? "MASTER" : isMe ? "YOU" : "RANK";

  return (
    <View style={[styles.playerCard, isMe && styles.myCard, isTop3 && styles.topCard]}>
      <View style={[styles.rankCircle, isTop3 && styles.topRankCircle, isMe && styles.myRankCircle]}>
        <Text style={styles.rankText}>{rankLabel}</Text>
        <Text style={styles.rankTierText}>{tierLabel}</Text>
      </View>

      <View style={styles.playerCopy}>
        <View style={styles.nameRow}>
          <Text allowFontScaling maxFontSizeMultiplier={1.18} style={styles.playerName} numberOfLines={1}>
            {name}{isMe ? " • You" : ""}
          </Text>

          {isTop3 && <Text style={styles.legendBadge}>LEGEND</Text>}
        </View>

        <Text style={styles.playerStats}>
          {item.challengeWins ?? 0} challenge wins • {item.challengePlayed ?? 0} matches
        </Text>

        <Text style={styles.playerSubStats}>
          {formatNumber(xpValue)} XP • {formatNumber(winsValue)} victories
        </Text>
      </View>

      {!isMe && tab === "friends" && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Challenge ${name}`}
          accessibilityHint="Starts a friend challenge"
          onPress={onChallenge}
          style={({ pressed }) => [styles.challengeBtn, pressed && styles.pressed]}
        >
          <Text style={styles.challengeText}>Challenge</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingTop: 18,
    paddingBottom: 0,
  },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.9,
  },
  content: {
    paddingBottom: 52,
  },
  headerRow: {
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
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginBottom: 3,
  },
  title: {
    color: "#F4FAFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: "#9FE7FF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  backButton: {
    marginTop: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.25)",
    backgroundColor: "rgba(7,17,31,0.7)",
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  backText: {
    color: "#D8E7FF",
    fontSize: 12,
    fontWeight: "900",
  },
  heroCard: {
    minHeight: 206,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.44)",
    marginBottom: 14,
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
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
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(68,229,197,0.38)",
    backgroundColor: "rgba(68,229,197,0.13)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
    backgroundColor: "#44E5C5",
  },
  liveText: {
    color: "#44E5C5",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  seasonPill: {
    color: "#FFD66E",
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "rgba(255,214,110,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.32)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: "hidden",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.94)",
    textShadowRadius: 9,
    marginTop: 36,
  },
  heroSubtitle: {
    color: "#D8E7FF",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 7,
    maxWidth: "88%",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  heroStats: {
    flexDirection: "row",
    gap: 9,
    marginTop: 15,
  },
  heroStatCard: {
    flex: 1,
    borderRadius: 17,
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: "rgba(7,17,31,0.72)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.18)",
  },
  heroStatValue: {
    color: "#FFD66E",
    fontSize: 14,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: "#9FE7FF",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  tabsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(7,17,31,0.76)",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.24)",
  },
  activeTab: {
    backgroundColor: "rgba(255,214,110,0.18)",
    borderColor: "rgba(255,214,110,0.72)",
  },
  tabText: {
    color: "#9FE7FF",
    fontWeight: "900",
    fontSize: 12,
  },
  activeTabText: {
    color: "#FFD66E",
  },
  infoCard: {
    minHeight: 104,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.25)",
  },
  infoArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.82,
  },
  infoCopy: {
    padding: 14,
    justifyContent: "center",
    flex: 1,
  },
  infoLabel: {
    color: "#FFD66E",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  infoBody: {
    color: "#D8E7FF",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 7,
    maxWidth: "88%",
  },
  rankingStack: {
    gap: 10,
  },
  playerCard: {
    minHeight: 78,
    borderRadius: 20,
    padding: 11,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.2)",
    backgroundColor: "rgba(7,17,31,0.86)",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  myCard: {
    borderColor: "rgba(255,214,110,0.76)",
    backgroundColor: "rgba(7,17,31,0.9)",
  },
  topCard: {
    borderColor: "rgba(255,214,110,0.48)",
    backgroundColor: "rgba(7,17,31,0.88)",
  },
  rankCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    backgroundColor: "rgba(5,14,25,0.82)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.22)",
  },
  topRankCircle: {
    borderColor: "rgba(255,214,110,0.7)",
    backgroundColor: "rgba(255,214,110,0.08)",
  },
  myRankCircle: {
    borderColor: "rgba(255,214,110,0.86)",
  },
  rankText: {
    color: "#F4FAFF",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: -0.2,
  },
  rankTierText: {
    color: "#8EDBFF",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.55,
    marginTop: 2,
  },
  playerCopy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playerName: {
    flexShrink: 1,
    color: "#F4FAFF",
    fontSize: 14,
    fontWeight: "900",
  },
  legendBadge: {
    color: "#120D05",
    backgroundColor: "#FFD66E",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
    fontSize: 8,
    fontWeight: "900",
  },
  playerStats: {
    color: "#BFD1EA",
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
  },
  playerSubStats: {
    color: "#86DFFF",
    marginTop: 2,
    fontSize: 10,
    fontWeight: "800",
  },
  challengeBtn: {
    backgroundColor: "#FFD66E",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  challengeText: {
    color: "#120D05",
    fontWeight: "900",
    fontSize: 11,
  },
  loadingCard: {
    minHeight: 150,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(7,17,31,0.72)",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.22)",
  },
  loadingText: {
    color: "#D8E7FF",
    fontSize: 14,
    fontWeight: "900",
  },
  emptyCard: {
    minHeight: 170,
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    backgroundColor: "#07111F",
    borderWidth: 1,
    borderColor: "rgba(110,170,255,0.24)",
  },
  emptyArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.72,
  },
  emptyTitle: {
    color: "#F4FAFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyBody: {
    color: "#D8E7FF",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
  signInCard: {
    flex: 1,
    minHeight: 360,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,214,110,0.38)",
    backgroundColor: "#07111F",
    justifyContent: "flex-end",
  },
  signInArt: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.96,
  },
  signInCopy: {
    padding: 22,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
});
