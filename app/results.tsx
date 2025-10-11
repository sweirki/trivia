// app/results.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "../src/lib/theme";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateGlobalScore } from "../src/lib/leaderboardEngine";
import { updatePlayerAchievements } from "../src/lib/achievementsEngine";
import {
  updatePlayerRank,
  getPlayerRankData,
  rankColor,
} from "../src/lib/rankEngine";
import { MotiView, MotiText } from "moti";
import ConfettiCannon from "react-native-confetti-cannon";
import { playSound } from "../src/lib/soundManager";
import { showRewarded } from "../src/lib/adsManager"; // ✅ injected import

// 🔊 Sound assets
const rankupSfx = require("../assets/sfx/rankup.mp3");
const xpTickSfx = require("../assets/sfx/xp_tick.mp3");
const uiClickSfx = require("../assets/sfx/ui_click.mp3");

/**
 *  ResultsScreen – Phase 6.3 with Rewarded Ads + Bonus XP
 */
export default function ResultsScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(true);
  const [rank, setRank] = useState<string>("—");
  const [xp, setXP] = useState<number>(0);
  const [prevRank, setPrevRank] = useState<string>("—");
  const [prevXP, setPrevXP] = useState<number>(0);
  const [rankUp, setRankUp] = useState<boolean>(false);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(false); // ✅ new state

  useEffect(() => {
    const loadResults = async () => {
      try {
        const storedScore = await AsyncStorage.getItem("lastScore");
        const storedStreak = await AsyncStorage.getItem("lastStreak");
        const storedName = await AsyncStorage.getItem("username");
        const uid = await AsyncStorage.getItem("uid");
        const country = await AsyncStorage.getItem("country");

        const finalScore = storedScore ? parseInt(storedScore) : 0;
        const finalStreak = storedStreak ? parseInt(storedStreak) : 0;
        setUsername(storedName ?? "Guest");
        setScore(finalScore);
        setStreak(finalStreak);

        if (uid && storedName) {
          const oldRankData = await getPlayerRankData(uid);
          if (oldRankData) {
            setPrevRank(oldRankData.rank);
            setPrevXP(oldRankData.xp);
          }

          await updateGlobalScore(
            uid,
            storedName,
            finalScore,
            finalStreak,
            country ?? "Unknown"
          );
          await updatePlayerAchievements(uid, finalScore, finalStreak);
          await updatePlayerRank(uid, finalScore, finalStreak);

          const newRankData = await getPlayerRankData(uid);
          if (newRankData) {
            setRank(newRankData.rank);
            setXP(newRankData.xp);
            if (oldRankData && newRankData.rank !== oldRankData.rank) {
              setRankUp(true);
              playSound(rankupSfx);
            }
          }
        }
      } catch (err) {
        console.error("Error updating results:", err);
      } finally {
        setSaving(false);
      }
    };
    loadResults();
  }, []);

  // ✅ grantReward handles the bonus after ad completes
  const grantReward = async () => {
    try {
      if (bonusClaimed) return;
      setBonusClaimed(true);
      const bonus = 100;
      const newXP = xp + bonus;
      setXP(newXP);
      playSound(rankupSfx);
      Alert.alert("🎁 Bonus XP", `You earned +${bonus} XP for watching the ad!`);
      const uid = await AsyncStorage.getItem("uid");
      if (uid) await updatePlayerRank(uid, bonus, 0);
    } catch (err) {
      console.error("Reward error:", err);
    }
  };

  const handleWatchAd = async () => {
    playSound(uiClickSfx);
    try {
      await showRewarded(() => grantReward());
    } catch (err) {
      Alert.alert("Ad Unavailable", "Please try again later.");
      console.error("Rewarded ad error:", err);
    }
  };

  if (saving)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.saving}>Uploading your results...</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>🏁 Match Results</Text>
        <Text style={styles.username}>{username}</Text>

        {rankUp && <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut />}

        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            shadowOpacity: rankUp ? 0.7 : 0.3,
          }}
          transition={{ type: "timing", duration: 600 }}
          style={[
            styles.rankRing,
            { borderColor: rankColor(rank), shadowColor: rankColor(rank) },
          ]}
        >
          <MotiText
            from={{ scale: 0.8 }}
            animate={{ scale: rankUp ? 1.15 : 1 }}
            transition={{ loop: rankUp, type: "timing", duration: 1000 }}
            style={[styles.rankText, { color: rankColor(rank) }]}
          >
            {rank}
          </MotiText>

          <AnimatedXP targetXP={xp} prevXP={prevXP} color={rankColor(rank)} />
        </MotiView>

        <View style={styles.panel}>
          <Text style={styles.label}>Final Score</Text>
          <Text style={styles.score}>{score}</Text>

          <Text style={styles.label}>Streak</Text>
          <Text style={styles.streak}>{streak}</Text>

          <Text style={styles.label}>Rank Progress</Text>
          <Text style={[styles.rank, { color: rankColor(rank) }]}>
            {prevRank !== rank
              ? `${prevRank} → ${rank} (${xp} XP)`
              : `${rank} (${xp} XP)`}
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryHeader}>📊 Summary</Text>
          <Text style={styles.summaryText}>
            {username} scored <Text style={styles.bold}>{score}</Text> points and achieved a{" "}
            <Text style={styles.bold}>{streak}</Text> streak.
          </Text>
          {prevRank !== rank ? (
            <Text style={styles.rankUp}>
              🎉 Rank Up! You advanced from {prevRank} to {rank}!
            </Text>
          ) : (
            <Text style={styles.rankHold}>⚡ XP increased to {xp}.</Text>
          )}
        </View>

        {/* ✅ Rewarded Ad Button */}
        {!bonusClaimed && (
          <TouchableOpacity style={[styles.button, { backgroundColor: "#FFD700" }]} onPress={handleWatchAd}>
            <Text style={[styles.btnText, { color: "#000" }]}>🎁 Watch Ad for Bonus XP</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            playSound(uiClickSfx);
            router.push("/leaderboard");
          }}
        >
          <Text style={styles.btnText}>🌍 View Global Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={() => {
            playSound(uiClickSfx);
            router.push("/");
          }}
        >
          <Text style={styles.btnText}>🏠 Return Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/** 🔢 Animated XP Count-Up with Tick Sound */
function AnimatedXP({
  targetXP,
  prevXP,
  color,
}: {
  targetXP: number;
  prevXP: number;
  color: string;
}) {
  const [displayXP, setDisplayXP] = useState(prevXP);

  useEffect(() => {
    let frame: number;
    const step = () => {
      setDisplayXP((xp) => {
        if (xp < targetXP) {
          playSound(xpTickSfx);
          return Math.min(targetXP, xp + Math.ceil((targetXP - prevXP) / 40));
        }
        cancelAnimationFrame(frame);
        return xp;
      });
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [targetXP]);

  return <MotiText style={[styles.xpText, { color }]}>{displayXP} XP</MotiText>;
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center" },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 12,
  },
  username: { fontSize: 22, color: theme.colors.text, marginBottom: 24 },
  rankRing: {
    borderWidth: 4,
    borderRadius: 120,
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    shadowRadius: 10,
    shadowOpacity: 0.3,
    marginBottom: 20,
  },
  rankText: { fontSize: 28, fontWeight: "bold" },
  xpText: { fontSize: 16, fontWeight: "600", marginTop: 6 },
  panel: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 16,
    width: "90%",
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  label: { fontSize: 16, color: theme.colors.subtext, marginTop: 4 },
  score: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.success,
    marginVertical: 4,
  },
  streak: {
    fontSize: 22,
    fontWeight: "600",
    color: theme.colors.accent,
    marginBottom: 8,
  },
  rank: { fontSize: 20, fontWeight: "bold", marginTop: 4 },
  summaryBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 18,
    width: "90%",
    marginBottom: 30,
  },
  summaryHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 8,
  },
  summaryText: { fontSize: 16, color: theme.colors.text, lineHeight: 22 },
  rankUp: {
    fontSize: 16,
    color: theme.colors.success,
    marginTop: 10,
    textAlign: "center",
  },
  rankHold: {
    fontSize: 15,
    color: theme.colors.subtext,
    marginTop: 10,
    textAlign: "center",
  },
  bold: { fontWeight: "700" },
  saving: { fontSize: 16, color: theme.colors.subtext, marginTop: 12 },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginVertical: 8,
  },
  btnText: { color: theme.colors.buttonText, fontSize: 16, fontWeight: "bold" },
});
