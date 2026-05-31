import React, { useEffect, useMemo, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, ImageBackground } from "react-native";

const tournamentResultHero = require("../../../../assets/images/arena/tournaments/tournament_result_hero.webp");
const tournamentPrestigePanel = require("../../../../assets/images/arena/tournaments/tournament_prestige_panel.webp");

import { router } from "expo-router";
import { feedback } from "@/feedback";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { getPlacementLabel, getTournamentPlacementReward } from "@/arena/tournaments/tournamentPrestige";

function safeName(uid: string, name?: string) {
  if (name && name.trim().length > 0 && !/bot/i.test(name)) return name.trim();
  if (uid.startsWith("bot")) return "Arena Rival";
  if (uid.length <= 10 && uid !== "guest-player") return uid;
  return "Player";
}

function cupName(playerCount: number) {
  if (playerCount >= 8) return "Grand Arena Cup";
  if (playerCount >= 4) return "Silver Clash Cup";
  return "Bronze Duel Cup";
}

export default function TournamentSummary() {
  const tournament = useTournamentStore((s) => s.tournament);
  const bracket = useTournamentStore((s) => s.bracket);
  const lifecycle = useTournamentStore((s) => s.lifecycle);
  const resetTournament = useTournamentStore((s) => s.resetTournament);
  const currentUid = usePlayerStore((s) => (s as any).uid);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasExitedRef = useRef(false);
  const feedbackPlayedRef = useRef(false);
  const isReady = !!tournament && !!bracket && lifecycle === "COMPLETED";

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 520, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const summary = useMemo(() => {
    if (!isReady || !tournament || !bracket) return null;

    const playersByUid = new Map(tournament.players.map((p) => [p.uid, p.username]));
    const allMatches = [...bracket.qualifiers, ...bracket.semifinals, ...(bracket.final ? [bracket.final] : [])];
    const winCount = new Map<string, number>();

    tournament.players.forEach((p) => winCount.set(p.uid, 0));
    allMatches.forEach((m) => {
      if (m.playerAUid && !winCount.has(m.playerAUid)) winCount.set(m.playerAUid, 0);
      if (m.playerBUid && !winCount.has(m.playerBUid)) winCount.set(m.playerBUid, 0);
      if (m.winnerUid) winCount.set(m.winnerUid, (winCount.get(m.winnerUid) ?? 0) + 1);
    });

    const standings = Array.from(winCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([uid, wins], index) => {
        const position = index + 1;
        return {
          uid,
          wins,
          position,
          name: safeName(uid, playersByUid.get(uid)),
          placementLabel: getPlacementLabel(position),
          reward: getTournamentPlacementReward(position, Math.max(tournament.players.length, winCount.size, 2), tournament.config?.rewardCoins ?? 100),
        };
      });

    const humanPlayers = tournament.players.filter((p) => !p.uid.startsWith("bot-"));
    const resolvedCurrentUid = humanPlayers.length === 1 ? humanPlayers[0].uid : currentUid;
    const championUid = tournament.winnerUid ?? standings[0]?.uid ?? "";
    const championName = safeName(championUid, playersByUid.get(championUid));
    const userIsChampion = Boolean(resolvedCurrentUid && championUid === resolvedCurrentUid);
    const totalPlayers = Math.max(tournament.players.length, standings.length, 2);
    const championReward = getTournamentPlacementReward(1, totalPlayers, tournament.config?.rewardCoins ?? 100);
    const userStanding = standings.find((player) => player.uid === resolvedCurrentUid) ?? null;

    return {
      championName,
      userIsChampion,
      rewardCoins: championReward.coins,
      rewardXp: championReward.xp,
      rewardTokens: championReward.arenaTokens,
      rewardBadge: championReward.badge,
      userStanding,
      cupTitle: cupName(totalPlayers),
      standings,
    };
  }, [bracket, currentUid, isReady, tournament]);

  useEffect(() => {
    if (!summary || feedbackPlayedRef.current) return;
    feedbackPlayedRef.current = true;
    summary.userIsChampion ? feedback.tournamentWin() : feedback.reward();
  }, [summary]);

  const handleExit = () => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    feedback.tap();
    router.replace("/(app)/arena_reset");
    setTimeout(() => resetTournament(), 0);
  };

  if (!isReady || !summary) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Tournament summary unavailable.</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleExit} activeOpacity={0.72}>
          <Text style={styles.secondaryText}>Return to Arena</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={tournamentResultHero} imageStyle={styles.heroImage} style={styles.hero}>
          <View style={styles.heroShade} />
          <Text style={styles.eyebrow}>LIVE EVENT COMPLETE</Text>
          <Text style={styles.title}>{summary.userIsChampion ? "You Are Champion" : "Tournament Complete"}</Text>
          <Text style={styles.subtitle}>🏆 {summary.cupTitle}</Text>
        </ImageBackground>

        <View style={styles.championCard}>
          <View style={styles.crownSlot}><Text style={styles.crownIcon}>👑</Text></View>
          <View style={styles.championCopy}>
            <Text style={styles.cardEyebrow}>CHAMPION CROWN</Text>
            <Text style={styles.championName}>{summary.championName}</Text>
            <Text style={styles.championText}>{summary.userIsChampion ? "Champion Path conquered. Prestige updated." : "The Champion Path has a winner."}</Text>
          </View>
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.cardTitle}>Champion Rewards</Text>
          <View style={styles.rewardStrip}>
            <Text style={styles.rewardItem}>🪙 {summary.rewardCoins}</Text>
            <Text style={styles.rewardItem}>⭐ +{summary.rewardXp}</Text>
            <Text style={styles.rewardItem}>🎖️ {summary.rewardBadge}</Text>
          </View>
          <Text style={styles.noteText}>+{summary.rewardTokens} Arena Tokens • Placement rewards updated</Text>
          {summary.userStanding ? <Text style={styles.noteText}>Your finish: {summary.userStanding.placementLabel} • {summary.userStanding.reward.summary}</Text> : null}
        </View>

        <View style={styles.standingsCard}>
          <Text style={styles.cardTitle}>Final Standings</Text>
          {summary.standings.map((player) => (
            <View key={`${player.uid}-${player.position}`} style={styles.row}>
              <Text style={[styles.position, player.position === 1 && styles.gold, player.position === 2 && styles.silver, player.position === 3 && styles.bronze]}>{player.position}</Text>
              <View style={styles.playerMeta}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerSub}>{player.placementLabel} • {player.wins} win{player.wins === 1 ? "" : "s"} • {player.reward.coins} coins</Text>
              </View>
              {player.position === 1 ? <Text style={styles.rowBadge}>CROWNED</Text> : null}
            </View>
          ))}
        </View>

        <ImageBackground source={tournamentPrestigePanel} imageStyle={styles.seasonImage} style={styles.seasonCard}>
          <View style={styles.seasonShade} />
          <Text style={styles.seasonTitle}>Season Prestige</Text>
          <Text style={styles.seasonText}>Champion Path history and future seasonal seeding updated.</Text>
        </ImageBackground>

        <TouchableOpacity style={styles.exitBtn} onPress={handleExit} activeOpacity={0.9}>
          <Text style={styles.exitText}>Return to Arena</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#071426" },
  content: { paddingTop: 74, paddingHorizontal: 16, paddingBottom: 170 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#071426", padding: 24 },
  error: { color: "#C9C9D6", fontSize: 16, marginBottom: 18, textAlign: "center" },
  hero: { overflow: "hidden", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "rgba(126,231,255,0.35)", marginBottom: 12 },
  heroImage: { borderRadius: 22 },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5, 8, 20, 0.46)" },
  eyebrow: { color: "#7FE7FF", fontSize: 12, fontWeight: "900", letterSpacing: 1.4, marginBottom: 8 },
  title: { color: "#FFFFFF", fontSize: 27, fontWeight: "900" },
  subtitle: { color: "rgba(255,255,255,0.78)", fontSize: 15, fontWeight: "800", marginTop: 6 },
  championCard: { backgroundColor: "rgba(10, 24, 44, 0.94)", borderRadius: 18, padding: 13, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(126,231,255,0.14)", marginBottom: 12 },
  cardEyebrow: { color: "#7FE7FF", fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginBottom: 4 },
  crownSlot: { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(126,231,255,0.12)", borderWidth: 1, borderColor: "rgba(126,231,255,0.35)", alignItems: "center", justifyContent: "center", marginRight: 13 },
  crownIcon: { fontSize: 26 },
  championCopy: { flex: 1 },
  championName: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginBottom: 4 },
  championText: { color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 19 },
  rewardCard: { backgroundColor: "rgba(8, 22, 40, 0.94)", borderRadius: 18, padding: 13, marginBottom: 12, borderWidth: 1, borderColor: "rgba(126,231,255,0.15)" },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900", marginBottom: 10 },
  rewardStrip: { flexDirection: "row", gap: 8 },
  rewardItem: { flex: 1, color: "#7FE7FF", backgroundColor: "rgba(18, 34, 58, 0.88)", borderRadius: 12, paddingVertical: 11, textAlign: "center", fontSize: 13, fontWeight: "900", overflow: "hidden" },
  noteText: { color: "rgba(255,255,255,0.60)", fontSize: 12, lineHeight: 16, marginTop: 7 },
  standingsCard: { backgroundColor: "rgba(10, 24, 44, 0.94)", borderRadius: 18, padding: 13, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  position: { width: 30, color: "#AEB0C2", fontSize: 18, fontWeight: "900" },
  gold: { color: "#7FE7FF" },
  silver: { color: "#B9C1CB" },
  bronze: { color: "#D89B5E" },
  playerMeta: { flex: 1 },
  playerName: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  playerSub: { color: "rgba(255,255,255,0.60)", fontSize: 12, marginTop: 2 },
  rowBadge: { color: "#0B1020", backgroundColor: "#7FE7FF", fontSize: 10, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  seasonCard: { overflow: "hidden", backgroundColor: "rgba(126,231,255,0.10)", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(126,231,255,0.25)", marginBottom: 14 },
  seasonImage: { borderRadius: 16 },
  seasonShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(18, 14, 10, 0.46)" },
  seasonTitle: { color: "#7FE7FF", fontSize: 15, fontWeight: "900", marginBottom: 4 },
  seasonText: { color: "rgba(255,255,255,0.72)", fontSize: 12, lineHeight: 17 },
  exitBtn: { backgroundColor: "#2F8FC6", borderWidth: 1, borderColor: "rgba(143,216,255,0.50)", borderRadius: 16, paddingVertical: 12, alignItems: "center" },
  exitText: { color: "#04111E", fontSize: 15, fontWeight: "900" },
  secondaryBtn: { backgroundColor: "#2F8FC6", borderWidth: 1, borderColor: "rgba(143,216,255,0.50)", borderRadius: 16, paddingVertical: 13, paddingHorizontal: 22 },
  secondaryText: { color: "#04111E", fontWeight: "900" },
});
