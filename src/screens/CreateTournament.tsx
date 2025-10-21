import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Button } from 'react-native';
import { useTournaments } from '../context/tournamentStore';
import { usePacks } from '../context/packStore';

export default function CreateTournament() {
  const { createTournament, tournaments, joinTournament } = useTournaments();
  const { packs } = usePacks();

  const [name, setName] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState(null);

  const handleCreate = () => {
    const fee = parseInt(entryFee);
    if (!name || isNaN(fee) || !selectedPackId) return;
    createTournament({ name, entryFee: fee, isPrivate, packId: selectedPackId });
    setName('');
    setEntryFee('');
    setIsPrivate(false);
    setSelectedPackId(null);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Create Tournament</Text>

      <TextInput
        placeholder="Tournament Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <TextInput
        placeholder="Entry Fee"
        value={entryFee}
        onChangeText={setEntryFee}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Text>Private?</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} />
      </View>

      <Text>Select Pack:</Text>
      {packs.map((p) => (
        <Button
          key={p.id}
          title={`${p.name} (${p.category})`}
          onPress={() => setSelectedPackId(p.id)}
          color={selectedPackId === p.id ? 'green' : undefined}
        />
      ))}

      <Button title="Create Tournament" onPress={handleCreate} />

      <Text style={{ fontSize: 18, marginTop: 20 }}>Available Tournaments:</Text>
      {tournaments.map((t) => (
        <View key={t.id} style={{ marginVertical: 10, padding: 10, borderWidth: 1 }}>
          <Text style={{ fontSize: 16 }}>{t.name}</Text>
          <Text>Entry Fee: {t.entryFee} coins</Text>
          <Text>Players: {t.players.length} / 5</Text>
          <Text>Status: {t.isClosed ? 'Closed' : 'Open'}</Text>
          {t.winner && <Text>🏆 Winner: {t.winner}</Text>}
          {!t.isClosed && (
            <Button title="Join" onPress={() => joinTournament(t.id, 'Player1')} />
          )}
        </View>
      ))}
    </View>
  );
}