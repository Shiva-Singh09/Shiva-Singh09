/* HeroCameraRig — the ONLY camera driver in the Hero.
 *
 * Reads the single GSAP timeline's plain-object values (radius, height,
 * lookAt height, lookAt X, orbit angle) and places the camera on a circle
 * around the stationary character:
 *   x = sin(angle) * radius, z = cos(angle) * radius.
 * Angle 0 = front. The full 360° orbit is pure camera motion — the
 * character's rotation is never touched here. Character scale is never
 * touched (no fake dolly). Starts medium-wide with a slight low angle.
 *
 * lookX eases 0 → layout offset only during the final settle, so the
 * walk-in, close-up and orbit stay centered, then the settled frame places
 * the character right-of-center beside the left text column.
 */
import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const TARGET = new THREE.Vector3()

const place = (camera, c) => {
  camera.position.set(
    Math.sin(c.orbitAngle) * c.radius + (c.lookX || 0),
    c.height,
    Math.cos(c.orbitAngle) * c.radius
  )
  camera.lookAt(TARGET.set(c.lookX || 0, c.lookY, 0))
}

export default function HeroCameraRig({ choreo }) {
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    place(camera, choreo.current)
  }, [camera, choreo])

  useFrame(() => {
    place(camera, choreo.current)
  })

  return null
}
