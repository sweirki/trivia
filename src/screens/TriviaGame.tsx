import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useCoins } from '../context/coinStore';
import sportsPack from '../data/packs/sports.json';

export default function TriviaGame() {
  const { coins, addCoins } = useCoins();
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const question = sportsPack[index];

  if (!question) {
    return (
      <View>
        <Text>Game Over!</Text>
        <Text>You earned {coins} coins.</Text>
        <Button title="Grant 100 Coins (Test)" onPress={() => addCoins(100)} />
      </View>
    );
  }

  const handleAnswer = (i: number) => {
    if (i === question.answer) {
      addCoins(10);
    }
    setShowAnswer(true);
  };

  return (
    <View>
      <Text>Coins: {coins}</Text>
      <Text>{question.question}</Text>
      {question.options.map((opt, i) => (
        <Button key={i} title={opt} onPress={() => handleAnswer(i)} />
      ))}
      {showAnswer && (
        <Button title="Next" onPress={() => {
          setIndex((prev) => prev + 1);
          setShowAnswer(false);
        }} />
      )}
    </View>
  );
}