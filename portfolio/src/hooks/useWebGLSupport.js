import { useEffect, useState } from 'react'

/**
 * Detects WebGL availability without rendering anything visible.
 * The SceneDirector uses qualityLevel; scenes use this to decide whether
 * to mount the 3D canvas or fall back to semantic content.
 *
 * Phase 1: returns a boolean used by SceneMount data attributes; the real
 * <Canvas> mount is deferred to Phase 2.
 */
export const useWebGLSupport = () => {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    let canvas
    try {
      canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      setSupported(Boolean(gl))
    } catch {
      setSupported(false)
    } finally {
      canvas?.remove?.()
    }
  }, [])

  return supported
}
