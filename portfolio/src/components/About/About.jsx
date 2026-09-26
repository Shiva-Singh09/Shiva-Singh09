/*
 * About — "Who is Shiva?" Factual intro + voice architecture + real tech logos.
 * Content lives in src/data/about.js. Voice-over uses the Web Speech API (no
 * audio file, never autoplays); mute/unmute stays available.
 *
 * SCROLL CHOREOGRAPHY — see scenes/HeroScene/aboutChoreography.js, the single
 * source of truth for the About scroll range. The character (in the fixed Hero
 * canvas) walks into his About position, settles to Idle and stays present
 * beside this copy while it reveals; then he turns and walks toward Skills.
 *
 * This file owns the CONTENT side of that same range: one scrubbed timeline per
 * beat (label / lead / introduction / technology / closing + exit) — never one
 * trigger per element, never a typing effect, nothing per letter. Scrub means
 * scrolling up reverses every beat. Reduced-motion users get the full content
 * with no motion at all: the beats are only created when motion is allowed, so
 * the semantic markup is visible by default and never depends on animation.
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { aboutIntro } from '../../data/about.js'
import { useSceneDirector } from '../../hooks/useSceneDirector.js'
import { useAudio } from '../../hooks/useAudio.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import { ABOUT_TEXT_BEATS } from '../../scenes/HeroScene/aboutChoreography.js'
import TechLogo from '../TechLogo/TechLogo.jsx'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

// Shared reveal primitive: opacity + slide/rise + defocus — transform/opacity only
// (plus one small blur on text blocks, as specified) so scrub frames stay cheap.
// `hide: true` also toggles visibility and is reserved for interactive blocks
// (the voice controls) so hidden buttons are never tabbable. Text blocks use
// opacity only, which keeps the whole About story in the accessibility tree at
// every scroll position — nothing about Shiva depends on animation.
const reveal = (tl, el, opts = {}, at = 0) => {
  if (!el || (el.length !== undefined && el.length === 0)) return
  const { x = 0, y = 30, blur = 7, scale = null, stagger = 0, duration = 1, ease = 'power2.out', hide = false } = opts
  const alpha = hide ? 'autoAlpha' : 'opacity'
  const from = { x, y, filter: `blur(${blur}px)`, [alpha]: 0 }
  const to = { x: 0, y: 0, filter: 'blur(0px)', duration, ease, [alpha]: 1 }
  if (scale) {
    from.scale = scale
    to.scale = 1
  }
  if (stagger) to.stagger = stagger
  tl.fromTo(el, from, to, at)
}

// One scrubbed timeline per content beat, anchored in aboutChoreography.js.
const beat = (trigger, cfg) =>
  gsap.timeline({
    scrollTrigger: { trigger, start: cfg.start, end: cfg.end, scrub: cfg.scrub },
  })

export default function About() {
  const { state, setState } = useSceneDirector()
  const soundEnabled = state?.soundEnabled ?? true
  const { supported, speaking, speak, stop } = useAudio(soundEnabled)
  const reducedMotion = useReducedMotion()

  const sectionRef = useRef(null)
  const labelRef = useRef(null)
  const titleRef = useRef(null)
  const greetingRef = useRef(null)
  const roleRef = useRef(null)
  const bioRef = useRef(null)
  const pillarsRef = useRef(null)
  const audioRef = useRef(null)
  const techRef = useRef(null)
  const closingRef = useRef(null)
  const mainRef = useRef(null)
  const bridgeRef = useRef(null)

  // ── Content choreography: one scrubbed timeline per beat ────────────────
  useEffect(() => {
    // Reduced motion: create nothing — every block keeps its readable resting
    // state and only the stage retires (see HeroExperience).
    if (reducedMotion) return undefined
    const B = ABOUT_TEXT_BEATS
    const ctx = gsap.context(() => {
      // 01 / ABOUT ME — small, secondary, cinematic (never typed).
      const labelTl = beat(labelRef.current, B.label)
      reveal(labelTl, labelRef.current, { x: -40, y: 0, blur: 7, duration: 1 })
      reveal(labelTl, titleRef.current, { x: -50, y: 0, blur: 6, duration: 1 }, 0.5)

      // Primary heading, then the role slightly later — one complete statement
      // each; the role never becomes more dominant than the heading. Both
      // enter from the LEFT, in step with the camera's push toward the
      // character (see aboutChoreography.js: label/lead open the shot).
      const leadTl = beat(greetingRef.current, B.lead)
      reveal(leadTl, greetingRef.current, { x: -70, y: 0, blur: 7, scale: 0.985, duration: 1 })
      reveal(leadTl, roleRef.current, { x: -45, y: 0, blur: 6, duration: 0.9 }, 0.55)

      // Introduction — one coherent block (never line-by-line), then the
      // supporting pillars and the voice controls.
      const introTl = beat(bioRef.current, B.intro)
      reveal(introTl, bioRef.current, { y: 26, blur: 7, duration: 1 })
      reveal(introTl, pillarsRef.current?.children, { y: 14, blur: 4, duration: 0.6, stagger: 0.06 }, 0.45)
      reveal(introTl, audioRef.current, { y: 12, blur: 3, duration: 0.6, hide: true }, 0.7)

      // Technology ecosystem — group by group, in order: category label first,
      // then the real logos with a small stagger. Same motion language for every
      // item, so the four groups read as one coherent system.
      const groups = techRef.current ? gsap.utils.toArray('.about__tech-group', techRef.current) : []
      if (groups.length) {
        const techTl = beat(techRef.current, B.tech)
        groups.forEach((group, i) => {
          reveal(techTl, group.querySelector('.about__tech-title'), { y: 15, blur: 5, duration: 0.5 }, i)
          reveal(
            techTl,
            group.querySelectorAll('.about__tech-item'),
            { y: 15, blur: 4, duration: 0.5, stagger: 0.08 },
            i + 0.3
          )
        })
      }

      // Final personal statement — slower, stronger, still restrained.
      const closeTl = beat(closingRef.current, B.closing)
      reveal(closeTl, closingRef.current, { y: 30, blur: 7, duration: 1.3 })

      // Exit — About recedes toward the left as the character turns to Skills.
      const exitTl = beat(sectionRef.current, B.exit)
      exitTl.fromTo(
        mainRef.current,
        { x: 0, autoAlpha: 1 },
        { x: -70, autoAlpha: 0.12, duration: 1, ease: 'power1.inOut' },
        0
      )
      if (bridgeRef.current) {
        exitTl.fromTo(
          bridgeRef.current,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 0.75, y: 0, duration: 1, ease: 'power2.out' },
          0.3
        )
      }
    }, sectionRef.current)
    return () => ctx.revert()
  }, [reducedMotion])

  // Voice-over is opt-in (no autoplay, no forced audio). When it is playing,
  // stop it as the shot leaves the screen so it never talks over Skills.
  // No music asset exists in public/audio — nothing to duck.
  useEffect(() => {
    if (reducedMotion) return undefined
    const t = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'bottom 45%',
      onLeave: () => stop(),
    })
    return () => t.kill()
  }, [stop, reducedMotion])

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
    <section ref={sectionRef} id="about" className="about section" aria-labelledby="about-title">
      <div className="container about__grid">
        <div ref={mainRef} className="about__main">
          <header className="section-header">
            <span ref={labelRef} className="section-number" aria-label="Section 01 of 5">
              01 / ABOUT ME
            </span>
            <h2 ref={titleRef} id="about-title" className="section-title">
              <span className="section-title__number">01</span> / About Me
            </h2>
          </header>

          <div className="about__content">
            <div className="about__lead">
              <p ref={greetingRef} className="about__greeting">
                {aboutIntro.greeting}
              </p>
              <p ref={roleRef} className="about__role">
                {aboutIntro.role}
              </p>
            </div>

            <p ref={bioRef} className="about__bio">
              {aboutIntro.bio}
            </p>

            <ul ref={pillarsRef} className="about__pillars">
              {aboutIntro.pillars.map((pillar) => (
                <li key={pillar}>{pillar}</li>
              ))}
            </ul>

            <div ref={audioRef} className="about__audio">
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

          <div ref={techRef} className="about__tech" aria-label="Technologies I use">
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

          <blockquote ref={closingRef} className="about__closing">
            <p>{aboutIntro.closing}</p>
          </blockquote>
        </div>

        {/* Bridge into Skills: gives the exit beat its scroll room and hands the
            story over to the Cyber-Box stage. Decorative only. */}
        <div ref={bridgeRef} className="about__bridge" aria-hidden="true">
          <span className="about__bridge-line" />
          <span className="about__bridge-label">continuing to skills</span>
        </div>
      </div>
    </section>
  )
}
