import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { useTournamentStore } from "@/arena/store/useTournamentStore";

export default function SemifinalMatch1() {
  const {
    questions,
    currentQuestionIndex,
    loadQuestions,
    nextQuestion,
    updatePlayerScore,
    updateOpponentScore,
    setMatchState,
    matchState,
  } = useArenaStore();

  const { tournament, submitMatchResult } = useTournamentStore((state) => ({
  tournament: state.tournament,
  submitMatchResult: state.submitMatchResult,
}));


  const [timeLeft, setTimeLeft] = useState(10);
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


    const sampleQs = [
      {
        question: "Which gas do plants absorb?",
        answers: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correctAnswer: "Carbon Dioxide",
      },
      {
        question: "Which ocean is the largest?",
        answers: ["Atlantic", "Indian", "Pacific", "Arctic"],
        correctAnswer: "Pacific",
      },
      {
        question: "Who painted the Mona Lisa?",
        answers: ["Van Gogh", "Da Vinci", "Picasso", "Michelangelo"],
        correctAnswer: "Da Vinci",
      },
    ];

    loadQuestions(sampleQs);
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
  // AI ANSWER SIMULATION
  // ------------------------------------------------
  useEffect(() => {
    if (!opponent || !q) return;

    const randomDelay = Math.floor(Math.random() * 3000) + 1000; // AI answers 1–4 sec
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
    if (ans === q.correctAnswer) {
      updatePlayerScore(1);
    }
    nextStageOrNextQuestion();
  };

  const handleWrong = () => {
    nextStageOrNextQuestion();
  };

  // ------------------------------------------------
  // CHECK END OF QUESTIONS → GO TO MATCH 2
  // ------------------------------------------------
  const nextStageOrNextQuestion = () => {
    const last = currentQuestionIndex === questions.length - 1;

    if (last) {
     submitMatchResult("S1", 1, 0);

      router.replace("/(app)/arena_reset/tournaments/SemifinalMatch2");
      return;
    }

    nextQuestion();
  };



  return (
  <View style={styles.container}>
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

        <Text style={styles.question}>{q.question}</Text>

        {q.answers.map((a, i) => (
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
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },

  vs: {
    color: "#4FC3F7",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },

  timer: {
    color: "#FFD54F",
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



