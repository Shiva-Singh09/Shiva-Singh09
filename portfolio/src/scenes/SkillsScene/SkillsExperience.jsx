/* SkillsExperience — capsule drop + tiny shake + open/pulse + flatten. */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CyberBox from './CyberBox.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function SkillsExperience({ progress, tier, reducedMotion, onStage, onShook }) {
  const root = useRef(null)
  const cb = useRef({ onStage, onShook })
  cb.current = { onStage, onShook }

  useEffect(() => {
    const el = root.current
    if (!el || reducedMotion) {
      progress.drop = 1
      progress.open = 1
      progress.glow = 1
      progress.flat = 0
      cb.current.onStage?.(4)
      return undefined
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 30%', scrub: 0.6 },
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
    }, el)
    return () => ctx.revert()
  }, [progress, tier, reducedMotion])

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
    </group>
  )
}
