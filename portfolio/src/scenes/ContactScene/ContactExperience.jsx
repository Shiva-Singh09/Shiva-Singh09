/* ContactExperience — scroll scrubs arrive → grab → tension → pull. */
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RopeStage from './RopeStage.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function ContactExperience({ progress, reducedMotion, onPhase }) {
  useEffect(() => {
    if (reducedMotion) {
      progress.arrive = 1
      progress.pull = 0.6
      progress.settle = 1
      onPhase?.('settled')
      return undefined
    }
    const st = ScrollTrigger.create({
      trigger: '#contact',
      start: 'top 80%',
      end: 'bottom 55%',
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress
        progress.arrive = Math.min(1, p / 0.35)
        progress.pull = Math.max(0, Math.min(1, (p - 0.35) / 0.4))
        progress.settle = Math.max(0, Math.min(1, (p - 0.75) / 0.25))
        onPhase?.(p < 0.35 ? 'arrival' : p < 0.75 ? 'pull' : 'settled')
      },
    })
    return () => st.kill()
  }, [progress, reducedMotion, onPhase])

  return <RopeStage progress={progress} reducedMotion={reducedMotion} />
}
