/*
 * heroChoreography — single source of truth for the Phase 2 Hero cinematic.
 *
 * Sequence:
 *   off-screen LEFT → Walk to CENTER → Walk→Idle → close-up →
 *   full 360° CAMERA orbit (character stays stationary) → front return →
 *   name → role → CTA → navbar reveal.
 *
 * The 360° effect is a CAMERA orbit. The character is never rotated for it.
 * Character scale is never touched to fake a camera move.
 *
 * No ScrollTrigger here: the intro is time-based. GSAP owns the one timeline
 * (built in HeroExperience.jsx); nothing else animates the scene, so no
 * competing animation system exists.
 *
 * AUDIO EXTENSION POINT (no audio in this phase):
 *   heroAudio is a clean stub. Future optional music/voice/sound hooks in
 *   here without touching the timeline code.
 */

export const HERO_PHASES = [
  'loading',
  'entering',
  'arrived',
  'closeup',
  'orbit',
  'revealed',
  'complete',
  'fallback',
]

// Approved GLB asset (replaceable external asset — see
// character/characterConfig.js, the single source of truth). Re-exported
// here so existing scene imports keep working; do NOT add a second path.
import { CHARACTER_ASSET, CHARACTER_CLIPS, CHARACTER_TRANSFORM } from './character/characterConfig.js'

// Approved GLB asset (replaceable external asset — characterConfig.js is the
// single source of truth). Re-exported here so existing scene imports keep
// working; do NOT add a second path elsewhere.
export const HERO_CHARACTER = CHARACTER_ASSET
export const HERO_MODEL = CHARACTER_ASSET
export const HERO_MODEL_URL = CHARACTER_ASSET.url

// Verified clip names inside the current GLB (case-preserved).
// Run does NOT exist and must never be referenced.
// Canonical mapping lives in characterConfig.js; re-exported for compat.
export const HERO_CLIPS = CHARACTER_CLIPS

// World layout (metres). Character height ≈ 1.9, stays grounded at y = 0.
// Rotation targets come from CHARACTER_TRANSFORM so a replacement rig's
// facing axis is a one-line change in characterConfig.js — scene, camera,
// lighting and timelines stay independent of the specific mesh.
//
// Framing: the walk still travels LEFT → CENTER (x = restX at arrival) so
// choreography is unchanged; the camera's lookAt drifts toward lookX after
// the orbit, which pushes the settled character visually right-of-center
// while the overlay text owns the left. Camera orbit math itself is
// untouched (radius/height/angle only).
export const HERO_LAYOUT = {
  startX: -3.4, // off-screen LEFT (also off-camera at the wide framing)
  centerX: 0,
  restX: 0,
  floorY: 0,
  // Final camera lookAt offset (metres, world X). Negative lookX moves the
  // frame's center of attention left, so the x=0 character renders on the
  // right third. Small enough to never clip the model on desktop.
  lookX: -1.15,
  // Reduced lookAt offset for narrow screens (no clipping, no overlap).
  lookXTablet: -0.7,
  lookXMobile: 0,
  walkYaw: CHARACTER_TRANSFORM.rotation.walkYaw,
  faceYaw: CHARACTER_TRANSFORM.rotation.faceYaw,
}

// Camera keyframes. Slight low angle at start (eye below look target).
export const HERO_CAMERA = {
  fov: 38,
  wide: { radius: 7.2, height: 1.1, lookY: 1.15 },
  arrived: { radius: 6.0, height: 1.2, lookY: 1.1 },
  closeup: { radius: 3.0, height: 1.5, lookY: 1.2 },
  // Settle slightly wider than close-up so overlay text breathes.
  front: { radius: 4.4, height: 1.4, lookY: 1.1 },
}

// Durations (seconds) per quality tier. Mobile/low keeps the full 360°
// narrative but shorter and cheaper.
export const HERO_TIMINGS = {
  high: { walk: 3.0, pause: 0.45, closeup: 1.6, orbit: 6.0, settle: 1.2 },
  medium: { walk: 2.8, pause: 0.4, closeup: 1.4, orbit: 5.0, settle: 1.0 },
  low: { walk: 2.2, pause: 0.3, closeup: 1.1, orbit: 3.6, settle: 0.8 },
}

// Scene complexity per tier.
export const HERO_QUALITY = {
  high: { particles: 220, reflector: true, shadows: true, dpr: [1, 2] },
  medium: { particles: 120, reflector: true, shadows: false, dpr: [1, 1.75] },
  low: { particles: 48, reflector: false, shadows: false, dpr: [1, 1] },
}

// Controlled orbit lighting. Restrained intensities — never neon/bloom.
// front: subtle fuchsia rim · side: violet/blue · back: dark silhouette + rim.
export const HERO_LIGHTING = {
  ambient: 0.32,
  keyFront: 1.15,
  keyBack: 0.45,
  fuchsia: '#E9307C',
  violet: '#7C5CFF',
  blue: '#4DA3FF',
  rimFront: 1.1,
  rimSide: 1.0,
  rimBack: 1.6,
}

export const resolveHeroTiming = (qualityLevel) =>
  HERO_TIMINGS[qualityLevel] || HERO_TIMINGS.high

export const resolveHeroQuality = (qualityLevel) =>
  HERO_QUALITY[qualityLevel] || HERO_QUALITY.high

/**
 * Audio extension point — intentionally silent in Phase 2.
 * Future: wire optional music / voice / sound here, gated by
 * SceneDirector `soundEnabled`. Do not autoplay anything.
 */
export const heroAudio = {
  enabled: false,
  play: () => {},
  stop: () => {},
  setPhase: () => {},
}
