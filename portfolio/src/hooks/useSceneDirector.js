import { useContext } from 'react'
import { SceneDirectorContext } from '../state/SceneDirectorContext.jsx'

/**
 * Scene Director consumer hook.
 * Gives components a typed view of the orchestration context.
 */
export const useSceneDirector = () => useContext(SceneDirectorContext)
