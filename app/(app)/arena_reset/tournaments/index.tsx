import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { s } from "@/arena/theme/arenaSizing";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlayerStore } from "@/store/usePlayerStore";

const EVENT_ROTATION = [
  {
    tier: "BRONZE CUP",
    subtitle: "Daily Open",
    reward: "Starter rewards & easy seeding",
    accent: "#CD7F32",
  },
  {
    tier: "SILVER CLASH",
    subtitle: "Competitive Event",
    reward: "Higher SR & bigger rewards",
    accent: "#C0C0C0",
  },
  {
    tier: "GOLD MAJOR",
    subtitle: "Weekend Major",
    reward: "Elite rewards & prestige",
    accent: "#FFD54F",
  },
];

export default function TournamentEntry() {
  const tournament = useTournamentStore((state) => state.tournament);
  const lifecycle = useTournamentStore((state) => state.lifecycle);

  const [countdown, setCountdown] = useState("LIVE NOW");

  const currentEvent = useMemo(() => {
    const day = new Date().getDay();

    if (day === 5 || day === 6) {
      return EVENT_ROTATION[2];
    }

    if (day === 3 || day === 4) {
      return EVENT_ROTATION[1];
    }

    return EVENT_ROTATION[0];
  }, []);

  useEffect(() => {
    const store = useTournamentStore.getState();

    if (!store.tournament || store.lifecycle === "CREATED") {
      store.loadActiveTournament();
    }
  }, []);

  const startTime = tournament ? tournament.createdAt + 60_000 : null;

  useEffect(() => {
    if (!startTime) {
      setCountdown("LIVE NOW");
      return;
    }

    const update = () => {
      const diff = startTime - Date.now();

      if (diff <= 0) {
        setCountdown("LIVE NOW");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const sec = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${h}h ${m}m ${sec}s`);
    };

    update();
    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, [startTime]);

  const handleJoin = () => {
    let store = useTournamentStore.getState();

    if (!store.tournament || store.lifecycle === "CREATED") {
      store.loadActiveTournament();
      store = useTournamentStore.getState();
    }

    if (store.lifecycle === "COMPLETED") {
      store.resetTournament();
      store.loadActiveTournament();
      store = useTournamentStore.getState();
    }

    const user = useAuthStore.getState().user;
    const player = usePlayerStore.getState();
    const uid = user?.uid ?? "guest-player";
    const username = player.nickname ?? user?.displayName ?? "You";

    if (store.lifecycle === "OPEN") {
      store.joinTournament(uid, username);
      store.lockTournament();
      store.startTournament();
    }

    const latest = useTournamentStore.getState();
    const bracket = latest.bracket;

    const nextMatch =
      bracket?.qualifiers.find(
        (match) =>
          !match.completed &&
          (match.playerAUid === uid || match.playerBUid === uid)
      ) ??
      bracket?.semifinals.find(
        (match) =>
          !match.completed &&
          (match.playerAUid === uid || match.playerBUid === uid)
      ) ??
      (bracket?.final &&
      !bracket.final.completed &&
      (bracket.final.playerAUid === uid || bracket.final.playerBUid === uid)
        ? bracket.final
        : null) ??
      bracket?.qualifiers.find((match) => !match.completed) ??
      bracket?.semifinals.find((match) => !match.completed) ??
      (bracket?.final && !bracket.final.completed ? bracket.final : null);

    if (nextMatch?.id) {
      router.push(`/(app)/arena_reset/tournaments/match/${nextMatch.id}` as any);
      return;
    }

    router.push("/(app)/arena_reset/tournaments/TournamentBracket" as any);
  };

  const rewardCoins = tournament?.config.rewardCoins ?? 100;
  const entryFeeCoins = tournament?.config.entryFeeCoins ?? 50;
  const questionsPerMatch = tournament?.config.questionsPerMatch ?? 10;
  const timePerQuestion = tournament?.config.timePerQuestion ?? 10;
  const isCompleted = lifecycle === "COMPLETED";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.heroCard,
          { borderColor: currentEvent.accent },
        ]}
      >
        <Text style={styles.liveTag}>TOURNAMENT EVENT</Text>

        <Text style={styles.heroTitle}>{currentEvent.tier}</Text>

        <Text style={styles.heroSubtitle}>{currentEvent.subtitle}</Text>

        <View style={styles.countdownRow}>
          <Text style={styles.countdownLabel}>
            {isCompleted ? "Next Run" : "Event Status"}
          </Text>
          <Text style={styles.countdownValue}>
            {isCompleted ? "READY" : countdown}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Event Rewards</Text>

        <Text style={styles.rewardCoins}>{rewardCoins} Coins</Text>

        <Text style={styles.rewardSubtext}>{currentEvent.reward}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Entry Requirements</Text>

        <Text style={styles.ruleLine}>• Entry Fee: {entryFeeCoins} coins</Text>
        <Text style={styles.ruleLine}>• {questionsPerMatch} questions per match</Text>
        <Text style={styles.ruleLine}>• {timePerQuestion}s per question</Text>
        <Text style={styles.ruleLine}>• Higher placements earn prestige rewards</Text>
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>Tournament Pressure</Text>

        <Text style={styles.warningText}>
          Lose and your run ends. Win rounds to advance, build champion momentum,
          and claim the top reward.
        </Text>
      </View>

      <TouchableOpacity style={styles.joinButton} onPress={handleJoin} activeOpacity={0.72}>
        <Text style={styles.joinButtonText}>
          {isCompleted ? "Start New Tournament" : "Enter Tournament"}
        </Text>

        <Text style={styles.joinButtonSubtext}>Compete. Survive. Climb.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050512",
  },

  content: {
    paddingTop: s(22),
    paddingBottom: s(190),
    paddingHorizontal: s(16),
  },

  heroCard: {
    backgroundColor: "#131326",
    borderWidth: 1.5,
    borderRadius: s(20),
    padding: s(18),
    marginBottom: s(14),
  },

  liveTag: {
    color: "#FF8A65",
    fontSize: s(12),
    fontWeight: "800",
    marginBottom: s(10),
    letterSpacing: 1,
  },

  heroTitle: {
    color: "#fff",
    fontSize: s(28),
    fontWeight: "900",
  },

  heroSubtitle: {
    color: "#b0b0c3",
    fontSize: s(16),
    marginTop: s(4),
    marginBottom: s(12),
  },

  countdownRow: {
    backgroundColor: "#1B1B34",
    borderRadius: s(14),
    padding: s(13),
  },

  countdownLabel: {
    color: "#8f8fa5",
    fontSize: s(13),
    marginBottom: s(6),
  },

  countdownValue: {
    color: "#FFD54F",
    fontSize: s(19),
    fontWeight: "800",
  },

  sectionCard: {
    backgroundColor: "#101020",
    borderRadius: s(16),
    padding: s(16),
    marginBottom: s(12),
  },

  sectionTitle: {
    color: "#fff",
    fontSize: s(18),
    fontWeight: "800",
    marginBottom: s(10),
  },

  rewardCoins: {
    color: "#FFD54F",
    fontSize: s(26),
    fontWeight: "900",
  },

  rewardSubtext: {
    color: "#a5a5b8",
    fontSize: s(14),
    marginTop: s(8),
  },

  ruleLine: {
    color: "#cfcfe1",
    fontSize: s(14),
    marginBottom: s(7),
  },

  warningCard: {
    backgroundColor: "#2A2108",
    borderWidth: 1,
    borderColor: "#7A5A00",
    borderRadius: s(16),
    padding: s(15),
    marginBottom: s(18),
  },

  warningTitle: {
    color: "#FFD54F",
    fontSize: s(18),
    fontWeight: "800",
    marginBottom: s(10),
  },

  warningText: {
    color: "#E8DDB5",
    fontSize: s(14),
    lineHeight: s(19),
  },

  joinButton: {
    backgroundColor: "#FFD54F",
    borderRadius: s(14),
    paddingVertical: s(12),
    alignItems: "center",
    marginBottom: s(34),
  },

  joinButtonText: {
    color: "#000",
    fontSize: s(19),
    fontWeight: "900",
  },

  joinButtonSubtext: {
    color: "#3d2c00",
    fontSize: s(13),
    fontWeight: "700",
    marginTop: s(4),
  },
});

