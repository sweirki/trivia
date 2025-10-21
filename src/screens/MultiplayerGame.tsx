import React from 'react';
import { View, Text, Button } from 'react-native';
import { useMatches } from '../context/matchStore';

export default function MultiplayerGame({ matchId }) {
  const { matches, submitAnswer, nextQuestion } = useMatches();
  const match = matches.find((m) => m.id === matchId);

  if (!match) return <Text>Loading match...</Text>;
  if (match.isComplete) {
    const sorted = Object.entries(match.scores).sort((a, b) => b[1] - a[1]);
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20 }}>🏁 Match Complete</Text>
        {sorted.map(([player, score], i) => (
          <Text key={player}>{i + 1}. {player} — {score} pts</Text>
        ))}
      </View>
    );
  }

  const question = match.pack.questions[match.currentQuestion];

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18 }}>{question.question}</Text>
      {question.options.map((opt, i) => (
        <View key={i} style={{ marginVertical: 5 }}>
          {match.players.map((player) => (
            <Button
              key={player + i}
              title={`${player}: ${opt}`}
              onPress={() => {
                const isCorrect = i === question.answer;
                submitAnswer({ matchId, player, isCorrect });
              }}
            />
          ))}
        </View>
      ))}
      <Button title="Next Question" onPress={() => nextQuestion(matchId)} />
    </View>
  );
}