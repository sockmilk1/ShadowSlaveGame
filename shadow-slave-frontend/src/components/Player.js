import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const speed = 0.1;

export default function Player() {
  const ref = useRef();
  const [keys, setKeys] = useState({});

  // Handle key press & release
  useEffect(() => {
    const handleKeyDown = (e) => setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
    const handleKeyUp = (e) => setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!ref.current) return;

    const direction = new THREE.Vector3();

    if (keys['w'] || keys['arrowup']) direction.z -= speed;
    if (keys['s'] || keys['arrowdown']) direction.z += speed;
    if (keys['a'] || keys['arrowleft']) direction.x -= speed;
    if (keys['d'] || keys['arrowright']) direction.x += speed;

    ref.current.position.add(direction);
  });

  return (
    <mesh ref={ref} position={[0, 1, 0]}>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="darkblue" />
    </mesh>
  );
}
