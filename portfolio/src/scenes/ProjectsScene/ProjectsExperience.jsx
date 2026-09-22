/* ProjectsExperience — elevated 3/4 blueprint view; scroll drives step. */
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BlueprintStage from './BlueprintStage.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectsExperience({ progress, tier, reducedMotion, count, onStep }) {
  useEffect(() => {
    if (reducedMotion) {
      progress.step = -1
      onStep?.(-1)
      return undefined
    }
    const st = ScrollTrigger.create({
      trigger: '#projects',
      start: 'top 70%',
      end: 'bottom 60%',
      scrub: 0.6,
      onUpdate: (self) => {
        const seg = Math.floor(self.progress * (count + 1))
        const next = seg >= count ? -1 : seg
        progress.step = next
        onStep?.(next)
      },
    })
    return () => st.kill()
  }, [progress, tier, reducedMotion, count, onStep])

  return <BlueprintStage step={progress.step ?? 0} count={count} reducedMotion={reducedMotion} />
}
