// /app/(app)/hub/index.tsx — A+++++ HOME HUB
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ACHIEVEMENT_META } from "@/data/achievementMeta";
import { useDailyRewardStore } from "@/store/useDailyRewardStore";

import { usePlayerStore } from "@/store/usePlayerStore";
import { useAchievementsStore } from "@/store/achievementsStore";

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

export default function HubScreen() {
  const router = useRouter();

  // -----------------------------
  // PLAYER STATS
  // -----------------------------
  const xp = usePlayerStore((s) => s.xp);
  const level = usePlayerStore((s) => s.level);
  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);
  const tickets = usePlayerStore((s) => s.tickets);
  const vipTier = usePlayerStore((s) => s.vipTier);
const dailyStreak = usePlayerStore((s) => s.streak);


  const achievements = useAchievementsStore((s) => s.achievements);
const activeAchievement = Object.values(achievements).find(
  (a: any) => !a.unlocked
);

  // NEW — dynamic XP curve to match A+++++ PlayerStore
  const xpRequiredForLevel = (lvl: number) => lvl * 150 + lvl * lvl * 6;
  const xpRequired = xpRequiredForLevel(level);

 const xpPercent = xpRequired > 0 ? Math.min(1, xp / xpRequired) : 0;

// DAILY REWARD BADGE LOGIC
const canClaimDaily = useDailyRewardStore((s) => s.canClaim);
const rewardAvailable = canClaimDaily();

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
    <Animated.View style={[styles.container, { opacity: fade }]}>
      {/* ---------------------------------------------------------------- */}
      {/* TOP ECONOMY BAR (Coins / Gems / Tickets / VIP) */}
      {/* ---------------------------------------------------------------- */}
 <View style={styles.econBar}>
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
      <View style={styles.heroCard}>
        <Text style={styles.levelLabel}>Level {level}</Text>

        <View style={styles.xpBar}>
          <View
            style={[
              styles.xpFill,
              {
                width: `${xpPercent * 100}%`,
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

      {/* ---------------------------------------------------------------- */}
      {/* MAIN BUTTONS */}
      {/* ---------------------------------------------------------------- */}
     <TouchableOpacity
  style={styles.mainBtn}
 onPress={() => router.push("./play/(screens)/quick")}

>
  <Text style={styles.mainBtnText}>Quick Play</Text>
</TouchableOpacity>

<HubTile
  label="Arena"
  icon={require("@assets/icons/arena.png")}   // you choose the icon; I can generate one
  color="#E91E63"                             // nice competitive color
  onPress={() => router.push("./arena_reset")}


/>
      <TouchableOpacity
        style={styles.secondaryBtn}
       onPress={() => router.push("./play/categorySelect")}

      >
        <Text style={styles.secondaryBtnText}>Choose Category</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
       onPress={() => router.push("./achievements")}
      >
        <Text style={styles.secondaryBtnText}>
          Achievements ({unlocked}/{totalAchievements})
        </Text>
      </TouchableOpacity>
{/* DAILY REWARD */}
<TouchableOpacity
  style={styles.dailyBtn}
  onPress={() => router.push("./daily")}
>
  <View style={{ alignItems: "center" }}>
    <Text style={styles.secondaryBtnText}>Daily Reward</Text>
    <Text style={styles.dailySubText}>
      +1 Ticket • Coins • Gems
    </Text>
  </View>

  {rewardAvailable && <View style={styles.badge} />}
</TouchableOpacity>
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


      {/* ---------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ---------------------------------------------------------------- */}
      <Text style={styles.footerText}>Trivia Master • A++++ Edition</Text>
    </Animated.View>
  );
}

// ----------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 22,
  },
/* TOP ECONOMY BAR */
econBar: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  marginTop: 10,
  marginBottom: 24,
},

achievementTeaser: {
  marginTop: 16,
  padding: 14,
  borderRadius: 14,
  backgroundColor: "#111",
  borderWidth: 1,
  borderColor: "#333",
},

achievementTitle: {
  fontSize: 14,
  fontWeight: "800",
  color: "#FFD700",
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
  color: "#999",
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
  color: "#FFD700",
  fontSize: 18,
  fontWeight: "800",
},

  vipBadge: {
    backgroundColor: "#FFD700",
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
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderColor: "#FFD700",
    borderWidth: 1,
  },

  levelLabel: {
    color: "#FFD700",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },

  xpBar: {
    height: 14,
    backgroundColor: "#333",
    borderRadius: 7,
    overflow: "hidden",
    marginBottom: 8,
  },

  xpFill: {
    height: "100%",
    backgroundColor: "#FFD700",
  },

  xpText: {
    color: "#FFD700",
    fontSize: 14,
    textAlign: "right",
  },

  /* MAIN BUTTON */
  mainBtn: {
    backgroundColor: "#FFD700",
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
  },

  mainBtnText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },

  /* SECONDARY BUTTONS */
  secondaryBtn: {
    backgroundColor: "#222",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#444",
  },

  secondaryBtnText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#FFD700",
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
  color: "#FFD700",
  fontSize: 16,
  fontWeight: "700",
  marginTop: 6,
  textAlign: "right",
},

});


