// Renders VFX components based on vfx descriptors stored in the game store.
import React from 'react'
import ShadowSlashVFX from './vfx/ShadowSlashVFX'
import BindingShadowsVFX from './vfx/BindingShadowsVFX'
import BarrierVFX from './vfx/BarrierVFX'
import { useGameStore } from '../store/gameStore'

export default function VFXManager() {
  const vfxs = useGameStore(s => s.vfx)

  return (
    <>
      {vfxs.map(v => {
        if (v.type === 'shadowSlash') return <ShadowSlashVFX key={v.id} vfx={v} />
        if (v.type === 'bindingShadows') return <BindingShadowsVFX key={v.id} vfx={v} />
        if (v.type === 'barrier') return <BarrierVFX key={v.id} vfx={v} />
        return null
      })}
    </>
  )
}
