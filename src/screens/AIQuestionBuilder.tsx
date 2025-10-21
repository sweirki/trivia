import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { generateAIQuestion } from '../utils/questionAI';
import { usePacks } from '../context/packStore';
import { useStrings } from '../i18n/useStrings';

export default function AIQuestionBuilder() {
  const [category, setCategory] = useState('general');
  const [difficulty, setDifficulty] = useState('medium');
  const [language, setLanguage] = useState('en');
  const [questions, setQuestions] = useState([]);

  const { addPack } = usePacks();
  const { t } = useStrings();

  const generatePack = async () => {
    const newQuestions = [];
    for (let i = 0; i < 5; i++) {
      const q = await generateAIQuestion(category, difficulty, language);
      newQuestions.push(q);
    }

    const pack = {
      id: Date.now(),
      title: `AI Pack (${category}, ${difficulty}, ${language})`,
      questions: newQuestions,
      source: 'AI (live)',
      category,
      difficulty,
      language,
    };

    addPack(pack);
    setQuestions(newQuestions);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🧠 {t.generate_pack}</Text>

      <Text style={styles.label}>{t.category}:</Text>
      <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
        <Picker.Item label="General" value="general" />
        <Picker.Item label="Science" value="science" />
        <Picker.Item label="History" value="history" />
        <Picker.Item label="Sports" value="sports" />
      </Picker>

      <Text style={styles.label}>{t.difficulty}:</Text>
      <Picker selectedValue={difficulty} onValueChange={setDifficulty} style={styles.picker}>
        <Picker.Item label="Easy" value="easy" />
        <Picker.Item label="Medium" value="medium" />
        <Picker.Item label="Hard" value="hard" />
      </Picker>

      <Text style={styles.label}>{t.language}:</Text>
      <TextInput
        value={language}
        onChangeText={setLanguage}
        placeholder="e.g. en, ar, es"
        style={styles.input}
      />

      <Button title={t.generate} onPress={generatePack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 20,
    marginBottom: 16,
  },
  label: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  picker: {
    marginVertical: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 8,
    borderRadius: 6,
  },
});