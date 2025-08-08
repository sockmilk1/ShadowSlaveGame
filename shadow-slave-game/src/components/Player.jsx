// Player component: renders a GLTF model if present, otherwise a fallback mesh.
// It also demonstrates where you'd trigger animations for abilities/attacks.
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

export default function Player() {
  const ref = useRef()

  // Try to load a GLB; if missing, we catch the error and render the fallback instead.
  // useGLTF throws if the file doesn't exist in development, so we guard it.
  let scene = null
  try {
    const gltf = useGLTF('/assets/models/rook.glb')
    scene = gltf.scene
  } catch (e) {
    // No model: we'll render the fallback mesh below
  }

  // simple idle rotation/sway
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05
  })

  return (
    <group ref={ref} position={[0, 0, 0]} dispose={null}>
      {scene ? (
        // If a GLB is found, attach it
        <primitive object={scene} scale={[1.0, 1.0, 1.0]} />
      ) : (
        // Fallback: simple cylinder representing the player
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.6, 0.4, 1.6, 12]} />
          <meshStandardMaterial color={'#111'} metalness={0.2} roughness={0.6} />
        </mesh>
      )}
    </group>
  )
}
