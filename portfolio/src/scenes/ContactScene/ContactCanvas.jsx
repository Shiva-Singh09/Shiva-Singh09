/* ContactCanvas — lazy rope boundary. */
import { Component, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import ContactExperience from './ContactExperience.jsx'

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

export default function ContactCanvas({ reducedMotion, onPhase, onError }) {
  const progress = useMemo(() => ({ arrive: 0, pull: 0, settle: 0 }), [])
  return (
    <Boundary onError={onError}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 40, near: 0.1, far: 60, position: [0, 1.6, 6.8] }}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => gl.setClearColor('#050507', 1)}
      >
        <color attach="background" args={['#050507']} />
        <ContactExperience progress={progress} reducedMotion={reducedMotion} onPhase={onPhase} />
      </Canvas>
    </Boundary>
  )
}
