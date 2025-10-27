import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useTournaments } from '../context/tournamentStore';
import { usePacks } from '../context/packStore';

export default function PlayTournament({ tournamentId, player }) {
  const { tournaments, recordScore } = useTournaments();
  const { getPackById } = usePacks();
  const tournament = tournaments.find((t) => t.id === tournamentId);
  const pack = getPackById(tournament?.packId);

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  if (!tournament || !pack) return <Text>Loading...</Text>;

  const question = pack.questions[current];

  const handleAnswer = (index) => {
    if (index === question.answer) setScore((s) => s + 1);
    setCurrent((c) => c + 1);
  };

  if (current >= pack.questions.length) {
    recordScore(tournamentId, player, score);
    return (
      <View style={{ padding: 20 }}>
        <Text>🏁 Finished!</Text>
        <Text>Your Score: {score} / {pack.questions.length}</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>{question.question}</Text>
      {question.options.map((opt, i) => (
        <Button key={i} title={opt} onPress={() => handleAnswer(i)} />
      ))}
    </View>
  );
}