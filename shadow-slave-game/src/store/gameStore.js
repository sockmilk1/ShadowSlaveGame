// Zustand store: holds player, enemies, UI state and helper actions.
// Important: all state mutations go through `set` to keep React subscriptions correct.
import { create } from 'zustand'
import { newId } from '../utils/id'

// Export the hook `useGameStore`
export const useGameStore = create((set, get) => ({
  // Player state
  player: {
    id: newId(),
    name: 'Rook',
    level: 1,
    xp: 0,
    xpToNext: 100,
    hp: 120,
    maxHp: 120,
    essence: 60,
    maxEssence: 60,
    stats: { atk: 12, def: 5 },
    _shield: 0 // temporary shield value
  },

  enemies: [],   // array of enemy objects
  vfx: [],       // visual effects to render
  cooldowns: {}, // ability cooldown expiration times (seconds epoch)
  audioQueue: [],

  // --- Actions ---
  addXP: (amount) => {
    // add XP and handle level-ups synchronously
    set(state => {
      const player = { ...state.player }
      player.xp += amount
      const events = []
      while (player.xp >= player.xpToNext) {
        player.xp -= player.xpToNext
        player.level += 1
        player.xpToNext = Math.round(player.xpToNext * 1.5)
        player.maxHp += 20
        player.hp = player.maxHp
        player.maxEssence += 8
        player.essence = player.maxEssence
        player.stats.atk += 3
        player.stats.def += 1
        events.push('levelup')
      }
      return { player, audioQueue: [...state.audioQueue, ...events] }
    })
  },

  damagePlayer: (amount) => set(state => ({ player: { ...state.player, hp: Math.max(0, state.player.hp - amount) } })),

  healPlayer: (amount) => set(state => ({ player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + amount) } })),

  useEssence: (amount) => {
    const p = get().player
    if (p.essence < amount) return false
    set({ player: { ...p, essence: p.essence - amount } })
    return true
  },

  setCooldown: (key, seconds) => set(state => ({ cooldowns: { ...state.cooldowns, [key]: Date.now() / 1000 + seconds } })),

  cooldownRemaining: (key) => {
    const t = get().cooldowns[key] || 0
    const rem = Math.max(0, t - Date.now() / 1000)
    return Math.round(rem * 10) / 10
  },

  spawnEnemy: (template) => set(state => ({ enemies: [...state.enemies, { ...template, id: newId() }] })),

  removeEnemy: (id) => set(state => ({ enemies: state.enemies.filter(e => e.id !== id) })),

  damageEnemy: (id, dmg) => set(state => ({ enemies: state.enemies.map(e => e.id === id ? { ...e, hp: Math.max(0, e.hp - dmg) } : e) })),

  addVFX: (vfx) => set(state => ({ vfx: [...get().vfx, { ...vfx, id: newId(), created: Date.now() }] })),

  removeVFX: (id) => set(state => ({ vfx: get().vfx.filter(v => v.id !== id) })),

  popAudioEvent: () => {
    const q = get().audioQueue.slice()
    const next = q.shift()
    set({ audioQueue: q })
    return next
  }
}))
