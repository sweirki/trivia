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

export default function SemifinalMatch2() {
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
  // INITIALIZE MATCH
  // ------------------------------------------------
  useEffect(() => {
   if (!tournament) return;

const players = tournament.players.slice(2, 4);
setPlayer(players[0] ?? null);
setOpponent(players[1] ?? null);


    const questionsSet = [
      {
        question: "What is the hardest natural substance?",
        answers: ["Diamond", "Gold", "Steel", "Silver"],
        correctAnswer: "Diamond",
      },
      {
        question: "Which country invented pizza?",
        answers: ["Italy", "USA", "France", "Brazil"],
        correctAnswer: "Italy",
      },
      {
        question: "How many legs does a spider have?",
        answers: ["6", "8", "10", "12"],
        correctAnswer: "8",
      },
    ];

    loadQuestions(questionsSet);
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
  // AI BEHAVIOR (Opponent)
  // ------------------------------------------------
  useEffect(() => {
    if (!opponent || !q) return;

    const delay = Math.floor(Math.random() * 3000) + 1000; // answers in 1–4 sec
    const willAnswerCorrect = Math.random() < 0.63; // slight randomness

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
  // CHECK IF MATCH IS OVER
  // ------------------------------------------------
  const nextOrFinish = () => {
    const last = currentQuestionIndex === questions.length - 1;

    if (last) {
     submitMatchResult("S2", 1, 0);
router.replace("/(app)/arena_reset/tournaments/FinalMatch");

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
        <Text style={styles.title}>Semifinal 2</Text>

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
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },

  vs: {
    color: "#6EC7F2",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },

  timer: {
    color: "#D6A93A",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
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






