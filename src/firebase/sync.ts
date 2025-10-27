// src/firebase/sync.ts
import { db } from './config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

/**
 * Uploads a single pack to Firestore
 */
export async function syncPack(pack: any) {
  try {
    if (!db) {
      console.warn('⚠️ Firestore DB not ready yet. Skipping syncPack.');
      return;
    }
    const packsRef = collection(db, 'packs');
    if (!packsRef) {
      console.warn('⚠️ Could not get packs collection.');
      return;
    }
    await addDoc(packsRef, pack);
  } catch (err) {
    console.warn('⚠️ Pack sync failed:', err);
  }
}

/**
 * Fetches all packs from Firestore (safe fallback)
 */
export async function fetchPacks() {
  try {
    if (!db) {
      console.warn('⚠️ Firestore DB not ready yet. Returning empty pack list.');
      return [];
    }
    const packsRef = collection(db, 'packs');
    if (!packsRef) {
      console.warn('⚠️ Could not get packs collection.');
      return [];
    }
    const snapshot = await getDocs(packsRef);
    if (!snapshot || !snapshot.docs) return [];
    return snapshot.docs.map((doc) => doc.data());
  } catch (err) {
    console.warn('⚠️ Pack fetch failed:', err);
    return [];
  }
}
