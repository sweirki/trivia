import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ImageBackground } from "react-native";

const tournamentResultHero = require("../../../../assets/images/arena/tournaments/tournament_result_hero.webp");

import { useRouter } from "expo-router";
import { feedback } from "@/feedback";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { TournamentMatch } from "@/arena/types/match";
import { getTournamentRoundPrestige } from "@/arena/tournaments/tournamentPrestige";

function isBotUid(uid?: string | null) {
  return Boolean(uid?.startsWith("bot-"));
}

function safeName(tournament: any, uid?: string | null, fallback?: string | null) {
  if (!uid) return "Player";
  const player = tournament?.players?.find((p: any) => p.uid === uid);
  const name = player?.username?.trim?.();
  if (name && !/bot/i.test(name)) return name;
  if (fallback?.trim?.()) return fallback.trim();
  if (isBotUid(uid)) return "Arena Rival";
  return uid.length > 14 ? "Player" : uid;
}

function getRoundInfo(match: TournamentMatch | null, bracket: any) {
  if (!match || !bracket) return { label: "Tournament", nextLabel: "Next Round", step: 1, total: 3, isFinalMatch: false };
  if (bracket.final?.id === match.id) return { label: "Grand Final", nextLabel: "Champion Ceremony", step: 3, total: 3, isFinalMatch: true };
  if ((bracket.semifinals ?? []).some((m: TournamentMatch) => m.id === match.id)) return { label: "Semifinal", nextLabel: "Grand Final", step: 2, total: 3, isFinalMatch: false };
  return { label: "Qualifier", nextLabel: "Semifinal", step: 1, total: 3, isFinalMatch: false };
}

function getRoundKey(match: TournamentMatch | null, bracket: any): "qualifier" | "semifinal" | "final" {
  if (!match || !bracket) return "qualifier";
  if (bracket.final?.id === match.id) return "final";
  if ((bracket.semifinals ?? []).some((m: TournamentMatch) => m.id === match.id)) return "semifinal";
  return "qualifier";
}

function getCompletedMatches(bracket: any): TournamentMatch[] {
  if (!bracket) return [];
  return [...(bracket.qualifiers ?? []), ...(bracket.semifinals ?? []), ...(bracket.final ? [bracket.final] : [])].filter((m: TournamentMatch) => Boolean(m?.completed));
}

function getMatchTime(match: TournamentMatch) {
  return typeof match.resolvedAt === "number" ? match.resolvedAt : 0;
}

function pickLatestHumanMatch(completed: TournamentMatch[], playerUid: string | null) {
  if (!completed.length) return null;
  if (playerUid) {
    const mine = completed.filter((m) => m.playerAUid === playerUid || m.playerBUid === playerUid);
    if (mine.length) return [...mine].sort((a, b) => getMatchTime(b) - getMatchTime(a))[0];
  }
  const human = completed.filter((m) => !isBotUid(m.playerAUid) || !isBotUid(m.playerBUid));
  if (human.length) return [...human].sort((a, b) => getMatchTime(b) - getMatchTime(a))[0];
  return [...completed].sort((a, b) => getMatchTime(b) - getMatchTime(a))[0];
}

export default function TournamentMatchResult() {
  const router = useRouter();
  const hasContinuedRef = useRef(false);
  const feedbackPlayedRef = useRef(false);

  const bracket = useTournamentStore((s) => s.bracket);
  const tournament = useTournamentStore((s) => s.tournament);
  const rawUid = usePlayerStore((s) => (s as any).uid);
  const displayName = usePlayerStore((s) => (s as any).displayName ?? (s as any).name);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 120);
    return () => clearTimeout(t);
  }, []);

  const playerUid = useMemo(() => {
    if (!tournament) return null;
    const humans = tournament.players?.filter((p: any) => !isBotUid(p.uid)) ?? [];
    if (humans.length === 1) return humans[0].uid;
    if (rawUid && humans.some((p: any) => p.uid === rawUid)) return rawUid;
    return humans[0]?.uid ?? null;
  }, [rawUid, tournament]);

  const match: TournamentMatch | null = useMemo(() => pickLatestHumanMatch(getCompletedMatches(bracket), playerUid), [bracket, playerUid]);

  const youAreA = Boolean(match && playerUid && match.playerAUid === playerUid);
  const yourScore = match ? (youAreA ? match.scoreA : match.scoreB) : 0;
  const opponentScore = match ? (youAreA ? match.scoreB : match.scoreA) : 0;
  const didWin = Boolean(match && playerUid && (match.winnerUid === playerUid || yourScore > opponentScore));
  const round = useMemo(() => getRoundInfo(match, bracket), [match, bracket]);
  const roundKey = useMemo(() => getRoundKey(match, bracket), [match, bracket]);
  const prestige = useMemo(() => getTournamentRoundPrestige(roundKey, didWin, match?.resolutionReason === "tiebreak"), [didWin, match?.resolutionReason, roundKey]);
  const isFinal = tournament?.status === "completed" || round.isFinalMatch;

  useEffect(() => {
    if (!match || !playerUid || feedbackPlayedRef.current) return;
    feedbackPlayedRef.current = true;
    didWin && isFinal ? feedback.tournamentWin() : didWin ? feedback.win() : feedback.loss();
  }, [didWin, isFinal, match, playerUid]);

  const handleContinue = () => {
    if (hasContinuedRef.current) return;
    hasContinuedRef.current = true;
    feedback.tap();
    router.replace(isFinal ? "/(app)/arena_reset/tournaments/TournamentSummary" : "/(app)/arena_reset/tournaments/TournamentBracket");
  };

  if (!tournament || !match || !playerUid) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Match result unavailable</Text>
        <Text style={styles.muted}>Return to the tournament lobby and try again.</Text>
      </View>
    );
  }

  const opponentUid = youAreA ? match.playerBUid : match.playerAUid;
  const playerName = safeName(tournament, playerUid, displayName);
  const rivalName = safeName(tournament, opponentUid);
  const nextText = didWin ? (isFinal ? "Champion ceremony unlocked" : `${round.nextLabel} unlocked`) : "Run ended";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ImageBackground source={tournamentResultHero} imageStyle={styles.heroImage} style={styles.hero}>
        <View style={styles.heroShade} />
        <View style={styles.heroTopRow}>
          <Text style={styles.eyebrow}>LIVE TOURNAMENT</Text>
          <Text style={styles.roundPill}>{round.label}</Text>
        </View>
        <Text style={styles.heroIcon}>{didWin ? "🏆" : "🔥"}</Text>
        <Text style={styles.resultTitle}>{didWin ? prestige.title : "Eliminated"}</Text>
        <Text style={styles.contextText} numberOfLines={2}>{didWin ? prestige.detail : "Re-enter the next cup stronger."}</Text>
      </ImageBackground>

      {show && (
        <>
          <View style={styles.scoreBox}>
            <View style={styles.scoreSide}>
              <Text style={styles.sideTag}>YOU</Text>
              <Text style={styles.scoreLabel} numberOfLines={1}>{playerName}</Text>
              <Text style={styles.scoreNumber}>{yourScore}</Text>
            </View>
            <View style={styles.vsColumn}>
              <Text style={styles.vs}>VS</Text>
              <Text style={didWin ? styles.winMini : styles.lossMini}>{didWin ? "WIN" : "LOSS"}</Text>
            </View>
            <View style={styles.scoreSide}>
              <Text style={styles.sideTag}>RIVAL</Text>
              <Text style={styles.scoreLabel} numberOfLines={1}>{rivalName}</Text>
              <Text style={styles.scoreNumber}>{opponentScore}</Text>
            </View>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelTitle}>Tournament Journey</Text>
              <Text style={styles.stepText}>Round {round.step}/{round.total}</Text>
            </View>
            <View style={styles.pathRow}>
              {[1, 2, 3].map((step) => {
                const active = step <= round.step;
                const current = step === round.step;
                return (
                  <View key={step} style={styles.pathItem}>
                    <View style={[styles.pathDot, active && styles.pathDotActive, current && styles.pathDotCurrent]}>
                      <Text style={styles.pathDotText}>{step}</Text>
                    </View>
                    <Text style={[styles.pathLabel, active && styles.pathLabelActive]}>{step === 1 ? "Qualifier" : step === 2 ? "Semifinal" : "Final"}</Text>
                  </View>
                );
              })}
            </View>
            <View style={didWin ? styles.unlockBox : styles.eliminatedBox}>
              <Text style={styles.unlockTitle}>{nextText}</Text>
              <Text style={styles.unlockText}>{didWin ? (isFinal ? "Your rewards and final placement are ready." : "Win the next stage to move closer to the crown.") : "The Champion Path continues. Your next run starts from the lobby."}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.9}>
            <Text style={styles.buttonText}>{isFinal ? "Claim Champion Ceremony" : didWin ? "View Next Round" : "View Champion Path"}</Text>
            <Text style={styles.buttonSubtext}>{didWin ? "Advance. Focus. Finish." : "Reset. Re-enter. Rise."}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#071426" },
  content: { paddingTop: 78, paddingHorizontal: 16, paddingBottom: 34 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#071426", paddingHorizontal: 24 },
  title: { fontSize: 17, fontWeight: "900", color: "#fff", textAlign: "center" },
  muted: { color: "rgba(255,255,255,0.6)", marginTop: 8, textAlign: "center" },
  hero: { overflow: "hidden", borderRadius: 24, padding: 16, borderWidth: 1, borderColor: "rgba(126,231,255,0.32)", marginBottom: 12 },
  heroImage: { borderRadius: 24 },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5, 8, 20, 0.46)" },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 9 },
  eyebrow: { color: "#7FE7FF", fontSize: 11, fontWeight: "900", letterSpacing: 1.3 },
  roundPill: { color: "#050716", backgroundColor: "#7FE7FF", fontSize: 11, fontWeight: "900", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  heroIcon: { fontSize: 34, marginBottom: 6 },
  resultTitle: { color: "#FFFFFF", fontSize: 34, fontWeight: "900", marginBottom: 4 },
  contextText: { color: "rgba(255,255,255,0.78)", fontSize: 13, lineHeight: 19 },
  scoreBox: { backgroundColor: "rgba(12, 22, 42, 0.94)", borderRadius: 22, padding: 12, borderWidth: 1, borderColor: "rgba(126,231,255,0.14)", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  scoreSide: { flex: 1, alignItems: "center" },
  sideTag: { color: "#7FE7FF", fontSize: 11, fontWeight: "900", marginBottom: 7 },
  scoreLabel: { color: "rgba(255,255,255,0.64)", fontSize: 12, fontWeight: "900", marginBottom: 6, textAlign: "center" },
  scoreNumber: { color: "#FFFFFF", fontSize: 38, fontWeight: "900" },
  vsColumn: { alignItems: "center", marginHorizontal: 10 },
  vs: { color: "#7FE7FF", fontSize: 13, fontWeight: "900", marginBottom: 6 },
  winMini: { color: "#6EE082", fontSize: 11, fontWeight: "900" },
  lossMini: { color: "#FF8A8A", fontSize: 11, fontWeight: "900" },
  panel: { backgroundColor: "rgba(8, 22, 40, 0.94)", borderRadius: 20, padding: 12, borderWidth: 1, borderColor: "rgba(126,231,255,0.14)", marginBottom: 12 },
  panelHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  panelTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  stepText: { color: "#7FE7FF", fontSize: 12, fontWeight: "900" },
  pathRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  pathItem: { flex: 1, alignItems: "center" },
  pathDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  pathDotActive: { backgroundColor: "rgba(126,231,255,0.15)", borderColor: "rgba(126,231,255,0.36)" },
  pathDotCurrent: { shadowColor: "#56C7FF", shadowOpacity: 0.35, shadowRadius: 10, elevation: 3 },
  pathDotText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  pathLabel: { color: "rgba(255,255,255,0.52)", fontSize: 11, fontWeight: "800" },
  pathLabelActive: { color: "#7FE7FF" },
  unlockBox: { backgroundColor: "rgba(126,231,255,0.10)", borderRadius: 15, padding: 12, borderWidth: 1, borderColor: "rgba(126,231,255,0.24)" },
  eliminatedBox: { backgroundColor: "rgba(255,107,107,0.10)", borderRadius: 15, padding: 12, borderWidth: 1, borderColor: "rgba(255,107,107,0.25)" },
  unlockTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "900", marginBottom: 4 },
  unlockText: { color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 19 },
  button: { backgroundColor: "#2F8FC6", borderWidth: 1, borderColor: "rgba(143,216,255,0.50)", borderRadius: 18, paddingVertical: 11, alignItems: "center", shadowColor: "#56C7FF", shadowOpacity: 0.22, shadowRadius: 10, elevation: 4 },
  buttonText: { color: "#04111E", fontSize: 17, fontWeight: "900" },
  buttonSubtext: { color: "rgba(7,7,19,0.72)", fontSize: 10, fontWeight: "800", marginTop: 2 },
});
