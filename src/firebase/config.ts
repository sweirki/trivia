import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCoDJkrIkxSHfTdUKc3XzbzSTQirUFvenA',
  authDomain: 'trivia-d6fcc.firebaseapp.com',
  projectId: 'trivia-d6fcc',
  storageBucket: 'trivia-d6fcc.firebasestorage.app',
  messagingSenderId: '559093032741',
  appId: '1:559093032741:web:0fbd9c5b862b8fb3181ccc',
  measurementId: 'G-409NCPEWV1',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);