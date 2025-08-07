import React from 'react';
import GameScene from './components/GameScene';
import { GameManagerProvider } from './context/GameManager';
import GameUI from './components/GameUI';

function App() {
  return (
    <GameManager>
      <GameScene />
      <GameUI /> {/* 👈 2D UI overlay on top of the 3D game */}
    </GameManager>
  );
}

export default App;
