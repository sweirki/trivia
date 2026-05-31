import React, { useMemo, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

const tournamentEntryHero = require("../../../../assets/images/arena/tournaments/tournament_entry_hero.webp");
const tournamentFinalsHero = require("../../../../assets/images/arena/tournaments/tournament_finals_hero.webp");

import { router } from "expo-router";
import { s } from "@/arena/theme/arenaSizing";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { TournamentMatch } from "@/arena/types/match";

function isBotUid(uid?: string | null) {
  return Boolean(uid?.startsWith("bot-"));
}

function nameFor(tournament: any, uid?: string | null) {
  if (!uid) return "TBD";
  const player = tournament?.players?.find((p: any) => p.uid === uid);
  const name = player?.username?.trim?.();
  if (name && !/bot/i.test(name)) return name;
  if (isBotUid(uid)) return "Arena Rival";
  return uid.length > 14 ? "Player" : uid;
}

function allMatches(bracket: any): TournamentMatch[] {
  if (!bracket) return [];
  return [
    ...(bracket.qualifiers ?? []),
    ...(bracket.semifinals ?? []),
    ...(bracket.final ? [bracket.final] : []),
  ];
}

function getReadyMatch(matches: TournamentMatch[], tournamentCompleted: boolean) {
  if (tournamentCompleted) return null;
  return matches.find((m) => m?.id && m.playerAUid && m.playerBUid && !m.completed) ?? null;
}

export default function TournamentBracket() {
  const tournament = useTournamentStore((st) => st.tournament);
  const bracket = useTournamentStore((st) => st.bracket);
  const lifecycle = useTournamentStore((st) => st.lifecycle);
  const hasNavigatedRef = useRef(false);

  const tournamentCompleted = lifecycle === "COMPLETED" || tournament?.status === "completed";
  const matches = useMemo(() => allMatches(bracket), [bracket]);
  const readyMatch = useMemo(() => getReadyMatch(matches, tournamentCompleted), [matches, tournamentCompleted]);

  if (!tournament || !bracket) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Tournament not started.</Text>
      </View>
    );
  }

  const goToMatch = (match?: TournamentMatch | null) => {
    if (!match?.id || hasNavigatedRef.current || tournamentCompleted || match.completed) return;
    hasNavigatedRef.current = true;
    router.push(`/(app)/arena_reset/tournaments/match/${match.id}` as any);
  };

  const renderCompactMatch = (match: TournamentMatch, index: number) => {
    const ready = readyMatch?.id === match.id;
    const complete = Boolean(match.completed && match.winnerUid);
    const left = nameFor(tournament, match.playerAUid);
    const right = nameFor(tournament, match.playerBUid);
    const winner = nameFor(tournament, match.winnerUid);

    return (
      <TouchableOpacity
        key={match.id ?? `${left}-${right}-${index}`}
        style={[styles.matchRow, ready && styles.matchRowActive, complete && styles.matchRowDone]}
        onPress={() => goToMatch(match)}
        activeOpacity={ready ? 0.88 : 1}
        disabled={!ready}
      >
        <View style={styles.rowTop}>
          <Text style={styles.player} numberOfLines={1}>{left}</Text>
          <View style={styles.vs}><Text style={styles.vsText}>VS</Text></View>
          <Text style={styles.player} numberOfLines={1}>{right}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.status, ready && styles.statusReady]}>
            {ready ? "READY" : complete ? `🏆 ${winner}` : "LOCKED"}
          </Text>
          {ready ? <Text style={styles.enter}>Enter Match</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, subtitle: string, items: TournamentMatch[]) => (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSub}>{subtitle}</Text>
      </View>
      {items.map(renderCompactMatch)}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ImageBackground source={tournamentEntryHero} imageStyle={styles.heroImage} style={styles.hero}>
        <View style={styles.heroShade} />
        <Text style={styles.eyebrow}>LIVE TOURNAMENT</Text>
        <Text style={styles.title}>{tournamentCompleted ? "Championship Complete" : "Champion Path"}</Text>
        <Text style={styles.subtitle}>Win three rounds. Claim the crown.</Text>
        <View style={styles.pillRow}>
          <Text style={styles.pill}>{bracket.qualifiers.length} Opening</Text>
          <Text style={styles.pill}>{bracket.semifinals.length} Final Four</Text>
          <Text style={styles.pill}>Championship</Text>
        </View>
      </ImageBackground>

      {renderSection("Opening Round", "Qualifier winners advance", bracket.qualifiers)}
      {renderSection("Final Four", "Win to reach the crown match", bracket.semifinals)}

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Championship</Text>
          <Text style={styles.sectionSub}>Final match</Text>
        </View>
        {bracket.final ? renderCompactMatch(bracket.final, 0) : (
          <View style={styles.lockedFinal}>
            <Text style={styles.lockedText}>Final unlocks after semifinal completion</Text>
          </View>
        )}
      </View>

      <ImageBackground source={tournamentFinalsHero} imageStyle={styles.destinationImage} style={styles.destination}>
        <View style={styles.destinationShade} />
        <Text style={styles.destinationEyebrow}>CHAMPION DESTINATION</Text>
        <Text style={styles.destinationTitle}>👑 Champion Crown</Text>
        <Text style={styles.destinationText}>Only one player leaves as tournament champion.</Text>
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#071426" },
  center: { flex: 1, backgroundColor: "#071426", justifyContent: "center", alignItems: "center" },
  content: { paddingTop: s(84), paddingHorizontal: s(16), paddingBottom: s(34) },
  info: { color: "#fff", fontSize: s(18), fontWeight: "900" },
  hero: { overflow: "hidden", borderRadius: s(22), padding: s(16), borderWidth: 1, borderColor: "rgba(126,231,255,0.28)", marginBottom: s(14) },
  heroImage: { borderRadius: s(22) },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(4, 12, 24, 0.48)" },
  eyebrow: { color: "#7FE7FF", fontSize: s(11), fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#fff", fontSize: s(27), fontWeight: "900", marginTop: s(5) },
  subtitle: { color: "rgba(255,255,255,0.72)", fontSize: s(13), fontWeight: "700", marginTop: s(5) },
  pillRow: { flexDirection: "row", gap: s(7), marginTop: s(12), flexWrap: "wrap" },
  pill: { color: "#7FE7FF", backgroundColor: "rgba(126,231,255,0.12)", borderRadius: s(999), paddingHorizontal: s(9), paddingVertical: s(5), fontSize: s(11), fontWeight: "900" },
  section: { backgroundColor: "rgba(8, 26, 46, 0.72)", borderRadius: s(20), padding: s(12), borderWidth: 1, borderColor: "rgba(126,231,255,0.16)", marginBottom: s(12) },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: s(9) },
  sectionTitle: { color: "#FFFFFF", fontSize: s(18), fontWeight: "900" },
  sectionSub: { color: "rgba(255,255,255,0.58)", fontSize: s(12), fontWeight: "800" },
  matchRow: { borderRadius: s(15), padding: s(10), backgroundColor: "rgba(11, 27, 50, 0.92)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: s(8) },
  matchRowActive: { borderColor: "#7FE7FF", backgroundColor: "rgba(18, 51, 78, 0.94)" },
  matchRowDone: { borderColor: "rgba(76, 217, 124, 0.42)" },
  rowTop: { flexDirection: "row", alignItems: "center", gap: s(8) },
  player: { flex: 1, color: "#fff", fontSize: s(14), fontWeight: "900", textAlign: "center" },
  vs: { width: s(28), height: s(24), borderRadius: s(999), backgroundColor: "rgba(126,231,255,0.12)", alignItems: "center", justifyContent: "center" },
  vsText: { color: "#7FE7FF", fontSize: s(11), fontWeight: "900" },
  rowBottom: { marginTop: s(8), flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  status: { color: "rgba(255,255,255,0.50)", fontSize: s(11), fontWeight: "900" },
  statusReady: { color: "#7FE7FF" },
  enter: { color: "#04111E", backgroundColor: "#35A4D8", overflow: "hidden", borderRadius: s(999), paddingHorizontal: s(12), paddingVertical: s(5), fontSize: s(11), fontWeight: "900" },
  lockedFinal: { borderRadius: s(15), paddingVertical: s(14), alignItems: "center", backgroundColor: "rgba(11, 27, 50, 0.92)" },
  lockedText: { color: "rgba(255,255,255,0.62)", fontSize: s(12), fontWeight: "800" },
  destination: { overflow: "hidden", borderRadius: s(18), padding: s(14), borderWidth: 1, borderColor: "rgba(126,231,255,0.22)" },
  destinationImage: { borderRadius: s(18) },
  destinationShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(4, 12, 24, 0.48)" },
  destinationEyebrow: { color: "#7FE7FF", fontSize: s(11), fontWeight: "900", letterSpacing: 1.1 },
  destinationTitle: { color: "#fff", fontSize: s(20), fontWeight: "900", marginTop: s(6) },
  destinationText: { color: "rgba(255,255,255,0.70)", fontSize: s(12), marginTop: s(4) },
});
