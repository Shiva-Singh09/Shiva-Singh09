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
 * - applies the single GSAP timeline's plain-object values (position x, yaw
 *   from config rotation) every frame,
 * - renders the calibrated group (uniform scale; proportions preserved),
 * - stays visible after init. It NEVER rotates for the 360° orbit — the
 *   camera does that. Yaw only eases travel → face-front on arrival.
 */
import { useFrame } from '@react-three/fiber'
import { CHARACTER_TRANSFORM } from './character/characterConfig.js'
import { useCharacterController } from './character/useCharacterController.js'

export default function HeroCharacter({ choreo, phase, reducedMotion, onClips }) {
  const active = !reducedMotion && phase === 'entering'
  const { group, scene, scale, lift } = useCharacterController({
    active,
    reducedMotion,
    onClips,
  })

  // Apply the single timeline's values. Position x + arrival yaw only —
  // orbitAngle is consumed by the camera rig, never by the character.
  // Yaw targets come from config so a replacement rig's facing axis is a
  // one-line change in characterConfig.js.
  useFrame(() => {
    const g = group.current
    if (!g) return
    const c = choreo.current
    g.position.set(c.x, 0, 0)
    g.rotation.set(0, c.yaw ?? CHARACTER_TRANSFORM.rotation.faceYaw, 0)
  })

  return (
    <group ref={group} visible={phase !== 'loading'}>
      <group position={[0, lift, 0]} scale={scale}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

