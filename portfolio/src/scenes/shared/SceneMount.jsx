/*
 * SceneMount — shared boundary for R3F scenes.
 *
 * Phase 2: exposes runtime capability (WebGL + quality tier) through data
 * attributes. Hero mounts its own lazy <Canvas> (see HeroScene); the other
 * scenes remain empty mounts so nothing breaks without WebGL — section
 * semantic content always renders regardless.
 *
 * Used by every scene placeholder (Hero / Skills / Projects / Contact).
 */
import { useSceneDirector } from '../../hooks/useSceneDirector.js'
import { useWebGLSupport } from '../../hooks/useWebGLSupport.js'

export default function SceneMount({ scene = 'scene', className = '' }) {
  const { state } = useSceneDirector()
  const qualityLevel = state?.qualityLevel ?? 'high'
  const webgl = useWebGLSupport()

  return (
    <div
      className={`scene-mount ${className}`.trim()}
      data-scene={scene}
      data-webgl={String(webgl)}
      data-quality={qualityLevel}
      aria-hidden="true"
    />
  )
}

