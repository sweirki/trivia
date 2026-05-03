import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";

const QUESTION_TIME = 15;

export default function RankedMatch() {
  const {
    questions,
    currentQuestionIndex,
    matchState,
    startRankedMatch,
    handlePlayerAnswer,
    handleAIDecision,
  } = useArenaStore();

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const answeredRef = useRef(false);

  const q = questions[currentQuestionIndex];
  const blocked = !q;

  // ---------------------------------
  // START RANKED
  // ---------------------------------
  useEffect(() => {
    if (matchState === "idle") {
      startRankedMatch();
    }
  }, [matchState]);

  // ---------------------------------
  // TIMER
  // ---------------------------------
  useEffect(() => {
    if (matchState !== "in-match") return;
    if (!q) return;

    answeredRef.current = false;
    setTimeLeft(QUESTION_TIME);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          if (!answeredRef.current) {
            answeredRef.current = true;
            handlePlayerAnswer(false);
            handleAIDecision(currentQuestionIndex);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, matchState, q]);

  // ---------------------------------
  // FINISHED → RESULT
  // ---------------------------------
  useEffect(() => {
    if (matchState === "finished") {
    router.replace("/(app)/arena_reset/ranked/RankedResult");
    }
  }, [matchState]);

  // ---------------------------------
  // ANSWER HANDLER
  // ---------------------------------
  const handleAnswer = (answer: string) => {
    if (answeredRef.current) return;
    answeredRef.current = true;

    const isCorrect = answer === q.correct;

    handlePlayerAnswer(isCorrect);
    handleAIDecision(currentQuestionIndex);
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
          Ranked Question {currentQuestionIndex + 1}
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
