import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

export default function LanguageToggle() {
  const setLanguage = async (lang) => {
    await AsyncStorage.setItem('language', lang);
    Updates.reload(); // Refresh app to apply new language
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🌍 Select Language:</Text>
      <Button title="English 🇬🇧" onPress={() => setLanguage('en')} />
      <Button title="العربية 🇶🇦" onPress={() => setLanguage('ar')} />
      <Button title="Español 🇪🇸" onPress={() => setLanguage('es')} />
      <Button title="Français 🇫🇷" onPress={() => setLanguage('fr')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});