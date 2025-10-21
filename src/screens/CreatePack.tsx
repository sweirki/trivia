import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { usePacks } from '../context/packStore';

export default function CreatePack() {
  const { createPack, packs } = usePacks();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');

  const handleCreate = () => {
    const question = {
      question: questionText,
      options,
      answer: parseInt(answer),
    };
    createPack({ name, category, questions: [question] });
    setName('');
    setCategory('');
    setQuestionText('');
    setOptions(['', '', '', '']);
    setAnswer('');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Create Trivia Pack</Text>
      <TextInput placeholder="Pack Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Category" value={category} onChangeText={setCategory} />
      <TextInput placeholder="Question" value={questionText} onChangeText={setQuestionText} />
      {options.map((opt, i) => (
        <TextInput
          key={i}
          placeholder={`Option ${i + 1}`}
          value={opt}
          onChangeText={(text) => {
            const updated = [...options];
            updated[i] = text;
            setOptions(updated);
          }}
        />
      ))}
      <TextInput placeholder="Correct Option Index (0-3)" value={answer} onChangeText={setAnswer} keyboardType="numeric" />
      <Button title="Create Pack" onPress={handleCreate} />

      <Text style={{ marginTop: 20 }}>Your Packs:</Text>
      {packs.map((p) => (
        <View key={p.id} style={{ marginVertical: 10 }}>
          <Text>{p.name} ({p.category})</Text>
          <Text>Questions: {p.questions.length}</Text>
        </View>
      ))}
    </View>
  );
}