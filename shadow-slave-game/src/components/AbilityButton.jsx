// Button that triggers an ability. It checks cooldowns and player essence before executing.
import React from 'react'
import { useGameStore } from '../store/gameStore'
import { abilityDefs } from '../game/abilities'

export default function AbilityButton({ keyName }) {
  const def = abilityDefs[keyName]
  const cooldowns = useGameStore(s => s.cooldowns)
  const rem = Math.max(0, (cooldowns[keyName] || 0) - Date.now() / 1000)
  const useEssence = useGameStore(s => s.useEssence)
  const setCooldown = useGameStore(s => s.setCooldown)
  const storeApi = useGameStore // pass the hook object to ability exec

  const onClick = () => {
    if (rem > 0) return
    if (!useEssence(def.essenceCost)) return
    const result = def.exec({ storeApi })
    if (result && result.vfx) useGameStore.getState().addVFX(result.vfx)
    // set the cooldown to prevent immediate reuse
    setCooldown(keyName, def.cooldown)
  }

  return (
    <div className="ability" onClick={onClick} title={`${def.name} — Cost ${def.essenceCost}`}>
      <div className="label">{def.name}</div>
      {rem > 0 && <div className="cooldownOverlay">{rem.toFixed(1)}s</div>}
    </div>
  )
}
