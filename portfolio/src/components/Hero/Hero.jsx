/*
 * Hero — cinematic intro and identity moment.
 *
 * Layout: left text column (name / role / CTA) + right 3D character.
 * Sequence: Walk in → centre → close-up → 360° CAMERA orbit →
 * "Shiva Singh" → title → CTA → navbar.
 * 3D and HTML UI are separated: <HeroScene /> owns the canvas; this file
 * owns the overlay only. Overlay reveals are driven by SceneDirector
 * heroPhase (reported by the single GSAP timeline in HeroExperience):
 *   revealed/complete/fallback → text + CTAs visible.
 * Without WebGL / with reduced-motion the same content renders statically —
 * no content ever depends solely on animation.
 *
 * The Hero scene stays visible (sticky) during the scroll transition into
 * About, so the character can continue walking RIGHT while the About content
 * slides in from the LEFT. This is driven by a ScrollTrigger in
 * HeroExperience that writes into the shared choreo object.
 */
import { useRef } from 'react'
import HeroScene from '../../scenes/HeroScene/HeroScene.jsx'
import { useSceneDirector } from '../../hooks/useSceneDirector.js'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import './Hero.css'

const REVEALED = new Set(['revealed', 'complete', 'fallback'])

export default function Hero() {
  const { state } = useSceneDirector()
  const reducedMotion = useReducedMotion()
  const heroPhase = state?.heroPhase ?? 'loading'
  const revealed = REVEALED.has(heroPhase)
  const instant = reducedMotion || heroPhase === 'fallback'
  const scrollRef = useRef(null)

  return (
    <section
      id="hero"
      className="hero section"
      data-hero-phase={heroPhase}
      ref={scrollRef}
    >
      {/* R3F canvas mount — fullscreen behind the content. */}
      <HeroScene scrollRef={scrollRef} />

      {/* Text overlay (left). NOT a layout sibling of the canvas — the scene
          is absolutely positioned behind it, so this can never split the
          viewport 50/50. `.hero__content` owns its own max-width/gutter; the
          shared `.container` class is intentionally not used here to avoid a
          competing max-width on the hero overlay. */}
      <div className="hero__content">
        <h1
          className={`hero__title font-display${revealed ? ' is-visible' : ''}${instant ? ' is-instant' : ''}`}
          aria-label="Shiva Singh"
        >
          Shiva Singh
        </h1>
        <p
          className={`hero__subtitle${revealed ? ' is-visible' : ''}${instant ? ' is-instant' : ''}`}
        >
          Full-Stack Developer | AI Engineer
        </p>

        <div
          className={`hero__cta${revealed ? ' is-visible' : ''}${instant ? ' is-instant' : ''}`}
        >
          <a href="#projects" className="btn btn--primary">
            View Projects
          </a>
          <a href="/resume.pdf" className="btn btn--secondary" download>
            Download Resume
          </a>
          <a href="#contact" className="btn btn--secondary">
            Contact
          </a>
        </div>
      </div>
    </section>
  )
}

