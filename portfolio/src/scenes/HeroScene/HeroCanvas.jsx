/*
 * HeroCanvas — the lazy R3F boundary.
 *
 * Split into its own module so `three` / `@react-three/fiber` / drei only
 * load when the Hero mounts (separate chunk via React.lazy in HeroScene).
 * A class error boundary degrades to the WebGL fallback instead of a crash.
 *
 * Canvas is non-interactive by design (eventSource not attached, pointer
 * events off) so it never blocks page interaction while loading or after.
 */
import { Component } from 'react'
import { Canvas } from '@react-three/fiber'
import HeroExperience from './HeroExperience.jsx'
import { HERO_CAMERA } from './heroChoreography.js'

class HeroCanvasErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError?.()
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

export default function HeroCanvas({
  choreo,
  tier,
  dpr,
  shadows,
  reducedMotion,
  phase,
  lookX,
  onPhase,
  onClips,
  onReady,
  onError,
}) {
  return (
    <HeroCanvasErrorBoundary onError={onError}>
      <Canvas
        dpr={dpr}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: HERO_CAMERA.fov, near: 0.1, far: 60, position: [0, 1.25, 6.6] }}
        shadows={shadows ? 'soft' : false}
        frameloop={reducedMotion && phase === 'complete' ? 'demand' : 'always'}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#050507', 1)
        }}
      >
        <color attach="background" args={['#050507']} />
        <HeroExperience
          choreo={choreo}
          tier={tier}
          reducedMotion={reducedMotion}
          phase={phase}
          lookX={lookX}
          onPhase={onPhase}
          onClips={onClips}
          onReady={onReady}
        />
      </Canvas>
    </HeroCanvasErrorBoundary>
  )
}
