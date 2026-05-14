// src/storage/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  COSMETICS: 'storage_cosmetics_v1',
  FRIENDS: 'storage_friends_v1',
  CHALLENGES: 'storage_challenges_v1',
  LIVEOPS: 'storage_liveops_v1',
} as const;

export async function saveItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[Storage] Save failed:', key, err);
  }
}

export async function loadItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn('[Storage] Load failed:', key, err);
    return null;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn('[Storage] Remove failed:', key, err);
  }
}


