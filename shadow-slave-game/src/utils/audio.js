// Tiny audio helper using browser Audio (no external libs).
// If the file doesn't exist, it fails silently.
export function playSFX(path, volume = 1.0) {
  try {
    const a = new Audio(path)
    a.volume = Math.max(0, Math.min(1, volume))
    // short sounds: don't wait for metadata
    a.play().catch(() => {})
  } catch (e) {
    // swallow audio errors - optional assets only
    // console.debug('SFX error', e)
  }
}
