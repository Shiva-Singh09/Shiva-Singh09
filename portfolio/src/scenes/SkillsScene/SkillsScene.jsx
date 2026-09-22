/*
 * SkillsScene — Cyber-Box stage (lazy) + holographic category panels.
 * Scroll progression: arrival → approach → activation → 5 categories →
 * completion (box flattens into the blueprint floor Projects inherits).
 * Reversible: panels activate by scroll position, never hide content.
 */
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { skills } from '../../data/skills.js'
import { useSceneDirector } from '../../hooks/useSceneDirector.js'
import { useWebGLSupport } from '../../hooks/useWebGLSupport.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import { useReveal } from '../../hooks/useReveal.js'
import { useAudio } from '../../hooks/useAudio.js'
import TechLogo from '../../components/TechLogo/TechLogo.jsx'

const SkillsCanvas = lazy(() => import('./SkillsCanvas.jsx'))

export default function SkillsScene() {
  const { state } = useSceneDirector()
  const qualityLevel = state?.qualityLevel ?? 'high'
  const soundEnabled = state?.soundEnabled ?? true
  const webgl = useWebGLSupport()
  const reducedMotion = useReducedMotion()
  const { playCue } = useAudio(soundEnabled)
  const headRef = useReveal()
  const [stage, setStage] = useState(4)
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

  const handleStage = useCallback((next) => {
    setStage(Math.max(0, Math.min(4, Math.round(next))))
  }, [])

  const handleShook = useCallback(() => {
    playCue()
  }, [playCue])

  const tier = qualityLevel === 'low' || qualityLevel === 'medium' ? qualityLevel : 'high'
  const showCanvas = mounted && webgl && !failed && !reducedMotion

  return (
    <div ref={mountRef}>
      <div
        className="skills__scene"
        data-scene="skills"
        data-webgl={String(webgl)}
        data-quality={qualityLevel}
        aria-hidden="true"
      >
        {showCanvas ? (
          <Suspense fallback={<div className="skills__veil" role="status">Preparing console…</div>}>
            <SkillsCanvas
              tier={tier}
              reducedMotion={reducedMotion}
              onStage={handleStage}
              onShook={handleShook}
              onError={() => setFailed(true)}
            />
          </Suspense>
        ) : (
          <div className="skills__fallback" role="status">
            {reducedMotion || !webgl ? 'Skills console (static)' : 'Preparing console…'}
          </div>
        )}
      </div>

      <div ref={headRef} className="skills__stages reveal" aria-label="Skill categories in activation order">
        {skills.map((group, i) => (
          <article
            key={group.category}
            className={`skills__stage${i <= stage ? ' is-active' : ''}`}
            aria-current={i === stage ? 'true' : undefined}
          >
            <div className="skills__stage-head">
              <span className="skills__stage-index">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="skills__stage-title">{group.category}</h3>
            </div>
            <ul className="skills__stage-list">
              {group.items.map((item) => (
                <li key={item}>
                  <TechLogo name={item} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}

