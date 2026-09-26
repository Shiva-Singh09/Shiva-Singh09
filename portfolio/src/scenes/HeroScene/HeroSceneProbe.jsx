/*
 * HeroSceneProbe — opt-in runtime instrumentation for the ONE thing that can
 * make the character invisible between shots: camera placement / target, the
 * character's world transform + world bounding box, the canvas size and the
 * stage layer's computed visibility.
 *
 * It ships inert: nothing is attached unless the page is opened with
 * `?sceneDebug=1` (or served by the Vite dev server). Then it exposes
 *   window.__heroSceneProbe() -> plain JSON snapshot
 * and nothing else — no animation, no state, no layout, no per-frame cost
 * beyond a frame counter.
 *
 * Used by scripts/scene-probe.mjs to verify the Hero → About → Skills
 * continuity visually (screenshots) and numerically (NDC projection of the
 * character's bounding box). Instrumentation is read-only by design: it must
 * never be able to change what the user sees.
 */
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export const SCENE_PROBE_ENABLED =
  typeof window !== 'undefined' &&
  (import.meta.env.DEV || new URLSearchParams(window.location.search).has('sceneDebug'))

const BOX = new THREE.Box3()
const CORNERS = []
for (let i = 0; i < 8; i += 1) CORNERS.push(new THREE.Vector3())

export default function HeroSceneProbe({ choreo }) {
  const frame = useRef(0)
  const { camera, scene, gl } = useThree()

  useFrame(() => {
    frame.current += 1
  })

  useEffect(() => {
    if (!SCENE_PROBE_ENABLED) return undefined

    const snapshot = () => {
      const stageEl = document.querySelector('.hero__scene')
      const stageStyle = stageEl ? window.getComputedStyle(stageEl) : null
      const root = scene.getObjectByName('hero-character-root')
      const c = choreo?.current ?? {}

      // World bounding box of the character (empty box => nothing to draw).
      let box = null
      let ndc = null
      let visible = null
      if (root) {
        root.updateWorldMatrix(true, true)
        BOX.setFromObject(root, true)
        if (!BOX.isEmpty()) {
          const size = new THREE.Vector3()
          const center = new THREE.Vector3()
          BOX.getSize(size)
          BOX.getCenter(center)
          box = {
            min: BOX.min.toArray().map((n) => +n.toFixed(4)),
            max: BOX.max.toArray().map((n) => +n.toFixed(4)),
            size: size.toArray().map((n) => +n.toFixed(4)),
            center: center.toArray().map((n) => +n.toFixed(4)),
          }
          // Project the 8 corners: reports the on-screen footprint in NDC
          // (-1..1 = inside the frame) so "is he in the frustum?" is a fact.
          let minX = Infinity
          let maxX = -Infinity
          let minY = Infinity
          let maxY = -Infinity
          let inside = 0
          CORNERS[0].set(BOX.min.x, BOX.min.y, BOX.min.z)
          CORNERS[1].set(BOX.min.x, BOX.min.y, BOX.max.z)
          CORNERS[2].set(BOX.min.x, BOX.max.y, BOX.min.z)
          CORNERS[3].set(BOX.min.x, BOX.max.y, BOX.max.z)
          CORNERS[4].set(BOX.max.x, BOX.min.y, BOX.min.z)
          CORNERS[5].set(BOX.max.x, BOX.min.y, BOX.max.z)
          CORNERS[6].set(BOX.max.x, BOX.max.y, BOX.min.z)
          CORNERS[7].set(BOX.max.x, BOX.max.y, BOX.max.z)
          for (const p of CORNERS) {
            const v = p.clone().project(camera)
            minX = Math.min(minX, v.x)
            maxX = Math.max(maxX, v.x)
            minY = Math.min(minY, v.y)
            maxY = Math.max(maxY, v.y)
            if (v.x >= -1 && v.x <= 1 && v.y >= -1 && v.y <= 1 && v.z <= 1) inside += 1
          }
          ndc = {
            minX: +minX.toFixed(3),
            maxX: +maxX.toFixed(3),
            minY: +minY.toFixed(3),
            maxY: +maxY.toFixed(3),
            onScreen: inside > 0,
          }
        }
        let vis = true
        let o = root
        while (o) {
          if (o.visible === false) vis = false
          o = o.parent
        }
        visible = vis
      }

      const camDir = camera.getWorldDirection(new THREE.Vector3())
      const target = camera.position.clone().add(camDir.multiplyScalar(10))

      return {
        frame: frame.current,
        t: Math.round(performance.now()),
        contextLost: typeof gl.getContext === 'function' ? gl.getContext().isContextLost() : null,
        visibility: document.visibilityState,
        choreo: {
          x: c.x,
          yaw: c.yaw,
          radius: c.radius,
          height: c.height,
          lookX: c.lookX,
          lookY: c.lookY,
          greet: c.greet,
          orbitAngle: c.orbitAngle,
        },
        camera: {
          pos: camera.position.toArray().map((n) => +n.toFixed(4)),
          target: target.toArray().map((n) => +n.toFixed(4)),
          fov: camera.fov,
          aspect: +camera.aspect.toFixed(4),
          near: camera.near,
          far: camera.far,
        },
        character: {
          found: Boolean(root),
          visible,
          scale: root ? root.children[0]?.scale?.x ?? null : null,
          box,
          ndc,
        },
        canvas: {
          width: gl.domElement.width,
          height: gl.domElement.height,
          cssWidth: gl.domElement.clientWidth,
          cssHeight: gl.domElement.clientHeight,
        },
        stage: {
          exists: Boolean(stageEl),
          dormant: stageEl ? stageEl.classList.contains('is-dormant') : null,
          opacity: stageStyle?.opacity ?? null,
          visibility: stageStyle?.visibility ?? null,
          display: stageStyle?.display ?? null,
        },
        scroll: { y: Math.round(window.scrollY), h: window.innerHeight },
      }
    }

    window.__heroSceneProbe = snapshot
    return () => {
      if (window.__heroSceneProbe === snapshot) delete window.__heroSceneProbe
    }
  }, [camera, gl, scene, choreo])

  return null
}
