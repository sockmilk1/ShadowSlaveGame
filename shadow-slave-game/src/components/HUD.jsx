// HUD: shows HP/Essence/XP and the ability buttons.
// Also handles occasional playback of queued audio events (levelup).
import React, { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import AbilityButton from './AbilityButton'
import { allAbilityKeys } from '../game/abilities'
import { playSFX } from '../utils/audio'

export default function HUD() {
  const player = useGameStore(s => s.player)
  const popAudio = useGameStore(s => s.popAudioEvent)

  // Poll audio queue periodically and play events (simple approach)
  useEffect(() => {
    const id = setInterval(() => {
      const ev = popAudio()
      if (ev === 'levelup') playSFX('/assets/sfx/levelup.wav', 0.6)
      // extend: map other event strings to SFX paths
    }, 400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="ui">
      <div className="hud">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>Lvl {player.level}</div>
          <div>XP {player.xp}/{player.xpToNext}</div>
        </div>

        {/* HP / Essence / XP bars */}
        <div className="bar">
          <div className="fill" style={{ width: `${(player.hp / player.maxHp) * 100}%`, background: 'linear-gradient(90deg,#ff5b5b,#c0392b)' }} />
        </div>

        <div className="bar">
          <div className="fill" style={{ width: `${(player.essence / player.maxEssence) * 100}%`, background: 'linear-gradient(90deg,#8a6be0,#5e3ab6)' }} />
        </div>

        <div className="bar">
          <div className="fill" style={{ width: `${(player.xp / player.xpToNext) * 100}%`, background: 'linear-gradient(90deg,#4cd137,#2ecc71)' }} />
        </div>

        <div style={{ marginTop: 6 }}>
          ATK: {player.stats.atk} · DEF: {player.stats.def} · HP: {player.hp}/{player.maxHp}
        </div>

        {/* Abilities */}
        <div className="abilities">
          {allAbilityKeys.map(k => <AbilityButton key={k} keyName={k} />)}
        </div>
      </div>
    </div>
  )
}
