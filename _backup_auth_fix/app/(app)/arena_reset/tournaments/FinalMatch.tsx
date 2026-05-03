import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { useTournamentStore } from "@/arena/store/useTournamentStore";

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

  const q = questions[currentQuestionIndex];
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
  <View style={styles.container}>
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

        <Text style={styles.question}>{q.question}</Text>

        {q.answers.map((a: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={styles.answerBtn}
            onPress={() => handleAnswer(a)}
          >
            <Text style={styles.answerText}>{a}</Text>
          </TouchableOpacity>
        ))}
      </>
    )}
  </View>
);

}

// ------------------------------------------------
// STYLES
// ------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#0e0e14",
  },

  title: {
    color: "#FFD54F",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },

  vs: {
    color: "#4FC3F7",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },

  timer: {
    color: "#FFD54F",
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
