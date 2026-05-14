import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { feedback } from "@/feedback";

import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { TournamentMatch } from "@/arena/types/match";

function shortName(value?: string | null) {
  if (!value) return "Player";
  if (value.startsWith("bot-")) return "Arena Rival";
  if (value.length <= 10) return value;
  return `Player ${value.slice(-4).toUpperCase()}`;
}

function getRoundInfo(match: TournamentMatch | null, bracket: any) {
  if (!match || !bracket) {
    return {
      label: "Tournament Match",
      nextLabel: "Next Round",
      step: 1,
      total: 3,
      isFinalMatch: false,
    };
  }

  if (bracket.final?.id === match.id) {
    return {
      label: "Grand Final",
      nextLabel: "Champion Ceremony",
      step: 3,
      total: 3,
      isFinalMatch: true,
    };
  }

  if ((bracket.semifinals ?? []).some((m: TournamentMatch) => m.id === match.id)) {
    return {
      label: "Semifinal",
      nextLabel: "Grand Final",
      step: 2,
      total: 3,
      isFinalMatch: false,
    };
  }

  return {
    label: "Qualifier",
    nextLabel: "Semifinal",
    step: 1,
    total: 3,
    isFinalMatch: false,
  };
}

export default function TournamentMatchResult() {
  const router = useRouter();
  const hasContinuedRef = useRef(false);
  const feedbackPlayedRef = useRef(false);

  const bracket = useTournamentStore((s) => s.bracket);
  const tournament = useTournamentStore((s) => s.tournament);
  const rawUid = usePlayerStore((s) => (s as any).uid);
  const displayName = usePlayerStore((s) => (s as any).displayName ?? (s as any).name);

  const [showScore, setShowScore] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowScore(true), 350);
    const t2 = setTimeout(() => setShowPath(true), 750);
    const t3 = setTimeout(() => setShowRewards(true), 1100);
    const t4 = setTimeout(() => setShowCTA(true), 1450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const match: TournamentMatch | null = useMemo(() => {
    if (!bracket) return null;

    const all: TournamentMatch[] = [
      ...(bracket.qualifiers ?? []),
      ...(bracket.semifinals ?? []),
      ...(bracket.final ? [bracket.final] : []),
    ];

    const completed = all.filter((m) => Boolean(m?.completed));
    return completed.length ? completed[completed.length - 1] : null;
  }, [bracket]);

  const playerUid = useMemo(() => {
    if (!match) return null;

    if (rawUid && (rawUid === match.playerAUid || rawUid === match.playerBUid)) {
      return rawUid;
    }

    return tournament?.players?.[0]?.uid ?? null;
  }, [match, rawUid, tournament?.players]);

  const didWin = Boolean(match && playerUid && match.winnerUid === playerUid);
  const round = useMemo(() => getRoundInfo(match, bracket), [match, bracket]);
  const isFinal = tournament?.status === "completed" || round.isFinalMatch;

  useEffect(() => {
    if (!match || !playerUid) return;
    if (feedbackPlayedRef.current) return;

    feedbackPlayedRef.current = true;
    didWin && isFinal ? feedback.tournamentWin() : didWin ? feedback.win() : feedback.loss();
  }, [didWin, isFinal, match, playerUid]);

  const handleContinue = () => {
    if (hasContinuedRef.current) return;
    hasContinuedRef.current = true;

    feedback.tap();

    router.replace(
      isFinal
        ? "/(app)/arena_reset/tournaments/TournamentSummary"
        : "/(app)/arena_reset/tournaments/TournamentBracket"
    );
  };

  if (!tournament || !match || !playerUid) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Match result unavailable</Text>
        <Text style={styles.muted}>Return to the tournament lobby and try again.</Text>
      </View>
    );
  }

  const youAreA = match.playerAUid === playerUid;
  const yourScore = youAreA ? match.scoreA : match.scoreB;
  const opponentScore = youAreA ? match.scoreB : match.scoreA;
  const opponentUid = youAreA ? match.playerBUid : match.playerAUid;
  const playerName = displayName || shortName(playerUid);
  const rivalName = shortName(opponentUid);
  const nextText = didWin
    ? isFinal
      ? "Champion ceremony unlocked"
      : `${round.nextLabel} unlocked`
    : "Eliminated from this cup";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={didWin ? ["#32260C", "#15101F", "#070713"] : ["#351821", "#15101F", "#070713"]}
        style={styles.hero}
      >
        <View style={styles.heroTopRow}>
          <Text style={styles.eyebrow}>LIVE TOURNAMENT</Text>
          <Text style={styles.roundPill}>{round.label}</Text>
        </View>

        <View style={didWin ? styles.trophySlotWin : styles.trophySlotLoss}>
          <Text style={styles.trophyIcon}>{didWin ? "🏆" : "🔥"}</Text>
        </View>

        <Text style={styles.resultTitle}>{didWin ? "Qualified" : "Eliminated"}</Text>
        <Text style={styles.contextText}>
          {didWin
            ? isFinal
              ? "You closed the bracket. The cup is yours — claim the champion spotlight."
              : "You survived the pressure round. The bracket opens and the next stage is waiting."
            : "Your run ends here, but the event record is saved. Re-enter the next cup stronger."}
        </Text>
      </LinearGradient>

      {showScore && (
        <View style={styles.scoreBox}>
          <View style={styles.scoreSide}>
            <View style={styles.avatarSlot}>
              <Text style={styles.avatarText}>YOU</Text>
            </View>
            <Text style={styles.scoreLabel}>{playerName}</Text>
            <Text style={styles.scoreNumber}>{yourScore}</Text>
          </View>

          <View style={styles.vsColumn}>
            <Text style={styles.vs}>VS</Text>
            <Text style={didWin ? styles.winMini : styles.lossMini}>{didWin ? "WIN" : "LOSS"}</Text>
          </View>

          <View style={styles.scoreSide}>
            <View style={styles.avatarSlotRival}>
              <Text style={styles.avatarText}>RIVAL</Text>
            </View>
            <Text style={styles.scoreLabel}>{rivalName}</Text>
            <Text style={styles.scoreNumber}>{opponentScore}</Text>
          </View>
        </View>
      )}

      {showPath && (
        <View style={styles.panel}>
          <View style={styles.panelHeaderRow}>
            <Text style={styles.panelTitle}>Bracket Path</Text>
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
                  <Text style={[styles.pathLabel, active && styles.pathLabelActive]}>
                    {step === 1 ? "Qualifier" : step === 2 ? "Semifinal" : "Final"}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={didWin ? styles.unlockBox : styles.eliminatedBox}>
            <Text style={styles.unlockTitle}>{nextText}</Text>
            <Text style={styles.unlockText}>
              {didWin
                ? isFinal
                  ? "Your tournament trophy, rewards, and final placement are ready."
                  : "Win the next stage to move closer to the champion ceremony."
                : "The bracket continues without you. Your next run starts from the lobby."}
            </Text>
          </View>
        </View>
      )}

      {showRewards && (
        <View style={styles.rewardPanel}>
          <View style={styles.rewardArtSlot}>
            <Text style={styles.rewardIcon}>{didWin ? "🎁" : "⭐"}</Text>
          </View>
          <View style={styles.rewardTextWrap}>
            <Text style={styles.rewardTitle}>{didWin ? "Prestige Pressure Increased" : "Run Experience Saved"}</Text>
            <Text style={styles.rewardText}>
              {didWin
                ? "+ Tournament momentum • + Champion path • + Future seeding value"
                : "+ Tournament history • + Comeback target • + Next cup motivation"}
            </Text>
          </View>
        </View>
      )}

      {showCTA && (
        <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.buttonText}>
            {isFinal ? "Claim Champion Ceremony" : didWin ? "View Next Round" : "Return to Bracket"}
          </Text>
          <Text style={styles.buttonSubtext}>
            {didWin ? "Advance. Focus. Finish." : "Reset. Re-enter. Rise."}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070713",
  },
  content: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 34,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#070713",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },
  muted: {
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
    textAlign: "center",
  },
  hero: {
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.32)",
    marginBottom: 16,
    overflow: "hidden",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  eyebrow: {
    color: "#F7C948",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  roundPill: {
    color: "#070713",
    backgroundColor: "#F7C948",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  trophySlotWin: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: "rgba(247,201,72,0.16)",
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.45)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  trophySlotLoss: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: "rgba(255,107,107,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.38)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  trophyIcon: {
    fontSize: 42,
  },
  resultTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    marginBottom: 8,
  },
  contextText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 15,
    lineHeight: 22,
  },
  scoreBox: {
    backgroundColor: "#151520",
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  scoreSide: {
    flex: 1,
    alignItems: "center",
  },
  avatarSlot: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(247,201,72,0.16)",
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarSlotRival: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "900",
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginBottom: 8,
    textAlign: "center",
  },
  scoreNumber: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
  },
  vsColumn: {
    alignItems: "center",
    marginHorizontal: 12,
  },
  vs: {
    color: "#F7C948",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },
  winMini: {
    color: "#6EE082",
    fontSize: 11,
    fontWeight: "900",
  },
  lossMini: {
    color: "#FF8A8A",
    fontSize: 11,
    fontWeight: "900",
  },
  panel: {
    backgroundColor: "#11111A",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.14)",
    marginBottom: 14,
  },
  panelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  stepText: {
    color: "#F7C948",
    fontSize: 12,
    fontWeight: "900",
  },
  pathRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  pathItem: {
    flex: 1,
    alignItems: "center",
  },
  pathDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pathDotActive: {
    backgroundColor: "rgba(247,201,72,0.15)",
    borderColor: "rgba(247,201,72,0.36)",
  },
  pathDotCurrent: {
    shadowColor: "#F7C948",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  pathDotText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  pathLabel: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 11,
    fontWeight: "800",
  },
  pathLabelActive: {
    color: "#F7C948",
  },
  unlockBox: {
    backgroundColor: "rgba(247,201,72,0.10)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.26)",
  },
  eliminatedBox: {
    backgroundColor: "rgba(255,107,107,0.10)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.25)",
  },
  unlockTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },
  unlockText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 19,
  },
  rewardPanel: {
    backgroundColor: "#151520",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  rewardArtSlot: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "rgba(247,201,72,0.12)",
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rewardIcon: {
    fontSize: 30,
  },
  rewardTextWrap: {
    flex: 1,
  },
  rewardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
  },
  rewardText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    backgroundColor: "#F7C948",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#F7C948",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: "#070713",
    fontSize: 17,
    fontWeight: "900",
  },
  buttonSubtext: {
    color: "rgba(7,7,19,0.72)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
});

