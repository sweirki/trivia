import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

import { getFriendsLeaderboard } from "@/social/getFriendsLeaderboard";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { sendChallenge } from "@/social/sendChallenge";

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

export default function LeaderboardScreen() {
  const user = useAuthStore((s) => s.user);
  const nickname = usePlayerStore((s) => s.nickname);
  const xp = usePlayerStore((s) => s.xp);
  const totalWins = usePlayerStore((s) => s.totalWins);

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
      challengePlayed: totalWins + 2,
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

      if (localRow) {
        combined.push(localRow);
      }

      setRows(combined);
      setLoading(false);
      return;
    }

    setLoading(true);

    getFriendsLeaderboard(user.uid)
      .then((result) => {
        if (!active) return;
        setRows(result as LeaderboardRow[]);
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

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Sign in to enter the Arena leaderboard.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.livePill}>GLOBAL ARENA</Text>
          <Text style={styles.seasonPill}>Season 1</Text>
        </View>

        <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.heroTitle}>Competitive Rankings</Text>

        <Text allowFontScaling maxFontSizeMultiplier={1.15} style={styles.heroSubtitle}>
          Track elite players, climb seasonal prestige, defend your rank,
          and compete for future championship rewards.
        </Text>

        <View style={styles.heroStats}>
          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>100</Text>
            <Text style={styles.heroStatLabel}>Top Players</Text>
          </View>

          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>LIVE</Text>
            <Text style={styles.heroStatLabel}>Season</Text>
          </View>

          <View style={styles.heroStatCard}>
            <Text style={styles.heroStatValue}>🏆</Text>
            <Text style={styles.heroStatLabel}>Prestige</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Global leaderboard tab"
          accessibilityState={{ selected: tab === "global" }}
          onPress={() => setTab("global")}
          style={[
            styles.tabButton,
            tab === "global" && styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              tab === "global" && styles.activeTabText,
            ]}
          >
            Global
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Friends leaderboard tab"
          accessibilityState={{ selected: tab === "friends" }}
          onPress={() => setTab("friends")}
          style={[
            styles.tabButton,
            tab === "friends" && styles.activeTab,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              tab === "friends" && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>
          {tab === "global" ? "SEASONAL LADDER" : "FRIEND COMPETITION"}
        </Text>

        <Text style={styles.infoBody}>
          {tab === "global"
            ? "Elite Arena competitors are climbing for seasonal prestige and future champion rewards."
            : "Challenge friends directly and compete for social dominance."}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leaderboard…</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.uid}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          renderItem={({ item, index }) => {
            const isMe = item.uid === user.uid;

            const name =
              item.displayName ||
              item.nickname ||
              item.username ||
              (isMe ? "You" : "Player");

            const xpValue =
              typeof item.xp === "number"
                ? item.xp
                : item.rankValue;

            const winsValue =
              typeof item.totalWins === "number"
                ? item.totalWins
                : 0;

            const isTop3 = index <= 2 && tab === "global";

            return (
              <View
                style={[
                  styles.playerCard,
                  isMe && styles.myCard,
                  isTop3 && styles.topCard,
                ]}
              >
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>
                    {index === 0 && tab === "global"
                      ? "👑"
                      : `#${index + 1}`}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text allowFontScaling maxFontSizeMultiplier={1.2} style={styles.playerName}>
                      {name}
                      {isMe ? " • You" : ""}
                    </Text>

                    {isTop3 && (
                      <Text style={styles.legendBadge}>
                        LEGEND
                      </Text>
                    )}
                  </View>

                  <Text style={styles.playerStats}>
                    {item.challengeWins ?? 0} challenge wins •{" "}
                    {item.challengePlayed ?? 0} matches
                  </Text>

                  <Text style={styles.playerSubStats}>
                    {xpValue} XP • {winsValue} victories
                  </Text>
                </View>

                {!isMe && tab === "friends" && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Challenge ${name}`}
                    accessibilityHint="Starts a friend challenge"
                    onPress={async () => {
                      await sendChallenge(user.uid, item.uid);
                    }}
                    style={styles.challengeBtn}
                  >
                    <Text style={styles.challengeText}>
                      Challenge
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyList}>
              {tab === "friends"
                ? "No friends yet. Add players to build your social rivalry network."
                : "No leaderboard data yet."}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090912",
    padding: 14,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#090912",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  emptyText: {
    color: "#AAB2C4",
    textAlign: "center",
    fontSize: 16,
  },

  hero: {
    backgroundColor: "#171423",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: "#40305E",
    marginBottom: 14,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  livePill: {
    color: "#120d05",
    backgroundColor: "#FFD36B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
  },

  seasonPill: {
    color: "#BBD7FF",
    backgroundColor: "#1f2b45",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "800",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 16,
  },

  heroSubtitle: {
    color: "#C8C4D8",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  heroStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  heroStatCard: {
    flex: 1,
    backgroundColor: "#211D31",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  heroStatValue: {
    color: "#FFD36B",
    fontSize: 18,
    fontWeight: "900",
  },

  heroStatLabel: {
    color: "#8F8AA3",
    fontSize: 11,
    marginTop: 4,
  },

  tabsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  tabButton: {
    flex: 1,
    backgroundColor: "#171B29",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#262C3F",
  },

  activeTab: {
    backgroundColor: "#FFD36B",
    borderColor: "#FFD36B",
  },

  tabText: {
    color: "#FFD36B",
    fontWeight: "900",
    fontSize: 14,
  },

  activeTabText: {
    color: "#120d05",
  },

  infoCard: {
    backgroundColor: "#12131D",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#273047",
    marginBottom: 14,
  },

  infoLabel: {
    color: "#BBD7FF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  infoBody: {
    color: "#B8C0D4",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
  },

  loadingText: {
    color: "#AAB2C4",
    fontSize: 15,
  },

  playerCard: {
    backgroundColor: "#151522",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#27283B",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  myCard: {
    borderColor: "#FFD36B",
    backgroundColor: "#1F1A10",
  },

  topCard: {
    borderColor: "#6D4B1E",
    backgroundColor: "#20170D",
  },

  rankCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#232337",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#3A3A55",
  },

  rankText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  playerName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  legendBadge: {
    color: "#120d05",
    backgroundColor: "#FFD36B",
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: "900",
  },

  playerStats: {
    color: "#AAB2C4",
    marginTop: 5,
    fontSize: 13,
  },

  playerSubStats: {
    color: "#7C8499",
    marginTop: 3,
    fontSize: 12,
  },

  challengeBtn: {
    backgroundColor: "#FFD36B",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 12,
  },

  challengeText: {
    color: "#120d05",
    fontWeight: "900",
    fontSize: 12,
  },

  emptyList: {
    color: "#9AA3B2",
    textAlign: "center",
    marginTop: 60,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});

