/*
 * HeroEnvironment — dark cinematic air.
 *
 * Responsibilities: scene fog + one very subtle drifting particle field.
 * No neon, no icons, no terminal/Matrix effects, no bloom — just restrained
 * atmosphere. Particle count scales with the quality tier.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { resolveHeroQuality } from './heroChoreography.js'

const FIELD = { x: 6, y: 3.6, z: 4 }

export default function HeroEnvironment({ tier }) {
  const points = useRef(null)
  const count = resolveHeroQuality(tier).particles

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() * 2 - 1) * FIELD.x
      positions[i * 3 + 1] = Math.random() * FIELD.y
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * FIELD.z
      speeds[i] = 0.04 + Math.random() * 0.1
    }
    return { positions, speeds }
  }, [count])

  useFrame((state, dt) => {
    const p = points.current
    if (!p) return
    const step = Math.min(dt, 0.05)
    const attr = p.geometry.getAttribute('position')
    const arr = attr.array
    for (let i = 0; i < count; i += 1) {
      let y = arr[i * 3 + 1] + speeds[i] * step
      if (y > FIELD.y) y = 0
      arr[i * 3 + 1] = y
    }
    attr.needsUpdate = true
  })

  return (
    <group>
      <fog attach="fog" args={['#050507', 9, 18]} />
      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.022}
          color={new THREE.Color('#9a9ab5')}
          transparent
          opacity={0.32}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  )
}
