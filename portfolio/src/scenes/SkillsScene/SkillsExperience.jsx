/* SkillsExperience — capsule drop + tiny shake + open/pulse + flatten, plus the
 * character's walk-in to the Cyber-Box (see skillsChoreography.js).
 *
 * ONE timeline owns the whole section (as in the Hero/About shots): it drives
 * the capsule `progress` AND the shared character `choreo` (Walk → Idle at the
 * Cyber-Box, derived from real travel by SceneCharacter — never a forced clip).
 * The ScrollTrigger's element is the Skills SECTION: a trigger must be a real
 * DOM node, and the gsap.context scope must be a DOM node too. Passing the R3F
 * <group> here produced "Invalid scope" + an unresolvable trigger, which threw
 * inside ScrollTrigger.refresh() and could leave every other trigger (including
 * the Hero → About shot) with stale bounds.
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CyberBox from './CyberBox.jsx'
import SceneCharacter from '../shared/SceneCharacter.jsx'
import { SKILLS_CHARACTER } from './skillsChoreography.js'

gsap.registerPlugin(ScrollTrigger)

export default function SkillsExperience({ progress, choreo, tier, reducedMotion, onStage, onShook }) {
  const root = useRef(null)
  const cb = useRef({ onStage, onShook })
  cb.current = { onStage, onShook }

  useEffect(() => {
    if (reducedMotion) {
      progress.drop = 1
      progress.open = 1
      progress.glow = 1
      progress.flat = 0
      // No walking under reduced motion: he is simply standing at the console.
      choreo.current.charX = SKILLS_CHARACTER.standX
      choreo.current.yaw = SKILLS_CHARACTER.standYaw
      cb.current.onStage?.(4)
      return undefined
    }
    const triggerEl = document.getElementById('skills') || root.current?.parentElement || null
    if (!triggerEl) return undefined
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: triggerEl, start: 'top 80%', end: 'bottom 30%', scrub: 0.6 },
      })
      tl.to(progress, { drop: 1, duration: 1, ease: 'power2.out' })
      tl.call(() => cb.current.onShook?.(), null, '>')
      tl.to(progress, { shake: 1, duration: 0.12 })
      tl.to(progress, { shake: 0, duration: 0.1 })
      tl.to(progress, { open: 1, glow: 1, duration: 1 })
      tl.call(() => cb.current.onStage?.(0), null, '>')
      tl.to(progress, { stage: 1, duration: 1, onUpdate: () => cb.current.onStage?.(1) })
      tl.to(progress, { stage: 2, duration: 1, onUpdate: () => cb.current.onStage?.(2) })
      tl.to(progress, { stage: 3, duration: 1, onUpdate: () => cb.current.onStage?.(3) })
      tl.to(progress, { stage: 4, duration: 1, onUpdate: () => cb.current.onStage?.(4) })
      tl.to(progress, { flat: 1, duration: 1 })

      // ── HAND-OVER: he walks in beside the console and stays ───────────────
      // Explicit from-values: safe for any scrub direction / speed, and the
      // first tween of each property renders immediately so the pre-scroll
      // state is exactly the off-frame walking pose.
      tl.fromTo(
        choreo.current,
        { charX: SKILLS_CHARACTER.enterX },
        { charX: SKILLS_CHARACTER.standX, duration: SKILLS_CHARACTER.walkDuration, ease: 'none', immediateRender: true },
        SKILLS_CHARACTER.walkAt
      )
      tl.to(
        choreo.current,
        { yaw: SKILLS_CHARACTER.standYaw, duration: SKILLS_CHARACTER.yawDuration, ease: 'power2.inOut' },
        SKILLS_CHARACTER.yawAt
      )
    })
    return () => ctx.revert()
  }, [progress, choreo, tier, reducedMotion])

  return (
    <group ref={root}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#7C5CFF" />
      <CyberBox progress={progress} tier={tier} reducedMotion={reducedMotion} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.9, 0]}>
        <circleGeometry args={[8, 48]} />
        <meshStandardMaterial color="#0B0B10" roughness={0.9} />
      </mesh>
      {/* The shared character layer (characterConfig.js owns the asset/clips):
          walks in from off-frame, idles beside the console. */}
      <SceneCharacter choreo={choreo} floorY={SKILLS_CHARACTER.floorY} reducedMotion={reducedMotion} />
    </group>
  )
}

