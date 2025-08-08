// Barrier VFX: an icosahedron that fades and scales
import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../../store/gameStore'

export default function BarrierVFX({ vfx }) {
  const ref = useRef()
  const start = Date.now()

  useEffect(() => {
    const t = setTimeout(() => useGameStore.getState().removeVFX(vfx.id), 2000)
    return () => clearTimeout(t)
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const p = (Date.now() - start) / 2000
    if (ref.current.material) ref.current.material.opacity = Math.max(0, 0.8 - p * 0.8)
    ref.current.scale.setScalar(1 + p * 0.5)
  })

  return (
    <mesh position={vfx.pos} ref={ref}>
      <icosahedronGeometry args={[1.6, 1]} />
      <meshPhongMaterial transparent opacity={0.8} shininess={80} />
    </mesh>
  )
}
