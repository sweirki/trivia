import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { useArenaRankSystem } from "@/arena/store/useArenaRankSystem";
import { useRankedHistoryStore } from "@/arena/store/useRankedHistoryStore";
import { useArenaRewardsEngine } from "@/arena/store/useArenaRewardsEngine";
import { useAuthStore } from "@/store/useAuthStore";
import { useSeasonStore } from "@/seasons/store/useSeasonStore";
import { SEASON_XP } from "@/seasons/seasonXpRules";

type CompetitiveResult = {
  mode: "ranked";
  outcome: "win" | "loss";
  score: number;
  correctAnswers: number;
  questionsAnswered: number;
  durationSec: number;
};

const reportCompetitiveResult = (result: CompetitiveResult) => {
  if (__DEV__) {
    console.log("📊 CompetitiveResult:", result);
  }
};


export default function RankedResult() {
  const uid = useAuthStore((s) => s.user?.uid) ?? null;

  const { player, opponent, resetArena } = useArenaStore();

  const {
    sr,
    rank,
    addWin,
    addLoss,
    
  } = useArenaRankSystem();
const rewardRanked = useArenaRewardsEngine(
  (s) => s.rewardRanked
);

  // --------------------------------------------------
  // DERIVED MATCH RESULT
  // --------------------------------------------------
  const playerScore = player?.score ?? 0;
  const opponentScore = opponent?.score ?? 0;
  const didWin = playerScore > opponentScore;

  // --------------------------------------------------
  // SR TRACKING
  // --------------------------------------------------
  const srBefore = sr;
  const [srAfter, setSrAfter] = useState(sr);
  const srAnim = useRef(new Animated.Value(0)).current;
  const appliedRef = useRef(false);

const addMatch = useRankedHistoryStore((s) => s.addMatch);

  // --------------------------------------------------
  // APPLY RESULT ONCE
  // --------------------------------------------------
 useEffect(() => {
  if (appliedRef.current) return;
  appliedRef.current = true;

  if (didWin) {
    addWin(opponent?.sr ?? srBefore);
  } else {
    addLoss(opponent?.sr ?? srBefore);
  }


  const updatedSR = useArenaRankSystem.getState().sr;
  setSrAfter(updatedSR);

  Animated.timing(srAnim, {
    toValue: Math.abs(updatedSR - srBefore),
    duration: 700,
    useNativeDriver: false,
  }).start();

  addMatch({
    result: didWin ? "win" : "loss",
    playerScore,
    opponentScore,
    srBefore,
    srAfter: updatedSR,
    srDelta: updatedSR - srBefore,
  });

reportCompetitiveResult({
  mode: "ranked",
  outcome: didWin ? "win" : "loss",
  score: playerScore,
  correctAnswers: playerScore,
  questionsAnswered: playerScore + opponentScore,
  durationSec: 0,
});




}, []);


 


  const srDiff = srAfter - srBefore;
  const srDiffText = srDiff > 0 ? `+${srDiff}` : `${srDiff}`;

  

  // --------------------------------------------------
  // CONTINUE
  // --------------------------------------------------
  const handleContinue = () => {
    resetArena();
  router.replace("/arena_reset");

  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Result */}
      <Text
        style={[
          styles.resultText,
          { color: didWin ? "#4CAF50" : "#E53935" },
        ]}
      >
      {didWin ? "🏆 VICTORY!" : "💥 DEFEAT"}
      </Text>

      {/* Scores */}
      <View style={styles.scoreBox}>
        <View style={styles.scoreColumn}>
          <Text style={styles.label}>YOU</Text>
          <Text style={styles.score}>{playerScore}</Text>
        </View>

        <View style={styles.scoreColumn}>
          <Text style={styles.label}>OPPONENT</Text>
          <Text style={styles.score}>{opponentScore}</Text>
        </View>
      </View>
      <Text style={styles.resultReason}>
  {didWin
    ? "You outscored your opponent"
    : "Your opponent outscored you"}
</Text>


      {/* SR */}
      <View style={styles.srBox}>
       <Text style={styles.srLabel}>
  Skill Rating {didWin ? "gained" : "adjusted"}
</Text>


        <Text style={styles.srBefore}>Before: {srBefore}</Text>

        <Animated.Text
          style={[
            styles.srChange,
            { color: srDiff >= 0 ? "#4CAF50" : "#E53935" },
          ]}
        >
          {srDiffText}
        </Animated.Text>

        <Text style={styles.srAfter}>Now: {srAfter}</Text>
      </View>

      {/* Rank */}
      <View style={styles.rankBox}>
        <Text style={styles.rankTitle}>{rank.league}</Text>
        {rank.division && (
          <Text style={styles.rankDivision}>
            Division {rank.division}
          </Text>
        )}
      </View>

      {/* Continue */}
      <TouchableOpacity
        style={[
          styles.continueBtn,
          { backgroundColor: didWin ? "#4CAF50" : "#E53935" },
        ]}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },
resultReason: {
  color: "#bbb",
  fontSize: 16,
  marginBottom: 10,
},

  resultText: {
    fontSize: 38,
    fontWeight: "800",
    marginBottom: 30,
  },

  scoreBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginVertical: 20,
  },

  scoreColumn: {
    alignItems: "center",
  },

  label: {
    color: "#aaa",
    fontSize: 16,
  },

  score: {
    color: "#fff",
    fontSize: 36,
    marginTop: 4,
    fontWeight: "700",
  },

  srBox: {
    marginTop: 30,
    alignItems: "center",
    marginBottom: 40,
  },

  srLabel: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
  },

  srBefore: {
    color: "#aaa",
    fontSize: 16,
  },

  srChange: {
    fontSize: 40,
    marginVertical: 10,
    fontWeight: "700",
  },

  srAfter: {
    color: "#aaa",
    fontSize: 16,
  },

  rankBox: {
    alignItems: "center",
    marginBottom: 40,
  },

  rankTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "600",
  },

  rankDivision: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 18,
  },

  continueBtn: {
    paddingVertical: 18,
    width: "80%",
    borderRadius: 14,
  },

  continueText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
});

