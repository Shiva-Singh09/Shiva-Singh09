/*
 * SceneCharacter — shared scroll-driven character presenter for section scenes.
 *
 * This is NOT a second character system: it wraps the single existing
 * useCharacterController (characterConfig.js owns asset/clips/transform) and
 * only reads a section's plain `choreo` object (written by ScrollTrigger).
 *
 * Per frame it:
 *  - damps actual position toward the choreo target (no teleports on fast
 *    scrub; frame-rate independent), grounded at `floorY` (section floors
 *    sit at -0.9; Hero floors at 0),
 *  - damps yaw along the shortest arc (smooth pivots; character never
 *    rotates for any camera effect),
 *  - applies a small lean about the up×facing side axis (rope pull, reach),
 *  - derives the pose from REAL body speed: Walk only while actually
 *    translating (hysteresis → no flicker, no foot sliding while standing),
 *    Idle otherwise — unless choreo.pose holds an explicit one-shot intent
 *    (e.g. 'wave' for the Contact goodbye).
 *
 * The derived value lands in `poseRef`, which the controller crossfades on
 * change only — scrolling can never restart clips per frame.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCharacterController } from '../HeroScene/character/useCharacterController.js'

const WALK_ENTER = 0.4 // world units/sec — start the Walk clip
const WALK_EXIT = 0.15 // world units/sec — settle back to Idle

export default function SceneCharacter({ choreo, floorY = 0, reducedMotion = false, visible = true }) {
  const poseRef = useRef('idle')
  const { group, scene, scale, lift } = useCharacterController({ poseRef, reducedMotion })

  const pos = useRef({ x: 0, z: 0, ready: false })
  const yaw = useRef(0)
  const walking = useRef(false)
  const leanGroup = useRef(null)
  const facing = useRef(new THREE.Vector3())
  const leanAxis = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const c = choreo.current
    const dt = Math.min(Math.max(delta, 1e-4), 0.1)

    // ── position: damp toward target (snap on first frame — no entrance lerp)
    const p = pos.current
    const tx = c.charX ?? 0
    const tz = c.charZ ?? 0
    if (!p.ready) {
      p.x = tx
      p.z = tz
      p.ready = true
    }
    const ox = p.x
    const oz = p.z
    const k = 1 - Math.exp(-7 * dt)
    p.x += (tx - p.x) * k
    p.z += (tz - p.z) * k
    g.position.set(p.x, floorY, p.z)

    // ── yaw: shortest-arc damp (smooth pivot turns, never a camera fake)
    const targetYaw = c.yaw ?? 0
    if (!g.rotation.y && !yaw.current) yaw.current = targetYaw
    let delta2 = targetYaw - yaw.current
    while (delta2 > Math.PI) delta2 -= Math.PI * 2
    while (delta2 < -Math.PI) delta2 += Math.PI * 2
    yaw.current += delta2 * k
    g.rotation.set(0, yaw.current, 0)

    // ── lean: about the side axis (up × facing); positive tips forward
    if (leanGroup.current) {
      const lean = c.lean ?? 0
      if (Math.abs(lean) > 1e-4) {
        facing.current.set(Math.sin(yaw.current), 0, Math.cos(yaw.current))
        leanAxis.current.set(0, 1, 0).cross(facing.current)
        if (leanAxis.current.lengthSq() > 1e-6) {
          leanGroup.current.setRotationFromAxisAngle(leanAxis.current.normalize(), lean)
        }
      } else {
        leanGroup.current.rotation.set(0, 0, 0)
      }
    }

    // ── pose: explicit intent wins (wave goodbye); else derive from real
    //    body speed so Walk plays only while the character actually moves.
    const intent = c.pose
    if (intent && intent !== 'idle' && intent !== 'walk') {
      if (poseRef.current !== intent) {
        walking.current = false
        poseRef.current = intent
      }
    } else {
      const moved = Math.hypot(p.x - ox, p.z - oz) / dt
      if (!walking.current && moved > WALK_ENTER) walking.current = true
      else if (walking.current && moved < WALK_EXIT) walking.current = false
      const wanted = walking.current ? 'walk' : 'idle'
      if (poseRef.current !== wanted) poseRef.current = wanted
    }
  })

  return (
    <group ref={group} visible={visible}>
      <group ref={leanGroup}>
        <group position={[0, lift, 0]} scale={scale}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  )
}
