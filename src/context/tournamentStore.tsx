import React, { createContext, useContext, useState } from 'react';
import { useCoins } from './coinStore';

const TournamentContext = createContext(null);

export const TournamentProvider = ({ children }) => {
  const [tournaments, setTournaments] = useState([]);
  const { coins, addCoins } = useCoins();

  const createTournament = ({ name, entryFee, isPrivate, packId }) => {
    const newTournament = {
      id: Date.now(),
      name,
      entryFee,
      isPrivate,
      prizePool: entryFee * 5,
      players: [],
      scores: {},
      winner: null,
      isClosed: false,
      packId,
    };
    setTournaments((prev) => [...prev, newTournament]);
  };

  const joinTournament = (id, player) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.isClosed || t.players.includes(player)) return t;
        if (coins < t.entryFee) return t;

        addCoins(-t.entryFee);
        const updatedPlayers = [...t.players, player];
        const isFull = updatedPlayers.length >= 5;

        return {
          ...t,
          players: updatedPlayers,
          scores: { ...t.scores, [player]: 0 },
          isClosed: isFull,
        };
      })
    );
  };

  const recordScore = (id, player, score) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== id || !t.players.includes(player)) return t;
        const updatedScores = { ...t.scores, [player]: score };
        const winner = Object.entries(updatedScores).sort((a, b) => b[1] - a[1])[0][0];
        return { ...t, scores: updatedScores, winner };
      })
    );
  };

  return (
    <TournamentContext.Provider value={{ tournaments, createTournament, joinTournament, recordScore }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournaments = () => useContext(TournamentContext);