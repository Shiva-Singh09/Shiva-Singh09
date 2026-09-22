/*
 * aboutChoreography — scroll-driven continuation from the Hero cinematic into
 * the About section. The character (still in the fullscreen Hero canvas) walks
 * further toward the RIGHT as the user scrolls from Hero into About, while the
 * About content slides in from the LEFT.
 *
 * This file is the single source of truth for the About scroll progression.
 * HeroScene (the lazy canvas mount) owns the GSAP ScrollTrigger that writes into
 * the shared `choreo` object; HeroCharacter / HeroCameraRig read it per-frame.
 *
 * Phases (scroll progress 0 → 1 across the combined Hero+About scroll range):
 *   0.00  – character at hero rest position (right-of-center)
 *   0.40  – character moved further right, About content fully revealed
 *   0.70  – character exits toward right edge
 *   1.00  – Hero canvas fades out, About takes over (canvas unmounts)
 */

// Final character x offset when fully in About (further right than Hero rest).
export const ABOUT_LAYOUT = {
  // Rest position is hero restX (0, with camera lookX doing the visual offset).
  // We push the character to the right side of the floor plane.
  restX: 0,
  exitX: 4.2,        // character walks toward +X, off the right edge of the floor
  exitYaw: 0,        // keep facing front after exiting (don't rotate to run — Run doesn't exist)
}

// Camera stays in the settled "front" framing during About; it doesn't orbit.
export const ABOUT_CAMERA = {
  radius: 4.4,
  height: 1.4,
  lookY: 1.1,
  // lookX keeps drifting right as the character moves, keeping both in frame.
  lookXEnd: -1.4,
}

// Scroll progress thresholds (0..1 across the trigger range).
export const ABOUT_SCROLL = {
  start: 'top 85%',
  end: 'bottom 40%',
  scrub: 0.5,
  // fraction of scroll progress where About content is fully revealed
  contentRevealAt: 0.4,
  // fraction where character begins exiting toward right
  exitStartAt: 0.55,
  // fraction where character has fully exited
  exitEndAt: 0.95,
}

export const resolveAboutProgress = (p) => {
  const clamped = Math.min(1, Math.max(0, p))
  return {
    charX: clamped < ABOUT_SCROLL.contentRevealAt
      ? ABOUT_LAYOUT.restX
      : clamped > ABOUT_SCROLL.exitEndAt
        ? ABOUT_LAYOUT.exitX
        : clamped < ABOUT_SCROLL.exitStartAt
          ? ABOUT_LAYOUT.restX
          : ABOUT_LAYOUT.exitX,
    contentReveal: Math.min(1, clamped / ABOUT_SCROLL.contentRevealAt),
    exitT: clamped > ABOUT_SCROLL.exitStartAt
      ? Math.min(1, (clamped - ABOUT_SCROLL.exitStartAt) / (ABOUT_SCROLL.exitEndAt - ABOUT_SCROLL.exitStartAt))
      : 0,
  }
}
