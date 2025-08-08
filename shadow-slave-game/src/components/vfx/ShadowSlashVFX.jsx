// Simple expanding ring VFX — scales up and fades out, then removes itself from the store.
import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../../store/gameStore'

export default function ShadowSlashVFX({ vfx }) {
  const ref = useRef()
  const start = Date.now()

  // schedule removal after lifetime ends
  useEffect(() => {
    const timeout = setTimeout(() => useGameStore.getState().removeVFX(vfx.id), 600)
    return () => clearTimeout(timeout)
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const t = (Date.now() - start) / 600
    ref.current.scale.setScalar(1 + t * 3)
    if (ref.current.material) ref.current.material.opacity = Math.max(0, 1 - t)
  })

  return (
    <mesh ref={ref} position={vfx.pos} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.2, 0.6, 32]} />
      <meshBasicMaterial transparent opacity={0.9} side={2} />
    </mesh>
  )
}
