// Data-driven abilities.
// Each ability's exec receives { storeApi } so it can safely call getState/setState.
// Abilities return optional vfx descriptors to spawn visual effects.
export const abilityDefs = {
  shadowSlash: {
    id: 'shadowSlash',
    name: 'Shadow Slash',
    essenceCost: 8,
    cooldown: 2.5,
    // exec is synchronous; more complex abilities could return promises
    exec: ({ storeApi, targetId }) => {
      const api = storeApi.getState()
      const dmg = api.player.stats.atk + 8
      // pick first enemy or an explicit target
      const enemy = api.enemies[0] || api.enemies.find(e => e.id === targetId)
      if (!enemy) return { result: 'no-target' }

      // Apply damage via the store action
      storeApi.getState().damageEnemy(enemy.id, dmg)

      // If killed, remove and grant XP
      if ((enemy.hp - dmg) <= 0) {
        storeApi.getState().removeEnemy(enemy.id)
        storeApi.getState().addXP(30)
      }

      return { result: 'hit', dmg, vfx: { type: 'shadowSlash', pos: enemy.pos || [0, 0.6, -4] } }
    }
  },

  bindingShadows: {
    id: 'bindingShadows',
    name: 'Binding Shadows',
    essenceCost: 12,
    cooldown: 8,
    exec: ({ storeApi }) => {
      const api = storeApi.getState()
      const enemy = api.enemies[0]
      if (!enemy) return { result: 'no-target' }

      // Stun: update the enemies array with a stunned property
      const updated = api.enemies.map(e => e.id === enemy.id ? { ...e, stunned: 2.5 } : e)
      storeApi.setState({ enemies: updated })

      return { result: 'stunned', vfx: { type: 'bindingShadows', pos: enemy.pos || [0, 0.6, -4] } }
    }
  },

  barrier: {
    id: 'barrier',
    name: 'Shadow Barrier',
    essenceCost: 18,
    cooldown: 12,
    exec: ({ storeApi }) => {
      const prev = storeApi.getState()
      // add shield value to player._shield
      storeApi.setState({ player: { ...prev.player, _shield: (prev.player._shield || 0) + 40 } })

      // schedule shield decay after 6s using setTimeout (non-blocking)
      setTimeout(() => {
        const cur = storeApi.getState().player
        storeApi.setState({ player: { ...cur, _shield: Math.max(0, (cur._shield || 0) - 40) } })
      }, 6000)

      return { result: 'barrier', vfx: { type: 'barrier', pos: [0, 1.0, 0] } }
    }
  }
}

export const allAbilityKeys = Object.keys(abilityDefs)
