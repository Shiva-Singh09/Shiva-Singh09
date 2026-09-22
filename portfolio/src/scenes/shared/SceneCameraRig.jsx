/*
 * SceneCameraRig — shared damped camera driver for section scenes.
 *
 * Reads plain camX/camY/camZ + lookX/lookY/lookZ targets from a section's
 * `choreo` object (written by ScrollTrigger / timeline progress) and eases
 * the camera toward them. Damping turns discrete step changes (e.g. moving
 * to the next project blueprint) into smooth cinematic moves and keeps
 * fast-scroll scrubbing from snapping. Hero keeps its own approved rig —
 * this is only for the section scenes.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const tmp = new THREE.Vector3()

export default function SceneCameraRig({ choreo, damp = 6 }) {
  const look = useRef(new THREE.Vector3())
  const inited = useRef(false)

  useFrame((state, delta) => {
    const c = choreo.current
    const cam = state.camera
    if (!inited.current) {
      look.current.set(c.lookX ?? 0, c.lookY ?? 1, c.lookZ ?? 0)
      inited.current = true
    }
    const dt = Math.min(Math.max(delta, 1e-4), 0.1)
    const k = 1 - Math.exp(-damp * dt)

    cam.position.x += ((c.camX ?? cam.position.x) - cam.position.x) * k
    cam.position.y += ((c.camY ?? cam.position.y) - cam.position.y) * k
    cam.position.z += ((c.camZ ?? cam.position.z) - cam.position.z) * k

    look.current.x += ((c.lookX ?? look.current.x) - look.current.x) * k
    look.current.y += ((c.lookY ?? look.current.y) - look.current.y) * k
    look.current.z += ((c.lookZ ?? look.current.z) - look.current.z) * k

    cam.lookAt(tmp.copy(look.current))
  })

  return null
}
