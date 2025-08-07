import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';

function Player({ position, setPosition }) {
  const meshRef = useRef();

  // Handle player movement with WASD keys
  useEffect(() => {
    function onKeyDown(e) {
      setPosition(pos => {
        const speed = 0.5;
        let [x, y, z] = pos;
        if (e.key === 'w' || e.key === 'ArrowUp') z -= speed;
        if (e.key === 's' || e.key === 'ArrowDown') z += speed;
        if (e.key === 'a' || e.key === 'ArrowLeft') x -= speed;
        if (e.key === 'd' || e.key === 'ArrowRight') x += speed;
        return [x, y, z];
      });
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setPosition]);

  // Slowly rotate player cube for effect
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color='royalblue' />
    </mesh>
  );
}

function Enemy({ position }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color='red' />
    </mesh>
  );
}

export default function ShadowSlave3D() {
  const [playerPos, setPlayerPos] = useState([0, 0.5, 0]);

  return (
    <>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <Player position={playerPos} setPosition={setPlayerPos} />
        <Enemy position={[3, 0.5, -2]} />
        <mesh
          rotation-x={-Math.PI / 2}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.3} />
        </mesh>
        <OrbitControls />
        <Stats />
      </Canvas>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '10px',
        borderRadius: '8px',
        maxWidth: '300px',
      }}>
        <h2>Shadow Slave 3D</h2>
        <p>Use <b>W A S D</b> or arrow keys to move the blue cube (player).</p>
        <p>Red sphere is an enemy.</p>
        <p>Drag mouse to rotate camera.</p>
      </div>
    </>
  );
}
