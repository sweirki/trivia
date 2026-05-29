import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

const tournamentMatchBg = require("../../../../assets/images/arena/tournaments/tournament_match_bg.webp");

import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { buildArenaQuestions } from "@/questions/gameplayQuestions";


type TournamentQuestion = {
  question: string;
  answers: string[];
  correctAnswer: string;
};

export default function SemifinalMatch1() {
  const {
    questions,
    currentQuestionIndex,
    loadQuestions,
    nextQuestion,
    updatePlayerScore,
    updateOpponentScore,
    player: arenaPlayer,
    setMatchState,
    matchState,
  } = useArenaStore();

  const { tournament, submitMatchResult } = useTournamentStore((state) => ({
  tournament: state.tournament,
  submitMatchResult: state.submitMatchResult,
}));


  const [timeLeft, setTimeLeft] = useState(8);
  const [player, setPlayer] = useState(null);
  const [opponent, setOpponent] = useState(null);

  // ------------------------------------------------
  // INITIALIZE SEMIFINAL 1
  // ------------------------------------------------
  useEffect(() => {
    if (!tournament) return;


   const players = tournament.players.slice(0, 2);
setPlayer(players[0] ?? null);
setOpponent(players[1] ?? null);


    const tournamentQuestions = buildArenaQuestions("tournament", 5);

    loadQuestions(tournamentQuestions);
    setMatchState("in-match");
  }, []);

  const q = questions[currentQuestionIndex] as TournamentQuestion;
  const blocked = !q;


  // ------------------------------------------------
  // TIMER LOGIC
  // ------------------------------------------------
  useEffect(() => {
    if (matchState !== "in-match") return;

    setTimeLeft(8);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleWrong();
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, matchState]);

  // ------------------------------------------------
  // AI ANSWER SIMULATION
  // ------------------------------------------------
  useEffect(() => {
    if (!opponent || !q) return;

    const randomDelay = Math.floor(Math.random() * 700) + 450; // AI answers 1–4 sec
    const willAnswerCorrect = Math.random() < 0.65;

    const timer = setTimeout(() => {
      if (willAnswerCorrect) updateOpponentScore(1);
    }, randomDelay);

    return () => clearTimeout(timer);
  }, [currentQuestionIndex, opponent, q]);

  // ------------------------------------------------
  // PLAYER ANSWER
  // ------------------------------------------------
  const handleAnswer = (ans) => {
    const wasCorrect = ans === q.correctAnswer;

    if (wasCorrect) {
      updatePlayerScore(1);
    }

    nextStageOrNextQuestion(wasCorrect);
  };

  const handleWrong = () => {
    nextStageOrNextQuestion();
  };

  // ------------------------------------------------
  // CHECK END OF QUESTIONS → GO TO MATCH 2
  // ------------------------------------------------
  const nextStageOrNextQuestion = (lastAnswerCorrect = false) => {
    const last = currentQuestionIndex === questions.length - 1;

    if (last) {
     const finalPlayerScore = (arenaPlayer?.score ?? 0) + (lastAnswerCorrect ? 1 : 0);
      const finalOpponentScore = Math.max(0, questions.length - finalPlayerScore);
      submitMatchResult("S1", finalPlayerScore, finalOpponentScore);

      router.replace("/(app)/arena_reset/tournaments/SemifinalMatch2");
      return;
    }

    nextQuestion();
  };



  return (
  <ImageBackground source={tournamentMatchBg} imageStyle={styles.bgImage} style={styles.container}>
      <View style={styles.bgShade} />
    {blocked ? (
      <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
        Loading…
      </Text>
    ) : (
      <>
        <Text style={styles.title}>Semifinal 1</Text>

        <Text style={styles.vs}>
          {player?.name} VS {opponent?.name}
        </Text>

        <Text style={styles.timer}>⏳ {timeLeft}s</Text>

        <Text style={styles.question}>{typeof q.question === "string" ? q.question : ""}</Text>

        {(Array.isArray(q.answers) ? q.answers : []).map((a: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={styles.answerBtn}
            onPress={() => handleAnswer(a)}
            activeOpacity={0.72}
          >
            <Text style={styles.answerText}>{a}</Text>
          </TouchableOpacity>
        ))}
      </>
    )}
  </ImageBackground>
);

}

// ------------------------------------------------
// STYLES
// ------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 38,
    paddingHorizontal: 16,
    backgroundColor: "#050716",
  },

  bgImage: {
    opacity: 1,
  },
  bgShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 20, 0.56)",
  },

  title: {
    color: "#D6A93A",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },

  vs: {
    color: "#6EC7F2",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },

  timer: {
    color: "#D6A93A",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },

  question: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 16,
    textAlign: "center",
  },

  answerBtn: {
    backgroundColor: "#1c1c29",
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },

  answerText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
});






