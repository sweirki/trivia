import React, { createContext, useContext, useState } from 'react';
import { usePacks } from './packStore';

const MatchContext = createContext(null);

export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const { packs } = usePacks();

  const createMatch = ({ playerNames, packId }) => {
    const matchId = Date.now();
    const pack = packs.find((p) => p.id === packId);
    const newMatch = {
      id: matchId,
      players: playerNames,
      scores: Object.fromEntries(playerNames.map((p) => [p, 0])),
      currentQuestion: 0,
      pack,
      isComplete: false,
    };
    setMatches((prev) => [...prev, newMatch]);
  };

  const submitAnswer = ({ matchId, player, isCorrect }) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId || m.isComplete) return m;
        const updatedScore = isCorrect ? m.scores[player] + 1 : m.scores[player];
        return {
          ...m,
          scores: { ...m.scores, [player]: updatedScore },
        };
      })
    );
  };

  const nextQuestion = (matchId) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const next = m.currentQuestion + 1;
        const isDone = next >= m.pack.questions.length;
        return {
          ...m,
          currentQuestion: next,
          isComplete: isDone,
        };
      })
    );
  };

  return (
    <MatchContext.Provider value={{ matches, createMatch, submitAnswer, nextQuestion }}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatches = () => useContext(MatchContext);