/* SkillsCanvas — lazy R3F boundary for the Cyber-Box stage. */
import { Component, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import SkillsExperience from './SkillsExperience.jsx'

class Boundary extends Component {
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

function ShakeRig({ progress, children }) {
  const group = useRef(null)
  useFrame(() => {
    const g = group.current
    if (!g) return
    const s = progress.shake || 0
    g.position.x = s > 0 ? (Math.random() - 0.5) * 0.06 * s : 0
    g.position.y = s > 0 ? (Math.random() - 0.5) * 0.04 * s : 0
  })
  return <group ref={group}>{children}</group>
}

export default function SkillsCanvas({ tier, reducedMotion, onStage, onShook, onError }) {
  const progress = useMemo(
    () => ({ drop: 0, open: 0, glow: 0, stage: 0, flat: 0, shake: 0 }),
    []
  )
  return (
    <Boundary onError={onError}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 38, near: 0.1, far: 60, position: [0, 1.4, 6.4] }}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => gl.setClearColor('#0B0B10', 1)}
      >
        <color attach="background" args={['#0B0B10']} />
        <ShakeRig progress={progress}>
          <SkillsExperience
            progress={progress}
            tier={tier}
            reducedMotion={reducedMotion}
            onStage={onStage}
            onShook={onShook}
          />
        </ShakeRig>
      </Canvas>
    </Boundary>
  )
}
