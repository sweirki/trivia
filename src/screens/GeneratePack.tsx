import React, { useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { generateAIQuestion } from '../utils/questionAI';
import { usePacks } from '../context/packStore';

export default function GeneratePack() {
  const [questions, setQuestions] = useState([]);
  const { addPack } = usePacks();

  const generatePack = async () => {
    const newQuestions = [];
    for (let i = 0; i < 5; i++) {
      const q = await generateAIQuestion();
      newQuestions.push(q);
    }
    const pack = {
      id: Date.now(),
      title: 'AI Pack',
      questions: newQuestions,
      source: 'AI (live)',
    };
    addPack(pack);
    setQuestions(newQuestions);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>🧠 Generate AI Pack</Text>
      <Button title="Generate 5 Questions" onPress={generatePack} />
      <FlatList
        data={questions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text>{item.question}</Text>
            {item.options.map((opt, i) => (
              <Text key={i}>• {opt}</Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}