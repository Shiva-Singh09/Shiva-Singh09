/*
 * Journey — "How did Shiva get here?" Calm vertical timeline.
 * 2027 rendered as expected/current (never completed). Sequential
 * node activation via IntersectionObserver; horizontal bridge into Contact.
 */
import { useEffect, useRef } from 'react'
import { journey } from '../../data/journey.js'
import { useReveal } from '../../hooks/useReveal.js'
import './Journey.css'

export default function Journey() {
  const headRef = useReveal()
  const listRef = useRef(null)

  useEffect(() => {
    const root = listRef.current
    if (!root || typeof IntersectionObserver === 'undefined') {
      root?.querySelectorAll('.journey__milestone').forEach((el) => el.classList.add('is-visible'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.35 }
    )
    root.querySelectorAll('.journey__milestone').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="journey" className="journey section" aria-labelledby="journey-title">
      <div className="container">
        <header ref={headRef} className="section-header reveal">
          <span className="section-number" aria-label="Section 04 of 5">
            04 / MY JOURNEY
          </span>
          <h2 id="journey-title" className="section-title">
            <span className="section-title__number">04</span> / My Journey
          </h2>
        </header>

        <ol ref={listRef} className="journey__timeline">
          {journey.map((milestone) => {
            const current = milestone.year === '2027'
            return (
              <li
                key={milestone.year}
                className={`journey__milestone${current ? ' journey__milestone--current' : ''}`}
              >
                <time className="journey__year" dateTime={milestone.year}>
                  {milestone.year}
                  {current && (
                    <span className="journey__current-tag">Expected · in progress</span>
                  )}
                </time>
                <ul className="journey__items">
                  {milestone.items.map((item) => (
                    <li key={`${milestone.year}-${item.title}`} className="journey__item">
                      <span className="journey__item-title">{item.title}</span>
                      {item.subtitle && (
                        <span className="journey__item-subtitle">{item.subtitle}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>

        <div className="journey__bridge" aria-hidden="true">
          <span className="journey__bridge-line" />
          <span className="journey__bridge-label">toward contact</span>
        </div>
      </div>
    </section>
  )
}

