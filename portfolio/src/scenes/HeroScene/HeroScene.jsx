/*
 * HeroScene — Phase 2 cinematic Hero: "A developer entering his own
 * digital workspace." Lazy Canvas boundary + WebGL/reduced-motion gates.
 * Structure: HeroScene → HeroExperience → Environment/Floor/Character/
 * Lighting/CameraRig. 3D and HTML UI stay separated (Hero.jsx owns the
 * overlay); they communicate only through SceneDirector heroPhase.
 * Loading is a restrained "Entering workspace…" veil, never a % counter.
 */
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSceneDirector } from '../../hooks/useSceneDirector.js'
import { useWebGLSupport } from '../../hooks/useWebGLSupport.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import HeroWebGLFallback from './HeroWebGLFallback.jsx'
import { HERO_CAMERA, HERO_LAYOUT, resolveHeroQuality } from './heroChoreography.js'

const HeroCanvas = lazy(() => import('./HeroCanvas.jsx'))

const pickTier = () => {
  if (typeof window === 'undefined') return 'high'
  const w = window.innerWidth || 1280
  if (w < 768) return 'low'
  if (w < 1280) return 'medium'
  return 'high'
}

export default function HeroScene({ scrollRef }) {
  const { state, updateQualityLevel, updateHeroPhase, setHeroReady, setNavbarVisible, setHeroClips } =
    useSceneDirector()
  const qualityLevel = state?.qualityLevel ?? 'high'
  const heroPhase = state?.heroPhase ?? 'loading'
  const webgl = useWebGLSupport()
  const reducedMotion = useReducedMotion()
  const [webglChecked, setWebglChecked] = useState(false)
  const [canvasFailed, setCanvasFailed] = useState(false)
  const prevPhase = useRef(heroPhase)

  // Shared mutable choreography object: written by the single GSAP timeline
  // in HeroExperience, read per-frame by rig/character/lighting.
  const choreo = useMemo(
    () => ({
      current: {
        x: HERO_LAYOUT.startX,
        yaw: reducedMotion ? HERO_LAYOUT.faceYaw : HERO_LAYOUT.walkYaw,
        orbitAngle: 0,
        lookX: 0,
        radius: reducedMotion ? HERO_CAMERA.front.radius : HERO_CAMERA.wide.radius,
        height: reducedMotion ? HERO_CAMERA.front.height : HERO_CAMERA.wide.height,
        lookY: reducedMotion ? HERO_CAMERA.front.lookY : HERO_CAMERA.wide.lookY,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Final framing offset (metres): negative lookX shifts the camera focus
  // left, rendering the settled character right-of-center beside the left
  // text column. Disabled on small screens so nothing clips or overlaps.
  const [lookX, setLookX] = useState(0)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth || 1280
      if (w < 768) setLookX(HERO_LAYOUT.lookXMobile)
      else if (w < 1100) setLookX(HERO_LAYOUT.lookXTablet)
      else setLookX(HERO_LAYOUT.lookX)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    updateQualityLevel(pickTier())
    const onResize = () => updateQualityLevel(pickTier())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [updateQualityLevel])

  useEffect(() => {
    const t = setTimeout(() => setWebglChecked(true), 350)
    return () => clearTimeout(t)
  }, [])

  const handlePhase = useCallback((next) => updateHeroPhase(next), [updateHeroPhase])
  const handleReady = useCallback(() => setHeroReady(true), [setHeroReady])
  const handleClips = useCallback((clips) => setHeroClips(clips), [setHeroClips])

  // Navbar reveals only after handover (revealed/complete), or immediately
  // for reduced-motion / no-WebGL so navigation is never hidden.
  useEffect(() => {
    if (!webglChecked) return
    const show =
      reducedMotion || !webgl || canvasFailed || heroPhase === 'revealed' || heroPhase === 'complete'
    setNavbarVisible(show)
    prevPhase.current = heroPhase
  }, [webglChecked, reducedMotion, webgl, canvasFailed, heroPhase, setNavbarVisible])

  // Safety: never trap the page in 'loading' if the lazy chunk stalls.
  useEffect(() => {
    if (heroPhase !== 'loading') return undefined
    const t = setTimeout(() => {
      updateHeroPhase('fallback')
      setHeroReady(true)
      setNavbarVisible(true)
    }, 14000)
    return () => clearTimeout(t)
  }, [heroPhase, updateHeroPhase, setHeroReady, setNavbarVisible])

  const showCanvas = webglChecked && webgl && !canvasFailed
  const showFallback = webglChecked && (!webgl || canvasFailed)
  const tierQuality = resolveHeroQuality(qualityLevel)
  const tier = qualityLevel === 'low' || qualityLevel === 'medium' ? qualityLevel : 'high'

  return (
    <div
      className="hero__scene"
      data-scene="hero"
      data-webgl={String(webgl)}
      data-quality={qualityLevel}
      data-phase={showFallback ? 'fallback' : heroPhase}
      aria-hidden="true"
    >
      {showFallback ? (
        <HeroWebGLFallback />
      ) : showCanvas ? (
        <Suspense fallback={<HeroSceneVeil />}>
          <HeroCanvas
            choreo={choreo}
            tier={tier}
            dpr={tierQuality.dpr}
            shadows={tierQuality.shadows}
            reducedMotion={reducedMotion}
            phase={heroPhase}
            lookX={lookX}
            onPhase={handlePhase}
            onClips={handleClips}
            onReady={handleReady}
            onError={() => setCanvasFailed(true)}
          />
        </Suspense>
      ) : (
        <HeroSceneVeil />
      )}
    </div>
  )
}

/** Restrained loader veil — never a giant % counter. */
export function HeroSceneVeil() {
  return (
    <div className="hero__veil" role="status" aria-label="Entering workspace">
      <span className="hero__veil-dot" aria-hidden="true" />
      <p className="hero__veil-text">Entering workspace…</p>
    </div>
  )
}

