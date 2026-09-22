/*
 * HeroLighting — restrained cinematic rig.
 *
 * Directional lights only (unitless intensities, no physical-unit pitfalls):
 * - ambient: low dark base
 * - key: neutral front key, dims as the camera swings behind (silhouette)
 * - rimA: fuchsia rim from rear-right; hue drifts toward violet on the sides
 * - rimB: blue side fill from rear-left; strongest at profile angles
 * - back: cool silhouette edge, strongest when the camera is behind
 *
 * The rig is fixed in world space; the camera orbits. Intensities are
 * modulated per-frame from the timeline's orbitAngle (front = fuchsia rim,
 * side = violet/blue, back = dark silhouette + rim, return = balanced).
 * Low tier renders ambient + key + one rim only.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HERO_LIGHTING } from './heroChoreography.js'

export default function HeroLighting({ choreo, tier }) {
  const key = useRef(null)
  const rimA = useRef(null)
  const rimB = useRef(null)
  const back = useRef(null)

  const fuchsia = useMemo(() => new THREE.Color(HERO_LIGHTING.fuchsia), [])
  const violet = useMemo(() => new THREE.Color(HERO_LIGHTING.violet), [])
  const blue = useMemo(() => new THREE.Color(HERO_LIGHTING.blue), [])
  const scratch = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const a = choreo.current.orbitAngle || 0
    const frontness = (Math.cos(a) + 1) / 2 // 1 = front, 0 = back
    const sideness = Math.abs(Math.sin(a)) // 1 = full profile
    if (key.current) key.current.intensity = 0.55 + frontness * 0.85
    if (rimA.current) {
      rimA.current.intensity = 0.5 + frontness * 1.1
      rimA.current.color.copy(scratch.copy(fuchsia).lerp(violet, sideness * 0.7))
    }
    if (rimB.current) {
      rimB.current.intensity = 0.35 + sideness * 1.0
      rimB.current.color.copy(scratch.copy(blue).lerp(violet, sideness * 0.4))
    }
    if (back.current) back.current.intensity = 0.25 + (1 - frontness) * 1.5
  })

  return (
    <group>
      <ambientLight intensity={HERO_LIGHTING.ambient} color="#dfe0ff" />
      <directionalLight ref={key} position={[3, 4, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight ref={rimA} position={[4.5, 2.5, -3.5]} intensity={1.2} color={HERO_LIGHTING.fuchsia} />
      {tier !== 'low' ? (
        <>
          <directionalLight ref={rimB} position={[-4.5, 2, -3.5]} intensity={0.6} color={HERO_LIGHTING.blue} />
          <directionalLight ref={back} position={[0, 3, -6]} intensity={0.4} color="#cfd2ff" />
        </>
      ) : null}
    </group>
  )
}
