import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useCoins } from '../context/coinStore';
import { usePacks } from '../context/packStore';
import sportsPack from '../data/packs/sports.json';

export default function TriviaGame({ pack = sportsPack }) {
  const coinContext = useCoins?.() || {};
  const packContext = usePacks?.() || {};
  const { coins = 0, addCoins = () => {} } = coinContext;
  const { incrementStats = () => {} } = packContext;

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(10);
  const [finished, setFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const questions = Array.isArray(pack?.questions) ? pack.questions : [];
  const question = questions[index];

  // Countdown timer logic
  useEffect(() => {
    if (!question || showAnswer) return;
    timerRef.current && clearInterval(timerRef.current);
    setTimer(10);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(-1); // timeout
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [index]);

  const handleAnswer = (i: number) => {
  timerRef.current && clearInterval(timerRef.current);
  const correct = i === question?.answer;

  if (correct) {
    setScore((s) => s + 100);
    setStreak((s) => s + 1);
    addCoins(10);
  } else {
    setStreak(0);
  }

  // ✅ Defer context update to avoid setState while rendering
  if (pack?.id) {
    setTimeout(() => incrementStats(pack.id, correct), 0);
  }

  setShowAnswer(true);
};


  const nextQuestion = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((prev) => prev + 1);
    setShowAnswer(false);
  };

  if (finished || !question) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>🏁 Quiz Complete!</Text>
        <Text style={styles.summary}>
          Final Score: {score} pts{'\n'}Longest Streak: {streak}
        </Text>
        <Text>You have {coins} coins total.</Text>
        <Button title="Play Again" onPress={() => {
          setIndex(0);
          setScore(0);
          setStreak(0);
          setFinished(false);
        }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>⏱ {timer}s | 💰 {coins} | ⭐ {score}</Text>
      <Text style={styles.question}>{question.question}</Text>
      {question.options?.map((opt, i) => (
        <Button key={i} title={opt} onPress={() => handleAnswer(i)} />
      ))}
      {showAnswer && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ marginBottom: 5 }}>
            {question.options[question.answer]} is correct!
          </Text>
          <Button title="Next Question" onPress={nextQuestion} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  question: {
    marginVertical: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  summary: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
});
