/*
 * HeroFloor — subtle floor with controlled reflection.
 *
 * High/medium: drei MeshReflectorMaterial with a restrained mirror value and
 * high roughness so the reflection reads as a polished dark stage, never a
 * mirror. Low tier: plain dark standard material (no reflector cost).
 * ContactShadows grounds the character on every tier.
 */
import { ContactShadows, MeshReflectorMaterial } from '@react-three/drei'

export default function HeroFloor({ tier }) {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 64]} />
        {tier === 'low' ? (
          <meshStandardMaterial color="#0b0b10" roughness={0.95} metalness={0} />
        ) : (
          <MeshReflectorMaterial
            blur={[280, 60]}
            resolution={1024}
            mixBlur={1}
            mixStrength={5}
            roughness={0.85}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0b0b10"
            metalness={0.1}
            mirror={0.35}
          />
        )}
      </mesh>
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.6}
        scale={9}
        blur={2.4}
        far={3.2}
        resolution={512}
        color="#000000"
        frames={Infinity}
      />
    </group>
  )
}
