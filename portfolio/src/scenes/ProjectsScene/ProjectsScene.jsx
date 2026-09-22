/*
 * ProjectsScene — blueprint floor (lazy) + scroll-driven active project.
 * Locked order; previous projects stay subtly visible; overview at the end.
 */
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { projects } from '../../data/projects.js'
import { useSceneDirector } from '../../hooks/useSceneDirector.js'
import { useWebGLSupport } from '../../hooks/useWebGLSupport.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'

const ProjectsCanvas = lazy(() => import('./ProjectsCanvas.jsx'))

export default function ProjectsScene({ activeIndex, onStep }) {
  const { state } = useSceneDirector()
  const qualityLevel = state?.qualityLevel ?? 'high'
  const webgl = useWebGLSupport()
  const reducedMotion = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleStep = useCallback(
    (next) => {
      onStep?.(next)
    },
    [onStep]
  )

  const tier = qualityLevel === 'low' || qualityLevel === 'medium' ? qualityLevel : 'high'
  const showCanvas = mounted && webgl && !failed && !reducedMotion

  return (
    <div ref={mountRef}>
      <div
        className="projects__scene"
        data-scene="projects"
        data-webgl={String(webgl)}
        data-quality={qualityLevel}
        data-step={activeIndex}
        aria-hidden="true"
      >
        {showCanvas ? (
          <Suspense fallback={<div className="projects__veil" role="status">Loading blueprints…</div>}>
            <ProjectsCanvas
              tier={tier}
              reducedMotion={reducedMotion}
              count={projects.length}
              onStep={handleStep}
              onError={() => setFailed(true)}
            />
          </Suspense>
        ) : (
          <div className="projects__fallback" role="status">
            {reducedMotion || !webgl ? 'Blueprints (static)' : 'Loading blueprints…'}
          </div>
        )}
      </div>
    </div>
  )
}

