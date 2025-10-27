import React, { createContext, useContext, useState } from 'react';

const CoinContext = createContext(null);

export const CoinProvider = ({ children }) => {
  const [coins, setCoins] = useState(100); // Start with 100 for testing
  const addCoins = (amount: number) => setCoins((prev) => prev + amount);

  return (
    <CoinContext.Provider value={{ coins, addCoins }}>
      {children}
    </CoinContext.Provider>
  );
};

export const useCoins = () => useContext(CoinContext);