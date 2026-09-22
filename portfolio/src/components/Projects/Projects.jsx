/*
 * Projects — "What has Shiva built?" Locked order, factual content, real
 * logos, links only where URLs are known. Scroll-driven blueprint stage
 * highlights the active card; previous cards stay subtly visible.
 */
import { useState } from 'react'
import { projects } from '../../data/projects.js'
import { projectBadges, projectFlows } from '../../data/projectFlows.js'
import { useReveal } from '../../hooks/useReveal.js'
import TechLogo from '../TechLogo/TechLogo.jsx'
import ProjectsScene from '../../scenes/ProjectsScene/ProjectsScene.jsx'
import './Projects.css'

export default function Projects() {
  const headRef = useReveal()
  const [active, setActive] = useState(0)
  const overview = active === -1

  const statusLabel = {
    live: 'Live',
    'in-development': 'In development',
  }

  return (
    <section id="projects" className="projects section" aria-labelledby="projects-title">
      <div className="container">
        <header ref={headRef} className="section-header reveal">
          <span className="section-number" aria-label="Section 03 of 5">
            03 / PROJECTS
          </span>
          <h2 id="projects-title" className="section-title">
            <span className="section-title__number">03</span> / Projects
          </h2>
        </header>

        <ProjectsScene activeIndex={active} onStep={setActive} />

        {overview && (
          <p className="projects__overview" role="status">
            All five builds in view — pick any project to revisit the details.
          </p>
        )}

        <div className="projects__list">
          {projects.map((project, i) => (
            <article
              key={project.id}
              className={`project-card${i === active ? ' is-active' : ''}${overview ? ' is-overview' : ' is-dimmed'}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <header className="project-card__header">
                <h3 className="project-card__title">{project.title}</h3>
                <span className="project-card__status" aria-label={`Status: ${statusLabel[project.status]}`}>
                  {statusLabel[project.status]}
                </span>
              </header>

              <p className="project-card__badge">{projectBadges[project.id]}</p>
              {project.tagline && <p className="project-card__tagline">{project.tagline}</p>}
              {project.description && <p className="project-card__description">{project.description}</p>}
              {project.role && (
                <p className="project-card__role">
                  <span className="project-card__role-label">Role:</span> {project.role}
                </p>
              )}

              {projectFlows[project.id] && (
                <ol className="project-card__flow" aria-label={`${project.title} pipeline`}>
                  {projectFlows[project.id].map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}

              <ul className="project-card__tech">
                {project.tech.map((t) => (
                  <li key={t}>
                    <TechLogo name={t} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              {project.links && (project.links.live || project.links.github) && (
                <div className="project-card__links">
                  {project.links.live && (
                    <a href={project.links.live} className="project-card__link btn btn--ghost" target="_blank" rel="noopener noreferrer">
                      Live Demo
                    </a>
                  )}
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      className="project-card__link btn btn--ghost"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      GitHub
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

