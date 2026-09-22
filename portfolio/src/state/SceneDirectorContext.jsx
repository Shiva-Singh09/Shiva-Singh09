/*
 * Scene Director — lightweight orchestration layer.
 *
 * Phase 1 installed the architectural boundary so future cinematic scenes
 * (Hero / Skills / Projects / Contact) never fight over camera, character,
 * lighting or environment state. It is a plain React Context — no Zustand —
 * because the state surface is small and local to this app.
 *
 * The Scene Director drives:
 *   Section → Character → Camera → Lighting → Environment → Sound
 * and is steered by GSAP (progress-based, not by every component creating
 * its own scroll animation).
 *
 * Phase 2 extends the shape with the Hero cinematic phases. Nothing here
 * performs animation itself — HeroScene owns the single GSAP timeline and
 * reports back through these setters, so no duplicate global scene state
 * ever exists.
 *
 * Audio is NOT implemented in this phase. `soundEnabled` remains the master
 * toggle and the clean extension point for future optional music / voice /
 * sound (see scenes/HeroScene/heroChoreography.js → heroAudio).
 */
import { createContext, useCallback, useState } from 'react'

const initialState = {
  // Active section anchor: 'hero' | 'about' | 'skills' | 'projects' | 'journey' | 'contact' | 'feedback'
  currentSection: 'hero',
  // Camera preset: 'idle' | 'wide' | 'closeup' | 'intro-orbit' | 'focused' | ...
  cameraState: 'idle',
  // Character animation: 'idle' | 'entering' | 'walking' | 'posing' | 'orbiting'
  characterState: 'idle',
  // Lighting / environment preset (tied to section in Phase 2): 'hero' | 'skills' | ...
  lightingState: 'hero',
  environmentState: 'hero',
  // Master sound toggle (audio is Phase 2 extension point — no audio yet).
  soundEnabled: true,
  // Device capability tier used to scale scene complexity. 'low' | 'medium' | 'high'
  qualityLevel: 'high',
  // Hero cinematic phase:
  // 'loading' | 'entering' | 'arrived' | 'closeup' | 'orbit' | 'revealed' | 'complete' | 'fallback'
  heroPhase: 'loading',
  // True once the 3D scene has initialised (model + environment ready).
  heroReady: false,
  // Navbar stays minimal/hidden during the strongest intro beats, then reveals.
  navbarVisible: false,
  // Verified GLB clip names detected at runtime (e.g. ['Idle','Walk','Jump','Wave']).
  heroClips: [],
}

export const SceneDirectorContext = createContext({
  state: initialState,
  setState: () => {},
  updateSection: () => {},
  updateQualityLevel: () => {},
  updateHeroPhase: () => {},
  setHeroReady: () => {},
  setNavbarVisible: () => {},
  setHeroClips: () => {},
})

export const SceneDirectorProvider = ({ children }) => {
  const [state, setState] = useState(initialState)

  // Convenience setters so components never mutate nested state directly.
  const updateSection = useCallback((currentSection) => {
    setState((prev) => ({ ...prev, currentSection }))
  }, [])

  const updateQualityLevel = useCallback((qualityLevel) => {
    setState((prev) => ({ ...prev, qualityLevel }))
  }, [])

  const updateHeroPhase = useCallback((heroPhase) => {
    setState((prev) => ({ ...prev, heroPhase }))
  }, [])

  const setHeroReady = useCallback((heroReady) => {
    setState((prev) => ({ ...prev, heroReady }))
  }, [])

  const setNavbarVisible = useCallback((navbarVisible) => {
    setState((prev) => ({ ...prev, navbarVisible }))
  }, [])

  const setHeroClips = useCallback((heroClips) => {
    setState((prev) => ({ ...prev, heroClips }))
  }, [])

  return (
    <SceneDirectorContext.Provider
      value={{
        state,
        setState,
        updateSection,
        updateQualityLevel,
        updateHeroPhase,
        setHeroReady,
        setNavbarVisible,
        setHeroClips,
      }}
    >
      {children}
    </SceneDirectorContext.Provider>
  )
}

export default SceneDirectorContext

