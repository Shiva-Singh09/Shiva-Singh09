/*
 * useCharacterController — isolated character loading + animation layer.
 *
 * OWNERSHIP: this hook (and characterConfig.js) is the ONLY place that may
 * touch character-specific details: GLB loading, clip-name mapping, scale
 * calibration, grounding, and Walk ⇄ Idle blending. Scene logic (HeroScene,
 * HeroExperience, camera, lighting, floor, GSAP timelines, overlays) stays
 * mesh-agnostic and never makes geometry / material / facial / mesh-name
 * assumptions.
 *
 * Behaviour:
 * - Loads the configured GLB via useGLTF and binds clips via useAnimations.
 * - Case-insensitive logical-name lookup, so minor naming differences in a
 *   replacement file (e.g. "walk" vs "Walk") still resolve. Exact mapping
 *   still belongs in characterConfig.js.
 * - Derives a generic uniform scale (config scale × optional bbox
 *   match-height) + a bbox grounding lift, so ANY replacement rig is
 *   centred/grounded without per-model code changes.
 * - Plays Walk while `active` (Hero 'entering' phase), crossfades to Idle
 *   otherwise. Jump/Wave stay loaded and are exposed via `playClip` for
 *   future use — never auto-played by Hero.
 * - Reports detected clip names upward once (SceneDirector heroClips).
 *
 * Returns: { group, scene, names, scale, lift, playClip, actions }
 */
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CHARACTER_ANIMATION, CHARACTER_ASSET, CHARACTER_CLIPS, CHARACTER_TRANSFORM } from './characterConfig.js'

const findKey = (names, wanted) => {
  if (!wanted) return null
  const exact = names.find((n) => n === wanted)
  if (exact) return exact
  return names.find((n) => n.toLowerCase() === String(wanted).toLowerCase()) ?? null
}

export function useCharacterController({ active, reducedMotion, onClips }) {
  const group = useRef(null)
  const reported = useRef(false)
  const { scene, animations } = useGLTF(CHARACTER_ASSET.url)
  const { actions, names, mixer } = useAnimations(animations, group)

  // Generic calibration from the model's own bounding box — no per-mesh,
  // per-material, or facial assumptions. Works for any replacement rig.
  const { scale, lift } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const base = CHARACTER_TRANSFORM.scale ?? 1
    const auto =
      CHARACTER_TRANSFORM.scaleMode === 'match-height' && size.y > 0
        ? CHARACTER_TRANSFORM.targetHeight / size.y
        : 1
    const nextScale = base * auto
    // Lift in *scaled* space: min.y is in model units, group scale applies
    // to the inner wrapper, so divide by scale to land feet at y = 0.
    return { scale: nextScale, lift: -box.min.y / (nextScale || 1) }
  }, [scene])

  useEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.frustumCulled = false
      }
    })
  }, [scene])

  // Report detected clip names upward exactly once (Jump/Wave included —
  // loaded and available, never auto-played in Hero).
  useEffect(() => {
    if (!reported.current && names.length > 0) {
      reported.current = true
      onClips?.(names)
    }
  }, [names, onClips])

  // Clip state machine: Walk while entering, Idle otherwise.
  useEffect(() => {
    if (!actions) return undefined
    const anim = CHARACTER_ANIMATION
    const walkKey = findKey(names, CHARACTER_CLIPS.walk)
    const idleKey = findKey(names, CHARACTER_CLIPS.idle)
    const walk = walkKey ? actions[walkKey] : null
    const idle = idleKey ? actions[idleKey] : null
    if (!walk || !idle) return undefined

    // Keep Jump + Wave loaded/available — never auto-played in Hero.
    void (findKey(names, CHARACTER_CLIPS.jump) ? actions[findKey(names, CHARACTER_CLIPS.jump)] : null)
    void (findKey(names, CHARACTER_CLIPS.wave) ? actions[findKey(names, CHARACTER_CLIPS.wave)] : null)

    if (reducedMotion || !active) {
      walk.fadeOut(anim.walkFadeOut)
      idle.reset().fadeIn(anim.idleFadeIn).play()
    } else {
      idle.fadeOut(anim.idleFadeOut)
      walk.reset().fadeIn(anim.walkFadeIn).play()
    }

    return () => {
      walk.fadeOut(anim.exitFade)
      idle.fadeOut(anim.exitFade)
    }
  }, [actions, names, active, reducedMotion])

  // Manual clip access for future (non-Hero) use — e.g. a Wave greeting.
  // Still routed through the config mapping; callers use logical names.
  const playClip = useCallback(
    (logicalName, { fadeIn = 0.35, fadeOut = 0.3 } = {}) => {
      const key = findKey(names, CHARACTER_CLIPS[logicalName] ?? logicalName)
      const next = key ? actions[key] : null
      if (!next) return null
      Object.values(actions).forEach((a) => {
        if (a !== next) a.fadeOut(fadeOut)
      })
      next.reset().fadeIn(fadeIn).play()
      return next
    },
    [actions, names]
  )

  // Stop mixer actions on unmount; GLTF cache disposal stays with R3F/drei
  // defaults (single shared instance, no clones).
  useEffect(
    () => () => {
      try {
        mixer?.stopAllAction()
      } catch {
        /* noop — mixer may already be disposed */
      }
    },
    [mixer]
  )

  return { group, scene, names, actions, scale, lift, playClip }
}

useGLTF.preload(CHARACTER_ASSET.url)

export default useCharacterController
