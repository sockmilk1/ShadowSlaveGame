import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameManager } from '../context/GameManager'

export default function Enemy({ position = [5, 1, 0] }) {
  const ref = useRef();
  const { takeDamage, gainXP } = useGame();
  const [hp, setHp] = useState(30);
  const [isDead, setIsDead] = useState(false);

  useFrame(({ clock }) => {
    if (isDead || !ref.current) return;

    const playerPos = new THREE.Vector3(0, 1, 0); // assuming player is at (0,1,0)
    const enemyPos = ref.current.position;

    const direction = new THREE.Vector3().subVectors(playerPos, enemyPos).normalize();
    const distance = enemyPos.distanceTo(playerPos);

    if (distance > 1.5) {
      ref.current.position.add(direction.multiplyScalar(0.03));
    } else {
      // Attack player if close enough
      if (Math.floor(clock.getElapsedTime()) % 2 === 0) {
        takeDamage(5);
      }
    }
  });

  const handleHit = () => {
    setHp((prev) => {
      const newHp = prev - 10;
      if (newHp <= 0) {
        setIsDead(true);
        gainXP(25); // XP reward
      }
      return newHp;
    });
  };

  if (isDead) return null;

  return (
    <mesh ref={ref} position={position} onClick={handleHit}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="darkred" />
    </mesh>
  );
}
