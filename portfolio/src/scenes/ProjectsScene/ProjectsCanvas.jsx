/* ProjectsCanvas — lazy blueprint boundary. */
import { Component, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import ProjectsExperience from './ProjectsExperience.jsx'

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

export default function ProjectsCanvas({ tier, reducedMotion, count, onStep, onError }) {
  const progress = useMemo(() => ({ step: 0 }), [])
  return (
    <Boundary onError={onError}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 40, near: 0.1, far: 60, position: [4.5, 4.2, 6.5] }}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor('#050507', 1)
          camera.lookAt(0, 0.4, -1)
        }}
      >
        <color attach="background" args={['#050507']} />
        <ProjectsExperience
          progress={progress}
          tier={tier}
          reducedMotion={reducedMotion}
          count={count}
          onStep={onStep}
        />
      </Canvas>
    </Boundary>
  )
}
