import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncPack, fetchPacks } from '../firebase/sync';

const PackContext = createContext(null);

export const PackProvider = ({ children }) => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Load packs from Firebase or fallback to AsyncStorage
  useEffect(() => {
    const loadPacks = async () => {
      try {
        const cloudPacks = await fetchPacks();
        if (cloudPacks.length > 0) {
          setPacks(cloudPacks);
          await AsyncStorage.setItem('packs', JSON.stringify(cloudPacks));
        } else {
          const local = await AsyncStorage.getItem('packs');
          if (local) setPacks(JSON.parse(local));
        }
      } catch (err) {
        console.warn('Pack load failed:', err);
        const local = await AsyncStorage.getItem('packs');
        if (local) setPacks(JSON.parse(local));
      } finally {
        setLoading(false);
      }
    };

    loadPacks();
  }, []);

  // ➕ Create a user-defined pack
  const createPack = async ({ name, category, questions, language = 'en', source = 'user' }) => {
    const newPack = {
      id: Date.now(),
      name,
      category,
      questions,
      language,
      source,
    };
    const updated = [...packs, newPack];
    setPacks(updated);
    await AsyncStorage.setItem('packs', JSON.stringify(updated));
    syncPack(newPack);
  };

  // 🧠 Generate a mock AI pack
  const generatePack = async () => {
    const newPack = {
      id: Date.now(),
      name: 'AI Pack ' + Date.now(),
      category: 'General',
      language: 'en',
      source: 'AI (mock)',
      questions: [
        {
          question: 'What is the capital of France?',
          options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
          answer: 2,
        },
        {
          question: 'Which planet is known as the Red Planet?',
          options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
          answer: 1,
        },
        {
          question: 'Who wrote "Romeo and Juliet"?',
          options: ['Shakespeare', 'Dickens', 'Hemingway', 'Tolkien'],
          answer: 0,
        },
        {
          question: 'What is the boiling point of water?',
          options: ['90°C', '100°C', '110°C', '120°C'],
          answer: 1,
        },
        {
          question: 'Which element has the symbol O?',
          options: ['Gold', 'Oxygen', 'Silver', 'Iron'],
          answer: 1,
        },
      ],
    };
    const updated = [...packs, newPack];
    setPacks(updated);
    await AsyncStorage.setItem('packs', JSON.stringify(updated));
    syncPack(newPack);
  };

  // ❌ Remove a pack
  const removePack = async (id) => {
    const updated = packs.filter((p) => p.id !== id);
    setPacks(updated);
    await AsyncStorage.setItem('packs', JSON.stringify(updated));
    // Optional: delete from Firestore
  };
const incrementStats = async (packId, correct = true) => {
  setPacks((prev) =>
    prev.map((p) =>
      p.id === packId
        ? {
            ...p,
            playCount: (p.playCount || 0) + 1,
            correctCount: correct ? (p.correctCount || 0) + 1 : p.correctCount || 0,
            incorrectCount: !correct ? (p.incorrectCount || 0) + 1 : p.incorrectCount || 0,
          }
        : p
    )
  );
};

  // 🔍 Get pack by ID
  const getPackById = (id) => packs.find((p) => p.id === id);

  // 🔎 Filter packs by language, category, or source
  const getFilteredPacks = ({ language, category, source }) => {
    return packs.filter((p) => {
      return (
        (!language || p.language === language) &&
        (!category || p.category === category) &&
        (!source || p.source === source)
      );
    });
  };

  return (
    <PackContext.Provider
      value={{
        packs,
        loading,
        createPack,
        generatePack,
        removePack,
        getPackById,
        getFilteredPacks,
        incrementStats,
      }}
    >
      {children}
    </PackContext.Provider>
  );
};

export const usePacks = () => useContext(PackContext);