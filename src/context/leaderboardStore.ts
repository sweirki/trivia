import { createContext, useContext, useState } from 'react';
import { onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

const LeaderboardContext = createContext(null);

export const LeaderboardProvider = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  const getLeaderboard = (tournamentId: string) => {
    setLoading(true);
    const ref = collection(db, 'leaderboards', tournamentId, 'players');
    const q = query(ref, orderBy('score', 'desc'), limit(10));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setLeaderboard(data);
      setLoading(false);
    });
  };

  return (
    <LeaderboardContext.Provider value={{ leaderboard, loading, getLeaderboard }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => useContext(LeaderboardContext);