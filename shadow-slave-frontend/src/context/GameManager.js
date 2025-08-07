import React, { createContext, useContext, useState } from 'react';

const GameManagerContext = createContext();

export function GameManagerProvider({ children }) {
  const [player, setPlayer] = useState({
    name: 'Sunny',
    level: 1,
    hp: 100,
    essence: 50,
    xp: 0,
    abilities: ['Shadow Slash', 'Binding Shadows'],
  });

  // Add methods to update player, handle combat, etc.

  const value = {
    player,
    setPlayer,
    // Add other game state and functions here
  };

  return (
    <GameManagerContext.Provider value={value}>
      {children}
    </GameManagerContext.Provider>
  );
}

export function useGameManager() {
  const context = useContext(GameManagerContext);
  if (!context) {
    throw new Error('useGameManager must be used within a GameManagerProvider');
  }
  return context;
}
