// /app/(app)/hub/index.tsx — A+++++ HOME HUB
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Easing,
} from "react-native";

import { useRouter } from "expo-router";
import { auth } from "@/firebase/firebase";
import { Pressable } from "react-native";
import { ACHIEVEMENT_META } from "@/data/achievementMeta";
import { useQuickGameStore } from "@/store/useQuickGameStore";
import { useIdentityStore } from "@/identity/store/useIdentityStore";
import { AVATARS } from "@/identity/avatars/avatarDefinitions";
import { useSeasonStore } from "@/seasons/store/useSeasonStore";
import { CURRENT_SEASON } from "@/seasons/seasonDefinitions";
import { getAuth } from "firebase/auth";
import { app } from "@/firebase/firebase";
import { useSeasonCountdown } from "@/seasons/hooks/useSeasonCountdown";
import { SeasonCountdown } from "@/seasons/components/SeasonCountdown";




import { useChallengesStore } from "@/challenges/store/useChallengesStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAchievementsStore } from "@/store/achievementsStore";
const HUB_SCALE = 0.9;

// Hub Tile Component
interface HubTileProps {
  label: string;
  icon: any;
  color: string;
  onPress: () => void;
}

function HubTile({ label, icon, color, onPress }: HubTileProps) {
  return (
    <TouchableOpacity
      style={[styles.secondaryBtn, { borderColor: color }]}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <Image source={icon} style={styles.econIcon} />
        <Text style={styles.secondaryBtnText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const RANK_TIERS = [
  { name: "Bronze", min: 0, max: 2999 },
  { name: "Silver", min: 3000, max: 7999 },
  { name: "Gold", min: 8000, max: 17999 },
  { name: "Platinum", min: 18000, max: 34999 },
  { name: "Diamond", min: 35000, max: 59999 },
  { name: "Master", min: 60000, max: Infinity },
];

function getRankProgress(xp: number) {
  const currentIndex = RANK_TIERS.findIndex(
    (t) => xp >= t.min && xp <= t.max
  );

  const current = RANK_TIERS[currentIndex];
  const next = RANK_TIERS[currentIndex + 1] ?? null;

  if (!next) {
    return {
      current,
      next: null,
      progress: 1,
      remaining: 0,
    };
  }

  const progress =
    (xp - current.min) / (next.min - current.min);

  const remaining = next.min - xp;

   return {
    current,
    next,
    progress: Math.max(0, Math.min(1, progress)),
    remaining,
  };
}



export default function HubScreen() {
  const avatarId = useIdentityStore(
    (s) => s.identity?.avatarId
  );

 const avatar =
  avatarId
    ? AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0]
    : AVATARS[0];
const { formatted, ended } = useSeasonCountdown();
const resetSeason = useSeasonStore((s) => s.resetSeason);

  const season = useSeasonStore((s) => s.season);
const claimSeasonReward = useSeasonStore((s) => s.claimSeasonReward);

const nextClaimableTier =
  season
    ? (() => {
        for (let t = 1; t <= season.tier; t++) {
          if (!season.claimedTiers?.includes(t)) return t;
        }
        return null;
      })()
    : null;

  const level = usePlayerStore((s) => s.level);
const justLeveledUp = usePlayerStore((s) => s.justLeveledUp);
const clearLevelUpFlag = usePlayerStore((s) => s.clearLevelUpFlag);

  const router = useRouter();
 const todayChallenge = useChallengesStore(
  (s) => s.getTodayDailyChallenge()
);
const ensureTodayDailyChallenge = useChallengesStore(
  (s) => s.ensureTodayDailyChallenge
);

useEffect(() => {
  ensureTodayDailyChallenge();
}, []);
useEffect(() => {
  if (!ended) return;

  const uid = auth.currentUser?.uid ?? null;
  if (!uid) return;

  resetSeason(uid);
}, [ended]);

  // -----------------------------
  // PLAYER STATS
  // -----------------------------
  const xp = usePlayerStore((s) => s.xp);
  const rankProgress = getRankProgress(xp);
 
  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);
  const tickets = usePlayerStore((s) => s.tickets);
  const vipTier = usePlayerStore((s) => s.vipTier);
const dailyStreak = usePlayerStore((s) => s.daily?.streak ?? 0);
const lastClaimDate = usePlayerStore((s) => s.daily?.lastClaimDate ?? null);
const todayKey = new Date().toISOString().slice(0, 10);
const weekly = usePlayerStore((s) => s.weekly ?? {
  weekKey: "",
  progress: 0,
  claimed: false,
});

const WEEKLY_TARGET = 5;
const WEEKLY_REWARD = { xp: 300, coins: 100 };


  const achievements = useAchievementsStore((s) => s.achievements);
const activeAchievement = Object.values(achievements).find(
  (a: any) => !a.unlocked
);

  // NEW — dynamic XP curve to match A+++++ PlayerStore
  const xpRequiredForLevel = (lvl: number) => lvl * 150 + lvl * lvl * 6;
  const xpRequired = xpRequiredForLevel(level);

 const xpPercent = xpRequired > 0 ? Math.min(1, xp / xpRequired) : 0;
const xpAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (!justLeveledUp) return;

  const t = setTimeout(() => {
    clearLevelUpFlag();
  }, 3000);

  return () => clearTimeout(t);
}, [justLeveledUp]);


useEffect(() => {
  Animated.timing(xpAnim, {
    toValue: xpPercent,
    duration: 700,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false,
  }).start();
}, [xpPercent]);



  // -----------------------------
  // ANIMATIONS
  // -----------------------------
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const activeAchievement = Object.values(achievements).find(
  (a: any) => !a.unlocked
);


  }, []);

  // -----------------------------
  // ACHIEVEMENT PREVIEW
  // -----------------------------
 const totalAchievements = Object.keys(achievements || {}).length;

  const unlocked = Object.values(achievements).filter((a: any) => a.unlocked)
    .length;

  return (
 <Animated.ScrollView
  style={[styles.container, { opacity: fade }]}
  contentContainerStyle={{
    padding: 22,
    paddingBottom: 60,
  }}
  showsVerticalScrollIndicator={false}
>


      {/* ---------------------------------------------------------------- */}
      {/* TOP ECONOMY BAR (Coins / Gems / Tickets / VIP) */}
      {/* ---------------------------------------------------------------- */}
 <View style={styles.econBar}>
  <Pressable onPress={() => router.push("/profile")}>
    <Image
      source={avatar.asset}
     style={{
  width: 68,
  height: 68,
  borderRadius: 24,
  marginRight: 14,
  borderWidth: 2,
  borderColor: "#F6C453",
}}

    />
  </Pressable>

  <View style={styles.econItem}>
    <Image
      source={require("../../assets/icons/coin.png")}
      style={styles.econIcon}
    />
    <Text style={styles.econText}>{coins}</Text>
  </View>


  <View style={styles.econItem}>
    <Image
      source={require("../../assets/icons/gem.png")}
      style={styles.econIcon}
    />
    <Text style={styles.econText}>{gems}</Text>
  </View>

  <View style={styles.econItem}>
    <Image
      source={require("../../assets/icons/ticket.png")}
      style={styles.econIcon}
    />
    <Text style={styles.econText}>{tickets}</Text>
  </View>

  
</View>


      {/* ---------------------------------------------------------------- */}
      {/* HERO TILE (LEVEL + XP BAR) */}
      {/* ---------------------------------------------------------------- */}
      
  <Pressable
  onLongPress={() => router.push("/leaderboard")}
  delayLongPress={600}
  style={({ pressed }) => pressed && { opacity: 0.85 }}
>
  <View style={styles.heroCard}>
    <Text style={styles.levelLabel}>Level {level}</Text>

    <View style={styles.xpBar}>
     <Animated.View
  style={[
    styles.xpFill,
    {
      width: xpAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
      }),
    },
  ]}
/>

    </View>

    <Text style={styles.xpText}>
      {xp} / {xpRequired} XP
    </Text>

    <Text style={styles.streakText}>
      🔥 Streak: {dailyStreak} day{dailyStreak === 1 ? "" : "s"}
    </Text>
  </View>
</Pressable>
{/* SEASON PROGRESS */}
{season && (
  <View style={styles.todayCard}>
    <Text style={styles.todayTitle}>Season Progress</Text>

    <Text style={styles.todayLabel}>
      Tier {season.tier} • {season.xp} XP
    </Text>

    <View style={styles.rankBar}>
      <View
        style={[
          styles.xpFill,
          {
            width: `${
              season.tier === 0
                ? 0
                : Math.min(
                    1,
                    season.xp /
                      CURRENT_SEASON.tiers[Math.max(season.tier - 1, 0)].xp
                  ) * 100
            }%`,
          },
        ]}
      />
    </View>

    {/* 🔥 NEW — SEASON COUNTDOWN */}
    <SeasonCountdown
      formatted={formatted}
      ended={ended}
    />
  </View>
)}

{/* SEASON REWARD CLAIM (Phase 6.3) */}
{season && nextClaimableTier && (
  <TouchableOpacity
    style={styles.mainBtn}
    activeOpacity={0.9}
    onPress={() => {
      const uid = auth.currentUser?.uid ?? null;
      if (!uid) return;

      claimSeasonReward(uid, nextClaimableTier);
    }}
  >
    <Text style={styles.mainBtnText}>
      Claim Season Reward (Tier {nextClaimableTier})
    </Text>
  </TouchableOpacity>
)}


{/* ---------------------------------------------------------------- */}
{/* TODAY PANEL (Phase 2.0) */}
{/* ---------------------------------------------------------------- */}
<View style={styles.todayCard}>
  <Text style={styles.todayTitle}>Today</Text>

 <View style={styles.todayRow}>
  <Text style={styles.todayLabel}>🎯 Today’s Challenge</Text>

  {todayChallenge ? (
   lastClaimDate === todayKey
 ? (
     <Text style={styles.todayValue}>
  Completed — come back tomorrow 🌙
</Text>

    ) : (
     <TouchableOpacity
  onPress={() => {
    if (lastClaimDate === todayKey) return;

const game = useQuickGameStore.getState();
game.initGame("daily", "daily");
router.push("/(app)/play/game");

  }}
>

        <Text style={[styles.todayValue, { color: "#00E676" }]}>
          Play Now →
        </Text>
      </TouchableOpacity>
    )
  ) : (
    <Text style={styles.todayValue}>Loading…</Text>
  )}
</View>
{/* ---------------------------------------------------------------- */}
{/* WEEKLY CHALLENGE */}
{/* ---------------------------------------------------------------- */}
<View style={styles.todayCard}>
  <Text style={styles.todayTitle}>This Week</Text>

  <View style={styles.todayRow}>
    <Text style={styles.todayLabel}>🗓️ Weekly Challenge</Text>

    <Text style={styles.todayValue}>
      {Math.min(weekly.progress, WEEKLY_TARGET)} / {WEEKLY_TARGET} Dailies
    </Text>
  </View>

  <View style={styles.rankBar}>
    <View
      style={[
        styles.xpFill,
        {
          width: `${Math.min(
            1,
            weekly.progress / WEEKLY_TARGET
          ) * 100}%`,
        },
      ]}
    />
  </View>

  <Text style={styles.rankText}>
    Complete {WEEKLY_TARGET} Daily games this week
  </Text>
  {weekly.progress >= WEEKLY_TARGET && !weekly.claimed && (
  <TouchableOpacity
    style={styles.mainBtn}
    onPress={() =>
      usePlayerStore
        .getState()
        .claimWeeklyReward(WEEKLY_REWARD)
    }
  >
    <Text style={styles.mainBtnText}>
      Claim Weekly Reward
    </Text>
  </TouchableOpacity>
)}

{weekly.claimed && (
  <Text style={[styles.rankText, { color: "#4CAF50" }]}>
    Weekly reward claimed ✓
  </Text>
)}

</View>

  <View style={styles.todayRow}>
    <Text style={styles.todayLabel}>⏰ Next Event</Text>
    <Text style={styles.todayValue}>In 12h 34m</Text>
  </View>
  {rankProgress.next && (
  <View style={{ marginTop: 12 }}>
    <Text style={styles.todayLabel}>
      {rankProgress.current.name} → {rankProgress.next.name}
    </Text>

    <View style={styles.rankBar}>
     <Animated.View
  style={[
    styles.xpFill,
    {
      width: xpAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
      }),
    },
  ]}
/>

    </View>

    <Text style={styles.rankText}>
      {rankProgress.remaining} XP to {rankProgress.next.name}
    </Text>
  </View>
)}

{justLeveledUp && (
  <View style={styles.levelUpOverlay}>
    <View style={styles.levelUpCard}>
      <Text style={styles.levelUpTitle}>Level Up!</Text>
      <Text style={styles.levelUpText}>You reached Level {level}</Text>
    </View>
  </View>
)}


</View>

      {/* ---------------------------------------------------------------- */}
      {/* MAIN BUTTONS */}
      {/* ---------------------------------------------------------------- */}
    <TouchableOpacity
  style={styles.mainBtn}
  activeOpacity={0.9}
  onPress={() => router.push("./play/(screens)/quick")}
>
  <Text style={styles.mainBtnText}>Quick Play</Text>
<Text style={styles.mainHint}>Fast • Fun • No Pressure</Text>

</TouchableOpacity>
<View style={{ marginBottom: 18 }}>

 <HubTile
  label="Arena · Competitive"
  icon={require("@assets/icons/arena.png")}
  color="#3DDC97"
  onPress={() => router.push("./arena_reset")}
/>

</View>
{/* SEASON HISTORY */}
<TouchableOpacity
  style={styles.secondaryBtn}
  onPress={() => router.push("/seasons/history")}
>
  <Text style={styles.secondaryBtnText}>
    🏆 Season History
  </Text>
</TouchableOpacity>

{/* DAILY REWARD */}
<View style={styles.boxRow}>
  <Pressable
    style={styles.smallBox}
    onPress={() => router.push("./daily")}
  >
    <Text style={styles.boxTitle}>Daily</Text>
    <Text style={styles.boxSub}>Rewards · Streak</Text>
 {usePlayerStore.getState().daily?.lastClaimDate !==
  new Date().toISOString().slice(0, 10) && (
  <View style={styles.badge} />
)}


  </Pressable>

  <Pressable
    style={styles.smallBox}
    onPress={() => router.push("/more")}
  >
    <Text style={styles.boxTitle}>More</Text>
    <Text style={styles.boxSub}>Profile · Store</Text>
  </Pressable>
</View>


{activeAchievement && (
  <TouchableOpacity
    style={styles.achievementTeaser}
    onPress={() => router.push("./achievements")}
    activeOpacity={0.85}
  >
    <Text style={styles.achievementTitle}>
      🎯 Achievement in progress
    </Text>
    <Text style={styles.achievementText}>
      {(ACHIEVEMENT_META[activeAchievement.id]?.title ??
        activeAchievement.id)}{" "}
      — {activeAchievement.progress} / {activeAchievement.target}
    </Text>
  </TouchableOpacity>
)}

    
    </Animated.ScrollView>

  );
}
// ----------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#101623",
},

/* TOP ECONOMY BAR */
econBar: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  marginTop: 10,
  marginBottom: 14,
},

levelUpOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.35)",
},

levelUpCard: {
  backgroundColor: "#111827",
  paddingVertical: 20,
  paddingHorizontal: 28,
  borderRadius: 16,
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 6,
},

levelUpTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#FACC15",
  marginBottom: 6,
},

levelUpText: {
  fontSize: 14,
  color: "#E5E7EB",
},


todayCard: {
  backgroundColor: "#1D2438",
  padding: 12,
  borderRadius: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: "#222",
},

utilityTile: {
  backgroundColor: "#1A2032",
  padding: 16,
  borderRadius: 16,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "#333",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
utilityTitle: {
  fontSize: 17,
  fontWeight: "800",
  color: "#F5C451",
},
utilitySub: {
  marginTop: 4,
  fontSize: 13,
  fontWeight: "600",
  color: "#999",
},

rankBar: {
  height: 10,
  backgroundColor: "#333",
  borderRadius: 6,
  overflow: "hidden",
  marginTop: 6,
},

rankFill: {
  height: "100%",
  backgroundColor: "#F5B942",
},
mainHint: {
  marginTop: 4,
  textAlign: "center",
  fontSize: 12,
  fontWeight: "600",
  color: "#2B2F36",
  opacity: 0.7,
},


rankText: {
  marginTop: 4,
  fontSize: 13,
  fontWeight: "700",
  color: "#F5B942",
},

todayTitle: {
  fontSize: 18,
  fontWeight: "800",
  color: "#F5B942",
  marginBottom: 12,
},

todayRow: {
  flexDirection: "column",
  gap: 4,
  marginBottom: 8,
},


todayLabel: {
  fontSize: 12,
  fontWeight: "600",
  color: "#E5E7EB",
},

todayValue: {
  fontSize: 12,
  fontWeight: "700",
  color: "#F5B942",
},


achievementTeaser: {
  marginTop: 16,
  padding: 14,
  borderRadius: 14,
  backgroundColor: "#1A2032",
  borderWidth: 1,
  borderColor: "#333",
},

achievementTitle: {
  fontSize: 14,
  fontWeight: "800",
  color: "#F5B942",
  marginBottom: 4,
},

achievementText: {
  fontSize: 13,
  color: "#ccc",
},


dailySubText: {
  marginTop: 4,
  fontSize: 13,
  fontWeight: "600",
  color: "#9AA3B2",
},

econItem: {
  flexDirection: "row",
  alignItems: "center",
  marginLeft: 16,
},

econIcon: {
  width: 28,
  height: 28,
  resizeMode: "contain",
  marginRight: 6,
},

econText: {
  color: "#F5B942",
  fontSize: 18,
  fontWeight: "800",
},

  vipBadge: {
    backgroundColor: "#F5B942",
    marginLeft: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  vipText: {
    fontWeight: "800",
    color: "#000",
    fontSize: 14,
  },

  /* HERO CARD */
  heroCard: {
    backgroundColor: "#1A2032",
    padding: 15,
    borderRadius: 16,
    marginBottom: 18,
    borderColor: "rgba(255, 200, 61, 0.55)",
    borderWidth: 1,
  },

  levelLabel: {
    color: "#F5B942",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },

  xpBar: {
  height: 14,
  backgroundColor: "#2A3147",
  borderRadius: 8,
  overflow: "hidden",
  marginBottom: 7,
},

 xpFill: {
  height: "100%",
  backgroundColor: "#F5B942",
},


  xpText: {
    color: "#F5B942",
    fontSize: 10,
    textAlign: "right",
  },

  /* MAIN BUTTON */
  mainBtn: {
  backgroundColor: "#E6B83F",
  paddingVertical: 14,
  borderRadius: 18,
  marginBottom: 15,
},

mainBtnText: {
  textAlign: "center",
  fontSize: 17,
  fontWeight: "800",
  color: "#111827",
},


  /* SECONDARY BUTTONS */
secondaryBtn: {
  backgroundColor: "#1A1A1A",
  paddingVertical: 14,
  borderRadius: 14,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: "#333",
},


  secondaryBtnText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#E5E7EB",
  },

  footerText: {
    marginTop: 30,
    textAlign: "center",
    color: "#555",
    fontSize: 12,
  },
  dailyBtn: {
  backgroundColor: "#222",
  paddingVertical: 14,
  borderRadius: 14,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: "#444",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
},

boxRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 22,
},


smallBox: {
  width: "48%",
  height: 96,
  backgroundColor: "#1A2032",
  paddingVertical: 14,
  paddingHorizontal: 12,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#333",
  justifyContent: "center",
  position: "relative",
  shadowColor: "#000",
shadowOpacity: 0.25,
shadowRadius: 6,
elevation: 3,

},

boxTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: "#F5B942",
  marginBottom: 4,
  textAlign: "center",
},

boxSub: {
  fontSize: 12,
  fontWeight: "600",
  color: "#9AA3B2",
  textAlign: "center",
},


badge: {
  width: 12,
  height: 12,
  backgroundColor: "#FF3B30",
  borderRadius: 6,
  position: "absolute",
  right: 16,
  top: 12,
},
streakText: {
  color: "#F5B942",
  fontSize: 12,
  fontWeight: "700",
  marginTop: 6,
  textAlign: "right",
},

});

