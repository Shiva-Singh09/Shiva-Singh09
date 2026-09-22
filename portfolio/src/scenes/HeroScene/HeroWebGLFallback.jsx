/*
 * HeroWebGLFallback — graceful non-3D surface.
 *
 * Rendered when WebGL is unavailable (and announced politely): the same
 * dark floor glow + identity content so the story stays complete without
 * the canvas. No fake character, no fake canvas.
 */
export default function HeroWebGLFallback() {
  return (
    <div className="hero__fallback" role="status">
      <span className="hero__fallback-glow" aria-hidden="true" />
      <p className="hero__fallback-text">Cinematic 3D unavailable — showing the full story instead.</p>
    </div>
  )
}
