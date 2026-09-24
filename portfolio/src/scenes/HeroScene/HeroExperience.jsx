/*
 * HeroExperience — contents of the Hero <Canvas>.
 *
 * Structure:
 *   HeroScene (lazy Canvas boundary)
 *   └─ HeroExperience (this file)
 *      ├─ HeroEnvironment (fog + subtle particles)
 *      ├─ HeroFloor (controlled reflection)
 *      ├─ HeroCharacter (approved GLB — Walk → Idle)
 *      ├─ HeroLighting (fuchsia front / violet-blue side / silhouette back)
 *      └─ HeroCameraRig (the ONLY camera driver)
 *
 * Owns the SINGLE GSAP timeline for the whole cinematic. Nothing else in the
 * app animates the camera, character, or lights, so no competing animation
 * system exists. The timeline writes into one shared `choreo` object; the
 * rig, character and lighting read it in useFrame.
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroCharacter from './HeroCharacter.jsx'
import HeroLighting from './HeroLighting.jsx'
import HeroFloor from './HeroFloor.jsx'
import HeroEnvironment from './HeroEnvironment.jsx'
import HeroCameraRig from './HeroCameraRig.jsx'
import { HERO_CAMERA, HERO_LAYOUT, resolveHeroTiming } from './heroChoreography.js'
import { ABOUT_SCROLL, createAboutTimeline } from './aboutChoreography.js'

gsap.registerPlugin(ScrollTrigger)

export default function HeroExperience({
  choreo,
  tier,
  reducedMotion,
  phase,
  onPhase,
  onClips,
  onReady,
  lookX = 0,
  view = 'desktop',
  stageRef = null,
}) {
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const callbacks = useRef({ onPhase, onClips, onReady })
  callbacks.current = { onPhase, onClips, onReady }
  const lookXRef = useRef(lookX)
  lookXRef.current = lookX
  const viewRef = useRef(view)
  viewRef.current = view
  const started = useRef(false)

  // The single cinematic timeline. Built once the GLB + first frame exist
  // (parent only mounts this inside <Suspense>, so model is resolved here).
  useEffect(() => {
    if (started.current) return undefined
    started.current = true

    const t = resolveHeroTiming(tier)
    const c = choreo.current

    // Reset to the initial state: off-screen LEFT, wide low-angle front view.
    c.x = HERO_LAYOUT.startX
    c.yaw = HERO_LAYOUT.walkYaw
    c.orbitAngle = 0
    c.lookX = 0
    c.radius = HERO_CAMERA.wide.radius
    c.height = HERO_CAMERA.wide.height
    c.lookY = HERO_CAMERA.wide.lookY

    const setPhase = (next) => {
      callbacks.current.onPhase?.(next)
    }

    if (reducedMotion) {
      // Skip/reduce choreography: stable centred character, balanced light.
      c.x = HERO_LAYOUT.centerX
      c.yaw = HERO_LAYOUT.faceYaw
      c.orbitAngle = 0
      c.lookX = lookXRef.current || 0
      c.radius = HERO_CAMERA.front.radius
      c.height = HERO_CAMERA.front.height
      c.lookY = HERO_CAMERA.front.lookY
      setPhase('revealed')
      callbacks.current.onReady?.()
      setPhase('complete')
      return undefined
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    tl.call(() => setPhase('entering'), null, 0.15)

    // 1) WALK-IN — constant speed (power1.in? no: linear avoids foot-slide
    //    illusions against the travel distance), camera holds wide.
    tl.to(
      c,
      {
        x: HERO_LAYOUT.centerX,
        duration: t.walk,
        ease: 'none',
        onStart: () => setPhase('entering'),
        onComplete: () => setPhase('arrived'),
      },
      0.2
    )
    tl.to(
      c,
      {
        radius: HERO_CAMERA.arrived.radius,
        height: HERO_CAMERA.arrived.height,
        lookY: HERO_CAMERA.arrived.lookY,
        duration: t.walk,
        ease: 'power1.out',
      },
      0.2
    )

    // 2) ARRIVAL — ease yaw back to face-front while Walk fades to Idle.
    tl.to(
      c,
      { yaw: HERO_LAYOUT.faceYaw, duration: 0.7, ease: 'power2.out' },
      `>-0.35`
    )
    tl.to(c, { duration: t.pause }, '>')

    // 3) CLOSE-UP — smooth dolly in (real camera move; scale never touched).
    tl.call(() => setPhase('closeup'))
    tl.to(
      c,
      {
        radius: HERO_CAMERA.closeup.radius,
        height: HERO_CAMERA.closeup.height,
        lookY: HERO_CAMERA.closeup.lookY,
        duration: t.closeup,
        ease: 'power2.inOut',
      },
      '>'
    )

    // 4) 360° CAMERA ORBIT — character stationary in Idle. Accelerate through
    //    the dramatic sweep, then settle smoothly back to exact front.
    tl.call(() => setPhase('orbit'))
    const orbit = { a: 0 }
    tl.to(orbit, {
      a: Math.PI * 2,
      duration: t.orbit,
      ease: 'power1.inOut',
      onUpdate: () => {
        c.orbitAngle = orbit.a
      },
      onComplete: () => {
        c.orbitAngle = 0
      },
    })
    tl.to(
      c,
      {
        radius: HERO_CAMERA.front.radius,
        height: HERO_CAMERA.front.height,
        lookY: HERO_CAMERA.front.lookY,
        // Ease the frame's focus point left during the settle so the
        // stationary character lands visually right-of-center. Orbit math
        // itself is untouched.
        lookX: lookXRef.current || 0,
        duration: t.settle,
        ease: 'power2.out',
        onStart: () => setPhase('revealed'),
        onComplete: () => {
          c.orbitAngle = 0
          setPhase('complete')
        },
      },
      '>'
    )

            // Reveal the overlay + navbar the moment the scene is initialised: the
    // character is already visible walking in, so the 3D is never hidden
    // behind a loader — "Entering workspace…" is the Suspense fallback only.
    callbacks.current.onReady?.()

    return () => {
      tl.kill()
    }
    // Intentionally once: the timeline owns the whole intro. Tier changes
    // after start would fight the running timeline, so they apply on reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── About scroll choreography ─────────────────────────────────────────
  // Created once the Hero cinematic has handed over (complete / fallback), so
  // the timer-driven intro and the scroll-driven About shot can never fight over
  // the camera. ONE scrubbed timeline owns the whole shot — the camera leaving
  // the Hero framing, the character walking in and settling to Idle, the
  // technology-reveal orientation beats, then the turn + walk toward Skills
  // while the stage dissolves (see aboutChoreography.js). Scroll position is the
  // source of truth, so scrolling up reverses every state; the fixed stage layer
  // is retired while later sections are on screen.
  useEffect(() => {
    if (phase !== 'complete' && phase !== 'fallback') return undefined
    const stageEl = stageRef?.current ?? null
    let dormantNow = null
    const setDormant = (dormant) => {
      if (!stageEl || dormantNow === dormant) return
      dormantNow = dormant
      stageEl.classList.toggle('is-dormant', dormant)
    }

    if (reducedMotion) {
      // Reduced motion: no walking / camera choreography at all — the stage
      // simply retires once About is being read, so the copy owns the viewport.
      const rm = ScrollTrigger.create({
        trigger: ABOUT_SCROLL.trigger,
        start: ABOUT_SCROLL.rmStart,
        end: ABOUT_SCROLL.end,
        onUpdate: (self) => setDormant(self.progress > 0),
      })
      setDormant(rm.progress > 0)
      return () => rm.kill()
    }

    const tl = createAboutTimeline({
      target: choreo.current,
      stage: stageEl,
      view: viewRef.current,
      lookX: lookXRef.current || 0,
    })
    const trigger = ScrollTrigger.create({
      trigger: ABOUT_SCROLL.trigger,
      start: ABOUT_SCROLL.start,
      end: ABOUT_SCROLL.end,
      scrub: ABOUT_SCROLL.scrub,
      animation: tl,
      onUpdate: (self) => setDormant(self.progress >= ABOUT_SCROLL.dormantAt),
    })
    // ScrollTrigger may already be past its start (reload mid-page): sync once.
    setDormant(trigger.progress >= ABOUT_SCROLL.dormantAt)

    return () => {
      trigger.kill()
      tl.kill()
      if (stageEl) {
        stageEl.classList.remove('is-dormant')
        stageEl.style.opacity = ''
      }
    }
  }, [phase, reducedMotion, choreo, view, stageRef])

  return (
    <group>
      <HeroEnvironment tier={tier} />
      <HeroFloor tier={tier} />
      <HeroCharacter
        choreo={choreo}
        phase={phase}
        reducedMotion={reducedMotion}
        onClips={onClips}
      />
      <HeroLighting choreo={choreo} tier={tier} />
      <HeroCameraRig choreo={choreo} />
    </group>
  )
}
