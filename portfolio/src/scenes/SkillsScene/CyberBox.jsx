/* CyberBox — dark brushed-metal capsule + smoked glass + edge light. */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CyberBox({ progress, tier, reducedMotion }) {
  const group = useRef(null)
  const lid = useRef(null)
  const pulse = useRef(null)
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#101018',
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.55,
      }),
    []
  )

  useFrame((state) => {
    const g = group.current
    if (!g) return
    // Descend from above on arrival; flatten toward blueprint floor at end.
    const drop = THREE.MathUtils.clamp(progress.drop, 0, 1)
    const eased = 1 - Math.pow(1 - drop, 3)
    g.position.y = THREE.MathUtils.lerp(6, progress.flat > 0.5 ? 0.35 : 1.5, eased)
    g.scale.y = THREE.MathUtils.lerp(1, 0.22, progress.flat)
    if (lid.current) lid.current.position.y = 1.15 + progress.open * 0.9
    if (pulse.current) {
      const mat = pulse.current.material
      mat.opacity = 0.12 + progress.glow * 0.5
      if (!reducedMotion) {
        mat.opacity += Math.sin(state.clock.elapsedTime * 2.2) * 0.05
      }
    }
    void tier
  })

  return (
    <group ref={group} position={[0.9, 6, -1.2]}>
      {/* brushed-metal body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.6, 1.7, 1.6]} />
        <meshStandardMaterial color="#14141b" roughness={0.55} metalness={0.75} />
      </mesh>
      {/* smoked-glass front */}
      <mesh position={[0, -0.1, 0.82]}>
        <planeGeometry args={[2.2, 1.2]} />
        <primitive object={glassMat} attach="material" />
      </mesh>
      {/* lid that lifts on activation */}
      <group ref={lid} position={[0, 1.15, 0]}>
        <mesh>
          <boxGeometry args={[2.6, 0.28, 1.6]} />
          <meshStandardMaterial color="#1b1b24" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>
      {/* edge light: fuchsia one side, violet the other */}
      <mesh position={[-1.32, 0, 0]}>
        <boxGeometry args={[0.05, 1.7, 1.6]} />
        <meshBasicMaterial color="#E9307C" toneMapped={false} />
      </mesh>
      <mesh position={[1.32, 0, 0]}>
        <boxGeometry args={[0.05, 1.7, 1.6]} />
        <meshBasicMaterial color="#7C5CFF" toneMapped={false} />
      </mesh>
      {/* activation pulse plane */}
      <mesh ref={pulse} position={[0, -0.08, 0.84]}>
        <planeGeometry args={[2.2, 1.2]} />
        <meshBasicMaterial color="#4DA3FF" transparent opacity={0.15} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  )
}
