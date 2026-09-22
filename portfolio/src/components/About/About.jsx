/*
 * About — "Who is Shiva?" Factual intro + voice architecture + tech logos.
 * Content centralized in src/data/about.js. Voice-over uses Web Speech API
 * (no audio file); never autoplays; mute/unmute toggle; reduced-motion safe.
 *
 * Scroll choreography: text slides in from the LEFT (via GSAP ScrollTrigger)
 * in sync with the Hero character walking further RIGHT (driven by
 * aboutChoreography.js in HeroExperience). No competing animation system.
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { aboutIntro } from '../../data/about.js'
import { useSceneDirector } from '../../hooks/useSceneDirector.js'
import { useAudio } from '../../hooks/useAudio.js'
import { useReveal } from '../../hooks/useReveal.js'
import TechLogo from '../TechLogo/TechLogo.jsx'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const { state, setState } = useSceneDirector()
  const soundEnabled = state?.soundEnabled ?? true
  const { supported, speaking, speak, stop } = useAudio(soundEnabled)
  const headRef = useReveal()
  const bodyRef = useReveal()
  const techRef = useReveal()
  const closeRef = useReveal()
  const contentRef = useRef(null)

  // Scroll-driven content reveal: text block fades up + slides right slightly
  // as the character moves toward the right side. Keeps both visible.
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!contentRef.current) return
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: 'top 85%',
          end: 'top 55%',
          scrub: 0.6,
        },
      })
      tl.fromTo(
        contentRef.current,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      )
    })
    return () => ctx.revert()
  }, [])

  const toggleVoice = () => {
    if (speaking) {
      stop()
      return
    }
    speak(aboutIntro.voiceScript)
  }

  const toggleSound = () => {
    stop()
    setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }

  return (
    <section id="about" className="about section" aria-labelledby="about-title">
      <div className="container about__grid">
        <div ref={contentRef} className="about__main">
          <header ref={headRef} className="section-header reveal">
            <span className="section-number" aria-label="Section 01 of 5">
              01 / ABOUT ME
            </span>
            <h2 id="about-title" className="section-title">
              <span className="section-title__number">01</span> / About Me
            </h2>
          </header>

          <div ref={bodyRef} className="about__content reveal">
            <div className="about__lead">
              <p className="about__greeting">{aboutIntro.greeting}</p>
              <p className="about__role">{aboutIntro.role}</p>
            </div>

            <p className="about__bio">{aboutIntro.bio}</p>

            <ul className="about__pillars">
              {aboutIntro.pillars.map((pillar) => (
                <li key={pillar}>{pillar}</li>
              ))}
            </ul>

            <div className="about__audio">
              <button
                type="button"
                className="btn btn--secondary about__voice-btn"
                onClick={toggleVoice}
                aria-pressed={speaking}
                disabled={!supported}
                title={
                  supported
                    ? 'Play the spoken introduction'
                    : 'Voice-over is not supported in this browser'
                }
              >
                {speaking ? 'Stop voice' : 'Listen to intro'}
              </button>
              <button
                type="button"
                className="btn btn--ghost about__mute-btn"
                onClick={toggleSound}
                aria-pressed={!soundEnabled}
              >
                {soundEnabled ? 'Mute audio' : 'Unmute audio'}
              </button>
              {!supported && (
                <span className="about__audio-note" role="note">
                  Voice unavailable in this browser — the text above is the full script.
                </span>
              )}
            </div>
          </div>

          <div ref={techRef} className="about__tech reveal" aria-label="Technologies I use">
            {aboutIntro.techGroups.map((group) => (
              <div key={group.category} className="about__tech-group">
                <h3 className="about__tech-title">{group.category}</h3>
                <ul className="about__tech-list">
                  {group.items.map((item) => (
                    <li key={item} className="about__tech-item">
                      <TechLogo name={item} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <blockquote ref={closeRef} className="about__closing reveal">
            <p>{aboutIntro.closing}</p>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

