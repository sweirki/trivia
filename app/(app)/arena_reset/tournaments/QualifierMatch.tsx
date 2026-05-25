import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

const tournamentMatchBg = require("../../../../assets/images/arena/tournaments/tournament_match_bg.webp");

import { router, useLocalSearchParams } from "expo-router";

import { useArenaStore } from "@/arena/store/useArenaStore";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { s } from "@/arena/theme/arenaSizing";


type TournamentQuestion = {
  question: string;
  answers: string[];
  correctAnswer: string;
};

export default function TournamentMatch() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();

  const {
    questions,
    currentQuestionIndex,
    loadQuestions,
    nextQuestion,
    updatePlayerScore,
    matchState,
    setMatchState,
    resetArena,
    player,
  } = useArenaStore();

 const { tournament, submitMatchResult } = useTournamentStore((state) => ({
  tournament: state.tournament,
  submitMatchResult: state.submitMatchResult,
}));



  const [timeLeft, setTimeLeft] = useState(10);

  // --------------------------------------------
  // DERIVED MATCH CONTEXT (UI ONLY)
  // --------------------------------------------
  const matchInfo = useMemo(() => {
    if (!matchId) return null;

    if (matchId.startsWith("Q")) {
      return { round: "Quarterfinal", index: Number(matchId[1]) };
    }
    if (matchId.startsWith("S")) {
      return { round: "Semifinal", index: Number(matchId[1]) };
    }
    if (matchId === "F1") {
      return { round: "Grand Final", index: 7 };
    }
    return null;
  }, [matchId]);

  // --------------------------------------------
  // INIT MATCH (TEMP QUESTIONS)
  // --------------------------------------------
useEffect(() => {
  if (!tournament || !matchId) return;

  const qs = [
    {
      question: "Which planet is closest to the Sun?",
      answers: ["Mercury", "Venus", "Earth", "Mars"],
      correctAnswer: "Mercury",
    },
    {
      question: "How many continents are there?",
      answers: ["5", "6", "7", "8"],
      correctAnswer: "7",
    },
    {
      question: "What is the capital of Japan?",
      answers: ["Tokyo", "Osaka", "Kyoto", "Nagoya"],
      correctAnswer: "Tokyo",
    },
  ];

  loadQuestions(qs);
  setMatchState("in-match");
}, [tournament, matchId, loadQuestions, setMatchState]);


  const q = questions[currentQuestionIndex] as TournamentQuestion;
 const blocked = !q || !matchInfo;


  // --------------------------------------------
  // TIMER
  // --------------------------------------------
  useEffect(() => {
    if (matchState !== "in-match") return;

    setTimeLeft(10);

    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          nextQuestionOrEnd();
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [currentQuestionIndex, matchState]);

  // --------------------------------------------
  // ANSWER HANDLING
  // --------------------------------------------
  const handleAnswer = (ans: string) => {
    if (ans === q.correctAnswer) {
      updatePlayerScore(1);
    }
    nextQuestionOrEnd();
  };

  // --------------------------------------------
  // END / RESOLVE
  // --------------------------------------------
  const nextQuestionOrEnd = () => {
    const last = currentQuestionIndex === questions.length - 1;

    if (last) {
      const winnerId = player?.id ?? null;
      if (winnerId && matchId) {
        submitMatchResult(matchId, 1, 0);

      }

      resetArena();
      router.replace("/(app)/arena_reset/tournaments/bracket" as any);

      return;
    }

    nextQuestion();
  };
if (!q || !matchInfo) {
  return (
    <ImageBackground source={tournamentMatchBg} imageStyle={styles.bgImage} style={styles.container}>
      <View style={styles.bgShade} />
      <Text style={{ color: "#aaa", textAlign: "center" }}>
        Preparing match…
      </Text>
    </ImageBackground>
  );
}

  // --------------------------------------------
  // UI
  // --------------------------------------------
  return (
    <ImageBackground source={tournamentMatchBg} imageStyle={styles.bgImage} style={styles.container}>
      <View style={styles.bgShade} />
      {/* MATCH CONTEXT HEADER */}
      <View style={styles.header}>
        <Text style={styles.round}>{matchInfo.round}</Text>
        <Text style={styles.progress}>
          Match {matchInfo.index} of 7
        </Text>
      </View>

      {/* VS */}
      <Text style={styles.vs}>You vs Opponent</Text>

      {/* TIMER */}
      <Text style={styles.timer}>⏳ {timeLeft}s</Text>

      {/* QUESTION */}
      <Text style={styles.question}>{typeof q.question === "string" ? q.question : ""}</Text>

      {/* ANSWERS */}
      {(Array.isArray(q.answers) ? q.answers : []).map((a: string, idx: number) => (
        <TouchableOpacity
          key={idx}
          style={styles.answerBtn}
          onPress={() => handleAnswer(a)}
          activeOpacity={0.72}
        >
          <Text style={styles.answerText}>{a}</Text>
        </TouchableOpacity>
      ))}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    opacity: 1,
  },
  bgShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 7, 22, 0.64)",
  },

  container: {
    flex: 1,
    paddingTop: s(54),
    paddingHorizontal: s(18),
    backgroundColor: "#050716",
  },

  header: {
    alignItems: "center",
    marginBottom: s(20),
  },

  round: {
    color: "#D6A93A",
    fontSize: s(26),
    fontWeight: "900",
  },

  progress: {
    color: "#aaa",
    fontSize: s(14),
    marginTop: s(4),
  },

  vs: {
    color: "#6EC7F2",
    fontSize: s(18),
    textAlign: "center",
    marginBottom: s(12),
    fontWeight: "700",
  },

  timer: {
    color: "#D6A93A",
    fontSize: s(22),
    textAlign: "center",
    marginBottom: s(20),
  },

  question: {
    color: "#fff",
    fontSize: s(22),
    marginBottom: s(30),
    textAlign: "center",
  },

  answerBtn: {
    backgroundColor: "#1c1c29",
    padding: s(16),
    borderRadius: s(14),
    marginVertical: s(6),
  },

  answerText: {
    color: "#fff",
    fontSize: s(18),
    textAlign: "center",
  },
});




