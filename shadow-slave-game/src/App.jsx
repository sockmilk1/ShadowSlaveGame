// Main app scaffolding: sets up the 3D Canvas, scene, UI and seeds a wave.
// Comments explain component responsibilities.
import React, { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useGameStore } from './store/gameStore'
import Player from './components/Player'
import Enemy from './components/Enemy'
import HUD from './components/HUD'
import VFXManager from './components/VFXManager'
import { spawnWave } from './game/spawner'

function Scene() {
  // subscribe to enemies from the store so React re-renders on spawn/removal
  const enemies = useGameStore(state => state.enemies)

  return (
    <>
      {/* Lighting & ground */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 3]} intensity={0.9} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={'#07070b'} />
      </mesh>

      {/* Player + enemies */}
      <Player />
      {enemies.map(e => <Enemy key={e.id} enemy={e} />)}

      {/* Visual effects layer */}
      <VFXManager />
    </>
  )
}

export default function App() {
  // On mount, seed a first wave of enemies
  useEffect(() => {
    spawnWave(1)
  }, [])

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Canvas camera={{ position: [0, 6, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene />
          <Stars />
        </Suspense>
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>

      {/* Heads-up UI (health, abilities, XP) */}
      <HUD />
    </div>
  )
}
