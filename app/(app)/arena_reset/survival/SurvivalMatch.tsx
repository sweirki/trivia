import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";

const QUESTION_TIME = 12;

export default function SurvivalMatch() {
  const {
    questions,
    currentQuestionIndex,
    matchState,
    startSurvival,
    survivalCorrect,
    survivalWrong,
  } = useArenaStore();

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const answeredRef = useRef(false);

  // ---------------------------------
  // START SURVIVAL
  // ---------------------------------
  useEffect(() => {
    if (matchState === "idle") {
      startSurvival();
    }
  }, [matchState]);

  // ---------------------------------
  // TIMER
  // ---------------------------------
  useEffect(() => {
    if (matchState !== "in-match") return;

    answeredRef.current = false;
    setTimeLeft(QUESTION_TIME);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          if (!answeredRef.current) {
            answeredRef.current = true;
            survivalWrong();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, matchState]);

  // ---------------------------------
  // GAME OVER → RESULT
  // ---------------------------------
 useEffect(() => {
  startSurvival();
}, []);


  const q = questions?.[currentQuestionIndex];
  const blocked = !q;



  // ---------------------------------
  // ANSWER HANDLER
  // ---------------------------------
  const handleAnswer = (answer: string) => {
    if (answeredRef.current) return;
    answeredRef.current = true;

   if (answer === q.correct) {
  survivalCorrect();
} else {
  survivalWrong();
}

  };

  // ---------------------------------
  // RENDER
  // ---------------------------------
 return (
  <View style={styles.container}>
    {blocked ? (
      <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
        Loading…
      </Text>
    ) : (
      <>
        <Text style={styles.header}>
          Survival Round {currentQuestionIndex + 1}
        </Text>

        <Text style={styles.timer}>⏳ {timeLeft}s</Text>

        <Text style={styles.question}>{q.text}</Text>

        {q.answers.map((ans: string) => (
          <TouchableOpacity
            key={ans}
            style={styles.answerButton}
            onPress={() => handleAnswer(ans)}
          >
            <Text style={styles.answerText}>{ans}</Text>
          </TouchableOpacity>
        ))}
      </>
    )}
  </View>
);

}

// ---------------------------------
// STYLES
// ---------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 20,
    backgroundColor: "#0e0e14",
  },

  header: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },

  timer: {
    color: "#E53935",
    fontSize: 26,
    textAlign: "center",
    marginVertical: 15,
  },

  question: {
    color: "#fff",
    fontSize: 20,
    marginVertical: 20,
    textAlign: "center",
  },

  answerButton: {
    backgroundColor: "#1c1c29",
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
  },

  answerText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});

