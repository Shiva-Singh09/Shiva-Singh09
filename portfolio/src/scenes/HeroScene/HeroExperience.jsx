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
import { ABOUT_LAYOUT, ABOUT_CAMERA, ABOUT_SCROLL, resolveAboutProgress } from './aboutChoreography.js'

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
}) {
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const callbacks = useRef({ onPhase, onClips, onReady })
  callbacks.current = { onPhase, onClips, onReady }
  const lookXRef = useRef(lookX)
  lookXRef.current = lookX
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

    // ── About scroll choreography ───────────────────────────────────────
    // Scroll-driven continuation: the character walks further RIGHT while the
    // About section reveals on the LEFT. Fires after the hero cinematic ends.
    // Writes into the SAME shared choreo object so the character/camera/lighting
    // stay in sync — no competing animation system.
    const aboutTrigger = ScrollTrigger.create({
      trigger: '#about',
      start: ABOUT_SCROLL.start,
      end: ABOUT_SCROLL.end,
      scrub: ABOUT_SCROLL.scrub,
      onUpdate: (self) => {
        const p = resolveAboutProgress(self.progress)
        // Character walks toward the right edge (+X). Yaw stays facing front
        // (no Run clip exists — we never reference it).
        c.x = ABOUT_LAYOUT.restX + p.exitT * (ABOUT_LAYOUT.exitX - ABOUT_LAYOUT.restX)
        c.yaw = ABOUT_LAYOUT.exitYaw
        // Camera lookX drifts right to keep both character and About content
        // in frame. Orbit math untouched; this is purely the focus offset.
        const baseLookX = lookXRef.current || 0
        c.lookX = baseLookX + p.exitT * (ABOUT_CAMERA.lookXEnd - baseLookX)
        // Camera height stays in the settled front framing.
        c.radius = ABOUT_CAMERA.radius
        c.height = ABOUT_CAMERA.height
        c.lookY = ABOUT_CAMERA.lookY
      },
      // No explicit onComplete: scrub keeps the character parked at the end
      // value until Hero unmounts (scroll back reverses it naturally).
    })

    return () => {
      tl.kill()
      aboutTrigger.kill()
    }
    // Intentionally once: the timeline owns the whole intro. Tier changes
    // after start would fight the running timeline, so they apply on reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
