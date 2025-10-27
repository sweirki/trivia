import React, { useState } from 'react';
import { View, Text, Button, Picker, StyleSheet } from 'react-native';
import { usePacks } from '../context/packStore';
import TriviaGame from './TriviaGame';

export default function TestMode() {
  const [source, setSource] = useState('AI (live)');
  const [selectedPack, setSelectedPack] = useState(null);
  const { getFilteredPacks } = usePacks();

  const startTest = () => {
    const packs = getFilteredPacks({ source });
    if (packs.length > 0) {
      setSelectedPack(packs[Math.floor(Math.random() * packs.length)]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🧪 AI vs Local Test Mode</Text>

      <Text style={styles.label}>Select Source:</Text>
      <Picker selectedValue={source} onValueChange={setSource} style={styles.picker}>
        <Picker.Item label="AI Packs" value="AI (live)" />
        <Picker.Item label="User Packs" value="user" />
        <Picker.Item label="Mixed" value="mixed" />
      </Picker>

      <Button title="Start Test" onPress={startTest} />

      {selectedPack && <TriviaGame pack={selectedPack} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, marginBottom: 16 },
  label: { marginTop: 12, fontWeight: 'bold' },
  picker: { marginVertical: 8 },
});