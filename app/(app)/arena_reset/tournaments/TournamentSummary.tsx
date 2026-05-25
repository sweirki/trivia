import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";

const tournamentResultHero = require("../../../../assets/images/arena/tournaments/tournament_result_hero.webp");
const tournamentPrestigePanel = require("../../../../assets/images/arena/tournaments/tournament_prestige_panel.webp");

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { feedback } from "@/feedback";

import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { getPlacementLabel, getTournamentPlacementReward } from "@/arena/tournaments/tournamentPrestige";

function safeName(uid: string, name?: string) {
  if (name && name.trim().length > 0) return name.trim();
  if (uid.startsWith("bot")) return "Arena Rival";
  if (uid.length <= 10) return uid;
  return `Player ${uid.slice(0, 4).toUpperCase()}`;
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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const summary = useMemo(() => {
    if (!isReady || !tournament || !bracket) return null;

    const playersByUid = new Map(
      tournament.players.map((p) => [p.uid, p.username])
    );

    const allMatches = [
      ...bracket.qualifiers,
      ...bracket.semifinals,
      ...(bracket.final ? [bracket.final] : []),
    ];

    const winCount = new Map<string, number>();

    tournament.players.forEach((p) => winCount.set(p.uid, 0));

    allMatches.forEach((m) => {
      if (m.playerAUid && !winCount.has(m.playerAUid)) {
        winCount.set(m.playerAUid, 0);
      }
      if (m.playerBUid && !winCount.has(m.playerBUid)) {
        winCount.set(m.playerBUid, 0);
      }
      if (m.winnerUid) {
        winCount.set(m.winnerUid, (winCount.get(m.winnerUid) ?? 0) + 1);
      }
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

    const championUid = tournament.winnerUid ?? standings[0]?.uid ?? "";
    const championName = safeName(championUid, playersByUid.get(championUid));
    const userIsChampion = Boolean(currentUid && championUid === currentUid);
    const totalPlayers = Math.max(tournament.players.length, standings.length, 2);
    const championReward = getTournamentPlacementReward(1, totalPlayers, tournament.config?.rewardCoins ?? 100);
    const userStanding = standings.find((player) => player.uid === currentUid) ?? null;

    return {
      championName,
      userIsChampion,
      totalPlayers,
      rewardCoins: championReward.coins,
      rewardXp: championReward.xp,
      rewardTokens: championReward.arenaTokens,
      rewardBadge: championReward.badge,
      userStanding,
      entryFeeCoins: tournament.config?.entryFeeCoins ?? 50,
      tournamentName: tournament.name || cupName(totalPlayers),
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
    resetTournament();
    router.replace("/(app)/arena_reset");
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
          <Text style={styles.trophySlot}>🏆</Text>
          <Text style={styles.title}>
            {summary.userIsChampion ? "You Are Champion" : "Tournament Complete"}
          </Text>
          <Text style={styles.subtitle}>{summary.cupTitle}</Text>
        </ImageBackground>

        <View style={styles.championCard}>
          <Text style={styles.cardEyebrow}>CHAMPION CROWN</Text>
          <View style={styles.crownSlot}>
            <Text style={styles.crownIcon}>👑</Text>
          </View>
          <Text style={styles.championName}>{summary.championName}</Text>
          <Text style={styles.championText}>
            {summary.userIsChampion
              ? "You conquered the bracket and claimed the spotlight. This win becomes part of your Arena prestige."
              : "The bracket has a champion. Return to the next live cup and take the crown back."}
          </Text>
        </View>

        <View style={styles.rewardCard}>
          <Text style={styles.cardTitle}>Reward Reveal</Text>
          <View style={styles.rewardRow}>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardIcon}>🪙</Text>
              <Text style={styles.rewardValue}>{summary.rewardCoins}</Text>
              <Text style={styles.rewardLabel}>Coins</Text>
            </View>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardIcon}>⭐</Text>
              <Text style={styles.rewardValue}>+{summary.rewardXp}</Text>
              <Text style={styles.rewardLabel}>Arena XP</Text>
            </View>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardIcon}>🎖️</Text>
              <Text style={styles.rewardValue}>{summary.rewardBadge}</Text>
              <Text style={styles.rewardLabel}>Prestige</Text>
            </View>
          </View>
          <Text style={styles.noteText}>
            Champion reward: {summary.rewardCoins} coins, {summary.rewardXp} XP, {summary.rewardTokens} Arena Tokens. Placement rewards now scale by bracket size.
          </Text>
          {summary.userStanding ? (
            <Text style={styles.noteText}>
              Your finish: {summary.userStanding.placementLabel} • {summary.userStanding.reward.summary}
            </Text>
          ) : null}
        </View>

        <View style={styles.standingsCard}>
          <Text style={styles.cardTitle}>Final Standings</Text>
          {summary.standings.map((player) => (
            <View key={`${player.uid}-${player.position}`} style={styles.row}>
              <Text
                style={[
                  styles.position,
                  player.position === 1 && styles.gold,
                  player.position === 2 && styles.silver,
                  player.position === 3 && styles.bronze,
                ]}
              >
                {player.position}
              </Text>
              <View style={styles.playerMeta}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerSub}>{player.placementLabel} • {player.wins} match win{player.wins === 1 ? "" : "s"} • {player.reward.coins} coins</Text>
              </View>
              {player.position === 1 && <Text style={styles.rowBadge}>CROWNED</Text>}
            </View>
          ))}
        </View>

        <ImageBackground source={tournamentPrestigePanel} imageStyle={styles.seasonImage} style={styles.seasonCard}>
          <View style={styles.seasonShade} />
          <Text style={styles.seasonTitle}>Season Prestige</Text>
          <Text style={styles.seasonText}>
            Tournament finishes now feed placement identity, champion/finalist titles, bracket history, and future seasonal seeding.
          </Text>
        </ImageBackground>

        <TouchableOpacity style={styles.exitBtn} onPress={handleExit} activeOpacity={0.9}>
          <Text style={styles.exitText}>Return to Arena</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050716",
  },
  content: {
    paddingTop: 46,
    paddingHorizontal: 16,
    paddingBottom: 190,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050716",
    padding: 24,
  },
  error: {
    color: "#C9C9D6",
    fontSize: 16,
    marginBottom: 18,
    textAlign: "center",
  },
  hero: {
    overflow: "hidden",
    borderRadius: 22,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,213,79,0.35)",
    marginBottom: 16,
  },
  heroImage: {
    borderRadius: 22,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 20, 0.44)",
  },
  seasonImage: {
    borderRadius: 18,
  },
  seasonShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(18, 14, 10, 0.52)",
  },

  eyebrow: {
    color: "#D6A93A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  trophySlot: {
    fontSize: 40,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  championCard: {
    backgroundColor: "#151724",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  cardEyebrow: {
    color: "#D6A93A",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  crownSlot: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,213,79,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,213,79,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  crownIcon: {
    fontSize: 30,
  },
  championName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  championText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  rewardCard: {
    backgroundColor: "#111421",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,213,79,0.15)",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
  },
  rewardRow: {
    flexDirection: "row",
    gap: 10,
  },
  rewardBox: {
    flex: 1,
    backgroundColor: "#1A1C2A",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  rewardIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  rewardValue: {
    color: "#D6A93A",
    fontSize: 15,
    fontWeight: "900",
  },
  rewardLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  noteText: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  standingsCard: {
    backgroundColor: "#151724",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  position: {
    width: 34,
    color: "#AEB0C2",
    fontSize: 19,
    fontWeight: "900",
  },
  gold: { color: "#D6A93A" },
  silver: { color: "#B9C1CB" },
  bronze: { color: "#D89B5E" },
  playerMeta: {
    flex: 1,
  },
  playerName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  playerSub: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 12,
    marginTop: 2,
  },
  rowBadge: {
    color: "#0B1020",
    backgroundColor: "#D6A93A",
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  seasonCard: {
    overflow: "hidden",
    backgroundColor: "rgba(255,213,79,0.10)",
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: "rgba(255,213,79,0.25)",
    marginBottom: 18,
  },
  seasonTitle: {
    color: "#D6A93A",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  seasonText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 17,
  },
  exitBtn: {
    backgroundColor: "#D6A93A",
    borderWidth: 1,
    borderColor: "rgba(255,231,158,0.42)",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  exitText: {
    color: "#0B1020",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryBtn: {
    backgroundColor: "#D6A93A",
    borderWidth: 1,
    borderColor: "rgba(255,231,158,0.42)",
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 22,
  },
  secondaryText: {
    color: "#0B1020",
    fontWeight: "900",
  },
});



