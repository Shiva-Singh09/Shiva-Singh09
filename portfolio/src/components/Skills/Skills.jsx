/*
 * Skills — "What can Shiva build with?" Data-driven categories + the
 * Cyber-Box stage. No percentages, no bars, no dashboard cards.
 */
import { useRef } from 'react'
import { skills } from '../../data/skills.js'
import { useReveal } from '../../hooks/useReveal.js'
import TechLogo from '../TechLogo/TechLogo.jsx'
import SkillsScene from '../../scenes/SkillsScene/SkillsScene.jsx'
import './Skills.css'

export default function Skills() {
  const headRef = useReveal()
  const gridRef = useReveal()
  const stageRef = useRef(null)

  return (
    <section id="skills" className="skills section" aria-labelledby="skills-title">
      <div className="container">
        <header ref={headRef} className="section-header reveal">
          <span className="section-number" aria-label="Section 02 of 5">
            02 / SKILLS
          </span>
          <h2 id="skills-title" className="section-title">
            <span className="section-title__number">02</span> / Skills
          </h2>
        </header>

        <div ref={stageRef}>
          <SkillsScene />
        </div>

        <div ref={gridRef} className="skills__grid reveal" aria-label="Complete skill reference">
          {skills.map((group) => (
            <div key={group.category} className="skill-group">
              <h3 className="skill-group__title">{group.category}</h3>
              <ul className="skill-group__list">
                {group.items.map((item) => (
                  <li key={item}>
                    <TechLogo name={item} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

