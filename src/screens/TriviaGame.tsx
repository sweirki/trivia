import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useCoins } from '../context/coinStore';
import { usePacks } from '../context/packStore';
import sportsPack from '../data/packs/sports.json';

export default function TriviaGame({ pack = sportsPack }) {
  const { coins, addCoins } = useCoins();
  const { incrementStats } = usePacks();

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const question = pack.questions[index];

  if (!question) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>🎉 Game Over!</Text>
        <Text>You earned {coins} coins.</Text>
        <Button title="Grant 100 Coins (Test)" onPress={() => addCoins(100)} />
      </View>
    );
  }

  const handleAnswer = (i: number) => {
    const correct = i === question.answer;
    if (correct) addCoins(10);
    if (pack.id) incrementStats(pack.id, correct);
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    setIndex((prev) => prev + 1);
    setShowAnswer(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Coins: {coins}</Text>
      <Text style={styles.question}>{question.question}</Text>
      {question.options.map((opt, i) => (
        <Button key={i} title={opt} onPress={() => handleAnswer(i)} />
      ))}
      {showAnswer && <Button title="Next" onPress={nextQuestion} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  question: {
    marginVertical: 12,
    fontSize: 16,
  },
});