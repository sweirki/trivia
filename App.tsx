import React from 'react';
import { AuthProvider } from './src/context/authStore'; // 🔐 Phase 22
import { ScrollView, StyleSheet } from 'react-native';
import CreatorDashboard from './src/screens/CreatorDashboard';
import { ThemeProvider } from './src/context/ThemeProvider';
import { CoinProvider } from './src/context/coinStore';
import { PackProvider } from './src/context/packStore';
import { TournamentProvider } from './src/context/tournamentStore';
import { MatchProvider } from './src/context/matchStore';
import { StoreProvider } from './src/context/storeContext';

import CreatePack from './src/screens/CreatePack';
import GeneratePack from './src/screens/GeneratePack';
import AIQuestionBuilder from './src/screens/AIQuestionBuilder';
import CreateTournament from './src/screens/CreateTournament';
import PlayTournament from './src/screens/PlayTournament';
import Leaderboard from './src/screens/Leaderboard';
import TriviaGame from './src/screens/TriviaGame';
import MultiplayerGame from './src/screens/MultiplayerGame';
import CoinStore from './src/screens/CoinStore';
import BoosterShop from './src/screens/BoosterShop';
import LanguageToggle from './src/screens/LanguageToggle'; // 🌍 NEW

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider> {/* ✅ NEW */}
      <CoinProvider>
        <PackProvider>
          <TournamentProvider>
            <MatchProvider>
              <StoreProvider>
                <ScrollView contentContainerStyle={styles.container}>
                  <LanguageToggle /> {/* 🌍 Language switcher */}
                  <CreatePack />
                  <GeneratePack />
                  <AIQuestionBuilder />
                  <CreatorDashboard />
                  <CreateTournament />
                  <PlayTournament tournamentId={123} player="Yaseen" />
                  <Leaderboard tournamentId={123} />
                  <TriviaGame />
                  <MultiplayerGame matchId={456} />
                  <CoinStore />
                  <BoosterShop />
                </ScrollView>
              </StoreProvider>
            </MatchProvider>
          </TournamentProvider>
        </PackProvider>
      </CoinProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
});