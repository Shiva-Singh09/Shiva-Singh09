/*
 * HeroCharacter — thin presentation wrapper around the character layer.
 *
 * The character GLB is a replaceable external asset. ALL character-specific
 * logic (model path, clip-name mapping, scale calibration, grounding,
 * Walk ⇄ Idle blending) lives in:
 *   character/characterConfig.js  (model path, clips, scale, rotation)
 *   character/useCharacterController.js (loading + animation isolation)
 *
 * This component only:
 * - applies the single choreography's plain-object values (position x, yaw
 *   from config rotation) every frame,
 * - derives the logical pose from REAL travel — Walk while the choreography is
 *   actually moving the character (the Hero walk-in, the About shot, the walk
 *   toward Skills) and Idle the moment he stops. The controller crossfades on
 *   change only, so scroll frames can never restart a clip.
 * - renders the calibrated group (uniform scale; proportions preserved).
 *
 * Motion-derived poses are what let the SAME approved rig carry both the
 * time-based Hero cinematic and the scroll-driven About shot: no second
 * controller, no phase hand-off, no clip restarts.
 *
 * It NEVER rotates for the 360° orbit — the camera does that. Yaw only eases
 * travel → face-front on arrival.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CHARACTER_TRANSFORM } from './character/characterConfig.js'
import { useCharacterController } from './character/useCharacterController.js'
import { ABOUT_GREET_POSE } from './aboutChoreography.js'

// Same motion rule the shared section scenes use (scenes/shared/SceneCharacter):
// Walk only while the body actually translates (hysteresis → no flicker, no
// foot sliding while standing).
const WALK_ENTER = 0.4 // world units / second
const WALK_EXIT = 0.15 // world units / second

export default function HeroCharacter({ choreo, phase, reducedMotion, onClips }) {
  // Section mode of the single character controller: poseRef is polled and
  // crossfaded ONLY when its value changes — never on scroll frames.
  const poseRef = useRef('idle')
  // The controller's mixer update + pose poll run FIRST (negative priority =
  // before default-priority frames), so the Namaste overlay below always
  // applies on top of the freshly written clip pose.
  const { group, scene, scale, lift } = useCharacterController({ poseRef, reducedMotion, onClips, renderPriority: -1 })

  const motion = useRef({ x: choreo.current.x ?? 0, walking: false })
  // Namaste overlay:ADDITIVE bone-layer state, resolved per frame AFTER the
  // mixer's own update (see controller applyPriority) from the About
  // timeline's `greet` channel. Hero never sets it, so Hero behavior is
  // untouched; reduced-motion never raises it, so no gesture there.
  const greet = useRef({
    nodes: null, // resolved once: upperArm/lowerArm/hand per side + spine
    base: null, // rest quats + rest position of every overlaid bone
    current: 0, // smoothed 0 → 1 weight (reversible on scroll-up)
    q: new THREE.Quaternion(),
    q2: new THREE.Quaternion(),
    e: new THREE.Euler(),
    v: new THREE.Vector3(),
  })

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const c = choreo.current
    const dt = Math.min(Math.max(delta, 1e-4), 0.1)
    const x = c.x ?? 0

    // Pose from real travel: Hero walk-in, About walk-in / exit and any scrub
    // speed resolve to Walk ⇄ Idle the same way (hysteresis, never a restart).
    const m = motion.current
    const speed = Math.abs(x - m.x) / dt
    m.x = x
    if (reducedMotion) {
      m.walking = false
    } else if (!m.walking && speed > WALK_ENTER) {
      m.walking = true
    } else if (m.walking && speed < WALK_EXIT) {
      m.walking = false
    }
    poseRef.current = m.walking ? 'walk' : 'idle'

    // Position x is applied exactly as authored (timer-driven in the Hero,
    // scroll-driven in About) and stays grounded at y = 0 — never scaled,
    // never offset, never teleported.
    g.position.set(x, 0, 0)
    g.rotation.set(0, c.yaw ?? CHARACTER_TRANSFORM.rotation.faceYaw, 0)

    // ── Namaste overlay (additive, after mixer) ──────────────────────────
    // Lazily resolves the arm bones inside this instance's skeleton clone by
    // name (rig-agnostic: missing bones simply disable the overlay). Then —
    // ONLY when the mixer has already written Idle/Walk for this frame —
    // slerps each bone from its CURRENT clip pose toward the solved
    // folded-hands target by the smoothed greet weight. Scroll is the source
    // of truth, so scrolling back reverses the fold exactly.
    const st = greet.current
    if (!st.nodes) {
      const skinned = []
      scene.traverse((o) => {
        if (o && o.isBone) skinned.push(o)
      })
      const byName = new Map(skinned.map((b) => [b.name, b]))
      const need = ['LeftUpperArm', 'LeftLowerArm', 'LeftHand', 'RightUpperArm', 'RightLowerArm', 'RightHand', 'Spine']
      if (need.every((n) => byName.has(n))) {
        st.nodes = need.map((n) => byName.get(n))
        st.base = need.map((n) => byName.get(n).quaternion.clone())
      } else {
        st.nodes = [] // rig without these bones: overlay stays inert
      }
    }
    const want = reducedMotion ? 0 : (c.greet ?? 0)
    // Smooth the weight (frame-rate independent) so the fold eases in/out
    // even when the scroll jumps; reverses exactly because `want` does.
    const k = 1 - Math.exp(-6 * dt)
    st.current += (want - st.current) * k
    if (Math.abs(st.current - want) < 1e-4) st.current = want
    const w = Math.min(Math.max(st.current, 0), 1)
    if (st.nodes && st.nodes.length === 7) {
      const [lua, lla, lh, rua, rla, rh, spine] = st.nodes
      const [blua, blla, blh, brua, brla, brh, bspine] = st.base
      const P = ABOUT_GREET_POSE
      if (w > 1e-4) {
        // Idle's tiny breathing offsets ride UNDER the overlay: capture the
        // live clip pose as the base each frame instead of a frozen rest.
        blua.copy(lua.quaternion)
        blla.copy(lla.quaternion)
        blh.copy(lh.quaternion)
        brua.copy(rua.quaternion)
        brla.copy(rla.quaternion)
        brh.copy(rh.quaternion)
        bspine.copy(spine.quaternion)
        st.q.set(...P.right.upperArm)
        rua.quaternion.copy(st.q2.copy(brua).slerp(st.q, w))
        st.q.set(...P.right.lowerArm)
        rla.quaternion.copy(st.q2.copy(brla).slerp(st.q, w))
        st.q.set(...P.right.hand)
        rh.quaternion.copy(st.q2.copy(brh).slerp(st.q, w))
        st.q.set(...P.left.upperArm)
        lua.quaternion.copy(st.q2.copy(blua).slerp(st.q, w))
        st.q.set(...P.left.lowerArm)
        lla.quaternion.copy(st.q2.copy(blla).slerp(st.q, w))
        st.q.set(...P.left.hand)
        lh.quaternion.copy(st.q2.copy(blh).slerp(st.q, w))
        // Respectful bow: small forward pitch about the spine's local X,
        // scaled by the same weight.
        st.e.set(P.bow * w, 0, 0)
        st.q.setFromEuler(st.e)
        spine.quaternion.copy(st.q2.copy(bspine).multiply(st.q))
      } else if (w === 0 && st.released !== true) {
        // Weight fully back at rest: restore the captured bases once so no
        // residual offset survives a full reverse scroll.
        lua.quaternion.copy(blua)
        lla.quaternion.copy(blla)
        lh.quaternion.copy(blh)
        rua.quaternion.copy(brua)
        rla.quaternion.copy(brla)
        rh.quaternion.copy(brh)
        spine.quaternion.copy(bspine)
        st.released = true
      }
      if (w > 1e-4) st.released = false
    }
  })

  return (
    <group ref={group} visible={phase !== 'loading'}>
      <group position={[0, lift, 0]} scale={scale}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

