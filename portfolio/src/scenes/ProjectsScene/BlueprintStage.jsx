/* BlueprintStage — 5 wireframe nodes + active scan + overview. */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FUCHSIA = '#E9307C'
const VIOLET = '#7C5CFF'

function Node({ position, active, dim }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.9, 0.55, 0.06]} />
        <meshStandardMaterial
          color={active ? '#1c1c28' : '#121218'}
          roughness={0.5}
          metalness={0.6}
          transparent
          opacity={dim ? 0.35 : 1}
        />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.9, 0.02]} />
        <meshBasicMaterial color={active ? FUCHSIA : VIOLET} toneMapped={false} transparent opacity={dim ? 0.3 : 0.9} />
      </mesh>
    </group>
  )
}

export default function BlueprintStage({ step, count, reducedMotion }) {
  const scan = useRef(null)
  const group = useRef(null)
  const positions = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i += 1) {
      arr.push([(i - (count - 1) / 2) * 1.25, 0.6, -1.4])
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (scan.current && !reducedMotion) {
      const t = (state.clock.elapsedTime * 0.5) % 1
      scan.current.position.x = THREE.MathUtils.lerp(-3.4, 3.4, t)
    }
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.02
    }
  })

  return (
    <group ref={group}>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 5]} intensity={1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color={VIOLET} />
      {positions.map((p, i) => (
        <Node key={p[0]} position={p} active={i === step} dim={step !== -1 && i !== step} />
      ))}
      {/* horizontal scan through the active blueprint */}
      <mesh ref={scan} position={[0, 0.6, -1.32]}>
        <planeGeometry args={[0.06, 1]} />
        <meshBasicMaterial color={FUCHSIA} transparent opacity={step === -1 ? 0 : 0.55} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* blueprint floor/platform inherited from the Skills box */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.9, 0]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#0B0B10" roughness={0.9} />
      </mesh>
      <gridHelper args={[10, 20, VIOLET, '#1c1c28']} position={[0, -0.89, 0]} />
    </group>
  )
}
