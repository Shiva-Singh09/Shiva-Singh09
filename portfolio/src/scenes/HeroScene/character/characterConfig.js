/*
 * characterConfig — SINGLE source of truth for the replaceable character.
 *
 * The character GLB is a replaceable external asset: the current model
 * (shiva-character.glb) may be swapped later for a better likeness without
 * rewriting the portfolio. Everything character-specific lives HERE:
 *   - model path (URL)
 *   - animation clip names + logical pose names
 *   - scale / calibration
 *   - position / rotation offsets
 *   - animation fade configuration
 *
 * Scene logic (camera, lighting, environment, GSAP timelines, overlays,
 * sections) must NEVER hardcode geometry, materials, facial details, mesh
 * names, or clip strings — it reads this config (or the controller hook)
 * instead. Replacing the GLB later = update `url` (+ clip names / scale if
 * the new rig differs) in this file only.
 *
 * Current active model: /models/shiva-character.glb
 * Verified clips in the current file: Idle, Walk, Jump, Wave.
 * Run does NOT exist in the current file and must never be referenced.
 */
export const CHARACTER_ASSET = {
  // Public URL of the active character GLB.
  url: '/models/shiva-character.glb',
  label: 'shiva-character',
  // Explicitly replaceable: a future likeness swap touches this file only.
  replaceable: true,
}

// Logical → actual clip-name mapping for the active GLB (case-preserved).
// Jump + Wave are loaded/available but never auto-played in Hero.
export const CHARACTER_CLIPS = {
  idle: 'Idle',
  walk: 'Walk',
  jump: 'Jump',
  wave: 'Wave',
}

// Transform / calibration for the active rig. Uniform scale only — natural
// proportions are always preserved (never non-uniform, never as a camera
// dolly fake). `scale: 1` keeps the authored ~1.9 m height as-is; if a
// replacement rig ships at a different height, set scale (or use
// scaleMode 'match-height' with targetHeight) here — nowhere else.
export const CHARACTER_TRANSFORM = {
  scale: 1,
  targetHeight: 1.9,
  // 'fixed-unity' keeps scale as authored; 'match-height' auto-derives a
  // uniform scale from the model's bounding-box height vs targetHeight.
  scaleMode: 'fixed-unity',
  // Generic grounding: bounding-box minimum lifted to y = 0 every load, so
  // ANY replacement rig rests exactly on the floor with no per-mesh tweaks.
  grounding: 'bbox-min-to-zero',
  // The current rig faces +Z; travelling toward +X means yaw ≈ +90°.
  // If a replacement rig faces a different axis, update walkYaw here only.
  rotation: {
    walkYaw: Math.PI / 2,
    faceYaw: 0,
  },
}

// Logical pose names scene choreography may request through `poseRef`.
// Each maps to a clip via CHARACTER_CLIPS (case-insensitive resolution in
// the controller). Jump is available but never forced into the story.
export const CHARACTER_POSES = {
  idle: 'idle',
  walk: 'walk',
  wave: 'wave',
  jump: 'jump',
}

// Animation blending configuration (seconds). Used by the controller hook
// for clean Walk ⇄ Idle (and Wave) crossfades — no snapping, no foot-slide
// hacks. `<pose>FadeIn/FadeOut` keys are looked up per pose; entries fall
// back to defaultFadeIn/defaultFadeOut for poses without a dedicated pair.
export const CHARACTER_ANIMATION = {
  walkFadeIn: 0.4,
  walkFadeOut: 0.35,
  idleFadeIn: 0.35,
  idleFadeOut: 0.25,
  waveFadeIn: 0.4,
  waveFadeOut: 0.3,
  defaultFadeIn: 0.35,
  defaultFadeOut: 0.3,
  exitFade: 0.3,
}
