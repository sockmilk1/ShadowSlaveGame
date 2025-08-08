// Pulsing sphere to show the stun effect.
import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../../store/gameStore'

export default function BindingShadowsVFX({ vfx }) {
  const ref = useRef()
  const start = Date.now()

  useEffect(() => {
    const t = setTimeout(() => useGameStore.getState().removeVFX(vfx.id), 900)
    return () => clearTimeout(t)
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const p = (Date.now() - start) / 900
    ref.current.scale.setScalar(1 + Math.sin(p * Math.PI * 2) * 0.2)
    if (ref.current.material) ref.current.material.opacity = Math.max(0, 1 - p)
  })

  return (
    <mesh position={vfx.pos} ref={ref}>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshBasicMaterial transparent opacity={0.9} />
    </mesh>
  )
}
