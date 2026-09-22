/* TechLogo — actual tech brand marks, inline SVG, no new deps. */
import { TechPathsA } from './techPathsA.js'
import { TechPathsB } from './techPathsB.js'
import { TechPathsC } from './techPathsC.js'

const paths = { ...TechPathsA, ...TechPathsB, ...TechPathsC }

const aliases = {
  'Generative AI': 'GenAI tools',
  GenAI: 'GenAI tools',
  Javascript: 'JavaScript',
  Html: 'HTML',
  Css: 'CSS',
  Express: 'Express.js',
  Node: 'Node.js',
  Next: 'Next.js',
  Postgres: 'PostgreSQL',
  Mongo: 'MongoDB',
}

const keyOf = (name) => {
  if (paths[name]) return name
  const alias = aliases[name]
  if (alias && paths[alias]) return alias
  return null
}

export const hasTechLogo = (name) => keyOf(name) !== null

export default function TechLogo({ name }) {
  const key = keyOf(name)
  if (!key) return null
  return (
    <span className="tech-logo" aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img" aria-label={`${key} logo`} fill="currentColor" dangerouslySetInnerHTML={{ __html: paths[key] }} />
    </span>
  )
}
