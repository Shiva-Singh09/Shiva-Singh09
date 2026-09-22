/*
 * Loading — cinematic intro gate.
 *
 * Shows while fonts/initial paint settle, then fades out gracefully.
 * Motion is stripped under prefers-reduced-motion (no fade, just remove).
 */
import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion.js'
import './Loading.css'

export default function Loading({ ready }) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(true)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    if (ready) {
      if (reduced) {
        // No motion: remove instantly.
        setMounted(false)
        return
      }
      // Fade out, then unmount after the CSS transition completes.
      setHiding(true)
      const timer = setTimeout(() => setMounted(false), 600)
      return () => clearTimeout(timer)
    }
  }, [ready, reduced])

  if (!mounted) return null

  return (
    <div
      className={`loading ${hiding ? 'loading--hide' : ''}`}
      aria-live="polite"
      aria-label="Loading experience"
    >
      <div className="loading__content">
        <p className="loading__title font-display">SHIVA SINGH</p>
        <p className="loading__status">INITIALIZING EXPERIENCE…</p>
        <span className="loading__tag">v0.1 · Phase 1 foundation</span>
      </div>
    </div>
  )
}
