import React from 'react';
import { View, Text, Button } from 'react-native';
import { usePacks } from '../context/packStore';

export default function GeneratePack() {
  const { generatePack, packs } = usePacks();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>AI Pack Generator</Text>
      <Button title="Generate AI Pack" onPress={generatePack} />

      <Text style={{ marginTop: 20 }}>Generated Packs:</Text>
      {packs.map((p) => (
        <View key={p.id} style={{ marginVertical: 10 }}>
          <Text>{p.name} ({p.category})</Text>
          <Text>Questions: {p.questions.length}</Text>
        </View>
      ))}
    </View>
  );
}