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


type TournamentQuestion = {
  question: string;
  answers: string[];
  correctAnswer: string;
};

export default function FinalMatch() {
  const {
    questions,
    currentQuestionIndex,
    loadQuestions,
    nextQuestion,
    updatePlayerScore,
    updateOpponentScore,
    matchState,
    setMatchState,
  } = useArenaStore();

 const { tournament, submitMatchResult } = useTournamentStore((state) => ({
  tournament: state.tournament,
  submitMatchResult: state.submitMatchResult,
}));


  const [timeLeft, setTimeLeft] = useState(10);
  const [player, setPlayer] = useState(null);
  const [opponent, setOpponent] = useState(null);

  // ------------------------------------------------
  // INITIALIZE FINAL MATCH
  // ------------------------------------------------
  useEffect(() => {
   if (!tournament) return;

const players = tournament.players.slice(0, 2);
setPlayer(players[0] ?? null);
setOpponent(players[1] ?? null);


    const finalQs = [
      {
        question: "What is the capital of Australia?",
        answers: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correctAnswer: "Canberra",
      },
      {
        question: "Which element has the chemical symbol 'Fe'?",
        answers: ["Silver", "Fluorine", "Iron", "Gold"],
        correctAnswer: "Iron",
      },
      {
        question: "Who discovered gravity?",
        answers: ["Newton", "Tesla", "Einstein", "Bohr"],
        correctAnswer: "Newton",
      },
      {
        question: "Which continent is the Sahara Desert located on?",
        answers: ["Asia", "Africa", "Australia", "South America"],
        correctAnswer: "Africa",
      },
    ];

    loadQuestions(finalQs);
    setMatchState("in-match");
  }, []);

  const q = questions[currentQuestionIndex] as TournamentQuestion;
  const blocked = !q;


  // ------------------------------------------------
  // TIMER LOGIC
  // ------------------------------------------------
  useEffect(() => {
    if (matchState !== "in-match") return;

    setTimeLeft(10);

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
  // AI LOGIC
  // ------------------------------------------------
  useEffect(() => {
    if (!opponent || !q) return;

    const delay = Math.floor(Math.random() * 2500) + 1200; // 1.2–3.7 sec
    const willAnswerCorrect = Math.random() < 0.73; // grand finals bot is stronger

    const timer = setTimeout(() => {
      if (willAnswerCorrect) updateOpponentScore(1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentQuestionIndex, opponent, q]);

  // ------------------------------------------------
  // PLAYER ANSWERS
  // ------------------------------------------------
  const handleAnswer = (ans: string) => {
    if (ans === q.correctAnswer) {
      updatePlayerScore(1);
    }
    nextOrFinish();
  };

  const handleWrong = () => {
    nextOrFinish();
  };

  // ------------------------------------------------
  // CHECK IF MATCH IS OVER → CHAMPION DECIDED
  // ------------------------------------------------
  const nextOrFinish = () => {
    const last = currentQuestionIndex === questions.length - 1;

    if (last) {
     submitMatchResult("F", 1, 0);
router.replace("/(app)/arena_reset/tournaments/TournamentSummary");

      return;
    }

    nextQuestion();
  };

  // ------------------------------------------------
  // UI
  // ------------------------------------------------
 return (
  <ImageBackground source={tournamentMatchBg} imageStyle={styles.bgImage} style={styles.container}>
      <View style={styles.bgShade} />
    {blocked ? (
      <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
        Loading…
      </Text>
    ) : (
      <>
        <Text style={styles.title}>🏆 Grand Final 🏆</Text>

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
    paddingTop: 72,
    paddingHorizontal: 20,
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
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },

  vs: {
    color: "#6EC7F2",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },

  timer: {
    color: "#D6A93A",
    fontSize: 26,
    textAlign: "center",
    marginBottom: 25,
  },

  question: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 30,
    textAlign: "center",
  },

  answerBtn: {
    backgroundColor: "#1c1c29",
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
  },

  answerText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});


