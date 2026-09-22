/*
 * useAudio — clean optional audio architecture (no fabricated files).
 * Voice-over uses the browser Web Speech API (no asset needed).
 * Mechanical/ambient sounds are stubs: play() no-ops until real assets land
 * in public/audio/. Master mute via SceneDirector soundEnabled.
 * Never autoplays; respects reduced-motion (voice only on explicit toggle).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion.js'

export const useAudio = (soundEnabled = true) => {
  const reducedMotion = useReducedMotion()
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  )
  const utterRef = useRef(null)

  const stop = useCallback(() => {
    try {
      window.speechSynthesis?.cancel()
    } catch {
      /* noop */
    }
    utterRef.current = null
    setSpeaking(false)
  }, [])

  useEffect(() => {
    if (!soundEnabled) stop()
  }, [soundEnabled, stop])

  useEffect(() => stop, [stop])

  const speak = useCallback(
    (text) => {
      if (!supported || reducedMotion) return false
      if (!soundEnabled || !text) return false
      try {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text)
        u.rate = 0.95
        u.pitch = 0.9
        u.onend = () => setSpeaking(false)
        u.onerror = () => setSpeaking(false)
        utterRef.current = u
        setSpeaking(true)
        window.speechSynthesis.speak(u)
        return true
      } catch {
        setSpeaking(false)
        return false
      }
    },
    [supported, reducedMotion, soundEnabled]
  )

  // Stub: reserved for a future real mechanical/activation asset.
  const playCue = useCallback(
    () => {
      if (!soundEnabled || reducedMotion) return
    },
    [soundEnabled, reducedMotion]
  )

  return { supported, speaking, speak, stop, playCue }
}
