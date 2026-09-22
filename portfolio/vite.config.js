import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration.
// React 19 with the automatic JSX runtime is handled by @vitejs/plugin-react.
// Base path stays "/" so the app (and /resume.pdf) resolve from the site root.
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
  build: {
    // Phase 2 will lazy-load the 3D stack (three / @react-three/fiber /
    // @react-three/drei) via manualChunks as a function. Nothing is split
    // yet because the 3D scenes are not imported in Phase 1.
  },
})

