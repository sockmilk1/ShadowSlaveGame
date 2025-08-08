// Very small wave spawner helper used at boot to seed some enemies.
// You can expand this into timed waves, spawn points, etc.
import { useGameStore } from '../store/gameStore'

export function spawnWave(level = 1) {
  const store = useGameStore.getState()
  const baseHP = 40 + (level - 1) * 12
  for (let i = 0; i < level + 2; i++) {
    store.spawnEnemy({
      hp: baseHP + i * 6,
      pos: [(i - 2) * 2, 0.5, -4 - i],
      atk: 5 + level * 2,
      speed: 0.6 + i * 0.1,
      attackSpeed: 1.5,
      color: i % 2 ? '#b33' : '#3ab'
    })
  }
}
