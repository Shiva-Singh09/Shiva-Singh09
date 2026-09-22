/* RopeStage — rope arrival → grab → tension → pull → settle swing. */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ROPE_LEN = 4.4

export default function RopeStage({ progress, reducedMotion }) {
  const rope = useRef(null)
  const handle = useRef(null)
  const tags = useRef(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // arrival: rope swings down from above; tension: straightens toward pull.
    const arrive = THREE.MathUtils.clamp(progress.arrive, 0, 1)
    const pull = THREE.MathUtils.clamp(progress.pull, 0, 1)
    const settle = THREE.MathUtils.clamp(progress.settle, 0, 1)
    const swing = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.05 * (1 - pull) + Math.sin(t * 2.2) * 0.04 * settle
    if (rope.current) {
      rope.current.rotation.z = THREE.MathUtils.lerp(0.55, -0.12 + swing, arrive) + pull * -0.28
      rope.current.position.y = THREE.MathUtils.lerp(4.2, 2.6, arrive) - pull * 0.35
    }
    if (handle.current) {
      handle.current.position.y = -ROPE_LEN / 2
    }
    if (tags.current) {
      tags.current.children.forEach((tag, i) => {
        tag.position.y = -1.2 - i * 0.55 + Math.sin(t * 1.4 + i) * (reducedMotion ? 0 : 0.03 * (0.4 + settle))
      })
    }
  })

  return (
    <group>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.45} color="#7C5CFF" />
      {/* mount beam */}
      <mesh position={[0, 4.6, -1.5]}>
        <boxGeometry args={[5.5, 0.25, 0.5]} />
        <meshStandardMaterial color="#16161e" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* rope: arrival → grab → tension → pull, then pendulum settle */}
      <group ref={rope} position={[0.9, 4.4, -1.5]}>
        <mesh position={[0, -ROPE_LEN / 2, 0]}>
          <cylinderGeometry args={[0.035, 0.035, ROPE_LEN, 12]} />
          <meshStandardMaterial color="#8a6f4d" roughness={0.85} metalness={0.05} />
        </mesh>
        <group ref={handle} position={[0, -ROPE_LEN / 2, 0]}>
          <mesh>
            <torusGeometry args={[0.22, 0.06, 12, 24]} />
            <meshStandardMaterial color="#1d1d27" roughness={0.4} metalness={0.8} />
          </mesh>
        </group>
        {/* contact tags/devices hanging from the rope */}
        <group ref={tags}>
          {['#E9307C', '#7C5CFF', '#4DA3FF', '#E9307C', '#7C5CFF'].map((c, i) => (
            <mesh key={i} position={[0.35, -1.2 - i * 0.55, 0]}>
              <boxGeometry args={[0.7, 0.32, 0.08]} />
              <meshStandardMaterial color="#14141c" roughness={0.5} metalness={0.6} />
            </mesh>
          ))}
        </group>
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.9, 0]}>
        <circleGeometry args={[8, 48]} />
        <meshStandardMaterial color="#050507" roughness={0.95} />
      </mesh>
    </group>
  )
}
