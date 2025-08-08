// Enemy component with a very small AI: move toward world origin and attack when close.
// Note: we mutate the passed `enemy` object properties like `stunned` and `_atkTimer`.
// Mutating objects inside r3f useFrame is common for cheap transient state; persistent changes go through the store.
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'

export default function Enemy({ enemy }) {
  const ref = useRef()
  const damagePlayer = useGameStore(s => s.damagePlayer)

  useFrame((state, delta) => {
    if (!ref.current) return
    if (!enemy) return
    if (enemy.hp <= 0) return
    // if stunned, decrement timer and skip movement
    if (enemy.stunned && enemy.stunned > 0) {
      enemy.stunned = Math.max(0, enemy.stunned - delta)
      return
    }

    // vector towards origin (player presumed at 0,0,0)
    const dx = -ref.current.position.x
    const dz = -ref.current.position.z
    const dist = Math.hypot(dx, dz)

    if (dist > 1.2) {
      // move toward player
      ref.current.position.x += (dx / dist) * (enemy.speed || 0.8) * delta
      ref.current.position.z += (dz / dist) * (enemy.speed || 0.8) * delta
    } else {
      // in attack range: handle attack cooldown on enemy object
      enemy._atkTimer = (enemy._atkTimer || 0) - delta
      if ((enemy._atkTimer || 0) <= 0) {
        enemy._atkTimer = enemy.attackSpeed || 1.5
        // damage the player via store action (damage factoring player's DEF)
        damagePlayer(Math.max(0, (enemy.atk || 4) - useGameStore.getState().player.stats.def))
      }
    }
  })

  if (!enemy || enemy.hp <= 0) return null

  return (
    <mesh ref={ref} position={enemy.pos} castShadow>
      <sphereGeometry args={[0.5, 12, 12]} />
      <meshStandardMaterial color={enemy.color || '#b33'} />
      <Html distanceFactor={8} position={[0, 0.9, 0]} center>
        <div style={{ background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>
          {enemy.hp} HP
        </div>
      </Html>
    </mesh>
  )
}
