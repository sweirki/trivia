import React, { createContext, useContext, useState } from 'react';

const PackContext = createContext(null);

export const PackProvider = ({ children }) => {
  const [packs, setPacks] = useState([]);

  const createPack = ({ name, category, questions }) => {
    const newPack = {
      id: Date.now(),
      name,
      category,
      questions,
    };
    setPacks((prev) => [...prev, newPack]);
  };

  const getPackById = (id) => packs.find((p) => p.id === id);

  const generatePack = () => {
    const newPack = {
      id: Date.now(),
      name: 'AI Pack ' + Date.now(),
      category: 'General',
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
    setPacks((prev) => [...prev, newPack]);
  };

  return (
    <PackContext.Provider value={{ packs, createPack, getPackById, generatePack }}>
      {children}
    </PackContext.Provider>
  );
};

export const usePacks = () => useContext(PackContext);