/*
 * useReveal — IntersectionObserver scroll reveal (GSAP-free, calm).
 * Adds .is-visible when the element enters the viewport; keeps it visible
 * when scrolling back (reversible-safe: never hides content again).
 * Reduced-motion users get .is-visible immediately via CSS fallback.
 */
import { useEffect, useRef } from 'react'

export const useReveal = (options = {}) => {
  const ref = useRef(null)
  const { threshold = 0.2, rootMargin = '0px 0px -8% 0px' } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold, rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin])

  return ref
}
