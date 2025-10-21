import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { CoinProvider } from './src/context/coinStore';
import { TournamentProvider } from './src/context/tournamentStore';
import { PackProvider } from './src/context/packStore';
import TriviaGame from './src/screens/TriviaGame';
import CreateTournament from './src/screens/CreateTournament';
import CreatePack from './src/screens/CreatePack';
import GeneratePack from './src/screens/GeneratePack';

export default function App() {
  return (
    <CoinProvider>
      <TournamentProvider>
        <PackProvider>
          <ScrollView contentContainerStyle={styles.container}>
            <TriviaGame />
            <CreateTournament />
            <CreatePack />
            <GeneratePack />
          </ScrollView>
        </PackProvider>
      </TournamentProvider>
    </CoinProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
});