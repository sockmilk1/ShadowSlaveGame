import React from 'react';
import { useGameManager } from '../context/GameManager';

export default function GameUI() {
  const { player } = useGameManager();

  return (
    <div>
      <h2>Player Info</h2>
      <p>Name: {player.name}</p>
      <p>Level: {player.level}</p>
      <p>HP: {player.hp}</p>
      <p>Essence: {player.essence}</p>
      <p>XP: {player.xp}</p>
      <h3>Abilities:</h3>
      <ul>
        {player.abilities.map((ability, idx) => (
          <li key={idx}>{ability}</li>
        ))}
      </ul>
    </div>
  );
}
