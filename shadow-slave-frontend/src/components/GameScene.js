import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Player from './Player';
import Enemy from './Enemy';

export default function GameScene() {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Stars />

      <Player />
      <Enemy position={[5, 1, 0]} />
      <Enemy position={[-4, 1, 3]} />
      <Enemy position={[2, 1, -5]} />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <OrbitControls />
    </Canvas>
  );
}
