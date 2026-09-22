import { useEffect, useState } from 'react'

/**
 * Tracks the OS-level "prefers-reduced-motion" setting.
 * Used by animated surfaces (e.g. the loader) so motion is removed for
 * users who disable it, never forcing animation on them.
 */
export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  return reduced
}
