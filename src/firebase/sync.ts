import { db } from './config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export async function syncPack(pack) {
  try {
    await addDoc(collection(db, 'packs'), pack);
  } catch (err) {
    console.warn('Pack sync failed:', err);
  }
}

export async function fetchPacks() {
  try {
    const snapshot = await getDocs(collection(db, 'packs'));
    return snapshot.docs.map((doc) => doc.data());
  } catch (err) {
    console.warn('Pack fetch failed:', err);
    return [];
  }
}