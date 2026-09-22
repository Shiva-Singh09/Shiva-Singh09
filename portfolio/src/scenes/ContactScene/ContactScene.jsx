/*
 * ContactScene — rope stage (lazy) + phase caption.
 * Scroll controls arrival → grab → tension → pull → settle.
 */
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useSceneDirector } from '../../hooks/useSceneDirector.js'
import { useWebGLSupport } from '../../hooks/useWebGLSupport.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'

const ContactCanvas = lazy(() => import('./ContactCanvas.jsx'))

const captions = {
  arrival: 'The line drops in…',
  pull: 'Grabbed — pulling…',
  settled: 'Settled. Reach out below — every link works without 3D.',
}

export default function ContactScene() {
  const { state } = useSceneDirector()
  const qualityLevel = state?.qualityLevel ?? 'high'
  const webgl = useWebGLSupport()
  const reducedMotion = useReducedMotion()
  const [phase, setPhase] = useState('arrival')
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

  const showCanvas = mounted && webgl && !failed && !reducedMotion

  return (
    <div ref={mountRef}>
      <div
        className="contact__scene"
        data-scene="contact"
        data-webgl={String(webgl)}
        data-quality={qualityLevel}
        data-phase={phase}
        aria-hidden="true"
      >
        {showCanvas ? (
          <Suspense fallback={<div className="contact__veil" role="status">Rigging the line…</div>}>
            <ContactCanvas
              reducedMotion={reducedMotion}
              onPhase={setPhase}
              onError={() => setFailed(true)}
            />
          </Suspense>
        ) : (
          <div className="contact__fallback" role="status">
            {reducedMotion || !webgl ? 'Contact line (static)' : 'Rigging the line…'}
          </div>
        )}
      </div>
      <p className="contact__caption" role="status">
        {captions[phase] ?? captions.arrival}
      </p>
    </div>
  )
}

