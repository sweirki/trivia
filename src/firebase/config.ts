import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase modules
export const db = getFirestore(app);
export const auth = getAuth(app);       // ✅ add this line
export const analytics = getAnalytics(app);
