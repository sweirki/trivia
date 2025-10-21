import React, { createContext, useContext, useState } from 'react';
import { useCoins } from './coinStore';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const { coins, addCoins } = useCoins();
  const [boosters, setBoosters] = useState({ doublePoints: 0, skipQuestion: 0 });

  const buyCoins = (amount) => {
    addCoins(amount);
  };

  const buyBooster = (type) => {
    const cost = type === 'doublePoints' ? 10 : 5;
    if (coins < cost) return;
    addCoins(-cost);
    setBoosters((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  return (
    <StoreContext.Provider value={{ buyCoins, buyBooster, boosters }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);