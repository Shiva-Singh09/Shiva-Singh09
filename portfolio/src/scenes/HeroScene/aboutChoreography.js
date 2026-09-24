/*
 * aboutChoreography - the scroll-driven About shot.
 *
 * SINGLE source of truth for the About scroll progression:
 *   - the 3D shot (camera + character + stage dissolve) -> createAboutTimeline()
 *   - the viewport anchors for the About content beats (About.jsx) -> ABOUT_TEXT_BEATS
 *   - the reduced-motion / retirement gate -> ABOUT_SCROLL
 *
 * The Hero canvas (HeroExperience -> HeroScene) owns the one ScrollTrigger that
 * drives the timeline; About.jsx only reads the beat anchors. Nothing else
 * animates the camera or the character, so no competing system exists.
 *
 * One continuous shot, progress 0 -> 1 across About's own scroll range:
 *   Hero ends
 *   -> camera leaves the Hero framing (recomposed, slightly wider)
 *   -> character keeps walking (Walk) into his About position and settles (Idle)
 *   -> "01 / ABOUT ME" + "Hi, I'm Shiva Singh." + role enter from the LEFT
 *     while the camera pushes toward the character (below-waist framing)
 *     and he folds his hands in a Namaste greeting, holding the pose
 *   -> introduction -> technology groups reveal one after another (the
 *     character's orientation shifts almost imperceptibly with them)
 *   -> final statement: camera very stable (statement left / character right)
 *   -> character turns toward Skills, walks out; the stage dissolves as the
 *     Skills environment arrives.
 *
 * The greeting pose is an ADDITIVE bone overlay (HeroCharacter.jsx) driven by
 * the timeline's `greet` channel - the GLB has no folded-hands clip. Hero
 * never sets `greet`, so Hero behavior is untouched.
 *
 * Scroll position is the source of truth: every value is a pure function of the
 * trigger's progress, so scrolling up reverses the whole shot, and Walk/Idle is
 * derived from REAL travel (see HeroCharacter.jsx) so a fast scrub can never
 * leave the character stuck mid-stride.
 */
import gsap from 'gsap'
import { HERO_CAMERA, HERO_LAYOUT } from './heroChoreography.js'
import { CHARACTER_TRANSFORM } from './character/characterConfig.js'
import { ABOUT_GREET_POSE, ABOUT_CAMERA_PUSH } from './aboutGreet.js'

// ── Scroll range ─────────────────────────────────────────────────────────
export const ABOUT_SCROLL = {
  trigger: '#about',
  // 0.00 = About's top reaches the viewport bottom (the Hero shot is ending)
  // 1.00 = About's bottom reaches the viewport top (Skills is taking over)
  start: 'top bottom',
  end: 'bottom top',
  scrub: 0.6,
  // Reduced motion: the stage simply retires once About is being read; no
  // walking / camera choreography is created at all.
  rmStart: 'top 60%',
  // Progress at/after which the stage layer is fully retired (visibility) so
  // it can never sit over Skills / Projects / Contact.
  dormantAt: 0.84,
}

// ── Content beats (viewport anchors, consumed by About.jsx) ──────────────
// One scrubbed timeline per beat - never one trigger per element.
export const ABOUT_TEXT_BEATS = {
  // "01 / ABOUT ME" label + section title - the opening visual focus: enters
  // from the left together with the camera push-in toward the character, then
  // the remaining beats reveal only after the greeting gesture settles.
  label: { start: 'top 96%', end: 'top 66%', scrub: 0.5 },
  // "Hi, I'm Shiva Singh." + role
  lead: { start: 'top 88%', end: 'top 60%', scrub: 0.5 },
  // introduction (bio block, pillars, voice controls)
  intro: { start: 'top 88%', end: 'top 55%', scrub: 0.5 },
  // technology ecosystem: group -> logos, progressively
  tech: { start: 'top 88%', end: 'top 24%', scrub: 0.6 },
  // final personal statement (slower, stronger but restrained)
  closing: { start: 'top 88%', end: 'top 52%', scrub: 0.5 },
  // About recedes toward the left as the character turns toward Skills
  exit: { start: 'bottom 92%', end: 'bottom 60%', scrub: 0.5 },
}

// Re-exported so existing consumers (HeroCharacter, verification) keep a
// single import path: the pose + camera-push tables still conceptually belong
// to the About choreography.
export { ABOUT_GREET_POSE, ABOUT_CAMERA_PUSH }

// ── Framing per viewport class ───────────────────────────────────────────
// World-space metres, derived from the existing calibration - never arbitrary
// viewport numbers: the floor sits at y = 0, the character is ~1.9 m tall and
// is grounded by characterConfig.js (bbox-min -> 0). Camera maths is the Hero
// rig's own (x = lookX + sin(angle)·radius, z = cos(angle)·radius,
// lookAt(lookX, lookY, 0)) held at angle 0 (front) for the whole shot: the
// camera only widens / settles / pans - no orbit, no shake, no dolly cheer.
//
// Character targets keep the calibrated model right-of-centre at the settled
// framing and clear of the left text column (≤ 44rem) on every viewport:
//   offset from frame centre = aboutX − lookX.settle
//   screen fraction           = 0.5 + offset / visibleWidth
// with visibleWidth = 2·radius·tan(fov/2)·aspect (fov = HERO_CAMERA.fov).
//
// Small screens frame the character lower and pull the camera back so the copy
// owns the reading band; the stage also softens (stage.settled < 1).
export const ABOUT_VIEWS = {
  desktop: {
    camera: {
      settle: { radius: 5.0, height: 1.38, lookY: 1.02 },
      hold: { radius: 5.15, height: 1.34, lookY: 1.06 },
      exit: { radius: 5.6, height: 1.52, lookY: 1.12 },
    },
    lookX: { settle: -1.55, hold: -1.62, exit: -2.35 },
    // How far the frame focus follows the walking character (subtle).
    lookXFollow: 0.3,
    character: { aboutX: 0.55, exitX: 1.9 },
    // The stage stays fully present for the whole About shot.
    stage: { settled: 1 },
  },
  tablet: {
    camera: {
      settle: { radius: 5.7, height: 1.5, lookY: 1.85 },
      hold: { radius: 5.85, height: 1.46, lookY: 1.9 },
      exit: { radius: 6.2, height: 1.62, lookY: 2.0 },
    },
    lookX: { settle: -0.4, hold: -0.44, exit: -1.15 },
    lookXFollow: 0.22,
    character: { aboutX: 0.4, exitX: 1.5 },
    stage: { settled: 0.75 },
  },
  mobile: {
    camera: {
      // Portrait: the character lives in the lower-right pocket only.
      settle: { radius: 8.5, height: 1.6, lookY: 2.63 },
      hold: { radius: 8.65, height: 1.58, lookY: 2.66 },
      exit: { radius: 9.2, height: 1.7, lookY: 2.72 },
    },
    lookX: { settle: 0, hold: -0.02, exit: -0.75 },
    lookXFollow: 0.15,
    character: { aboutX: 0.54, exitX: 1.7 },
    stage: { settled: 0.6 },
  },
}

// ── Intro camera push (toward the character) ─────────────────────────────
export const ABOUT_CAMERA_PUSH = {
  // Extra radius pull-in (metres) during the intro greeting window - on top
  // of the settle framing, toward a below-waist / upper-leg framing of the
  // ~1.9 m character without cropping face/body awkwardly. Same push on all
  // viewport classes; the base framing already differs per class.
  radiusIn: 1.1,
  // The push window mirrors the greeting window: complete as the hands meet.
  at: 0.06,
  settleAt: 0.2,
  releaseAt: 0.6,
}

// -- Intro greeting pose (Namaste / folded hands) -------------------------------
// No folded-hands clip exists in the GLB (Idle/Walk/Jump/Wave only - verified
// from the binary), so the pose is an additive bone overlay applied inside
// HeroCharacter's own frame loop: the smallest compatible solution on the
// existing rig. Right-arm local quats were solved offline against the bind
// translations (palms meet near the chest centre-line, fingers up, elbows
// down/out); the left arm mirrors the right (negate Y/Z of each local quat -
// the bind chain is X-mirrored). A slight spine bow completes the respectful
// reading. The overlay follows the shared choreography's `greet` channel
// (0 -> 1 -> hold -> release), which the About timeline writes - Hero never sets
// it, so Hero behavior is untouched, and scroll stays the source of truth
// (fully reversible). Reduced motion never raises the channel: no gesture.
// Right-side targets (QUATS_JSON): UA [-0.2282,0.2996,0.3713,0.8487]
// LA [-0.3255,0.1946,0.1099,0.9188] H [-0.5494,-0.239,0.5064,0.6201]
const mirrorX = (q) => [q[0], -q[1], -q[2], q[3]]
const GREET_RIGHT = {
  upperArm: [-0.2282, 0.2996, 0.3713, 0.8487],
  lowerArm: [-0.3255, 0.1946, 0.1099, 0.9188],
  hand: [-0.5494, -0.239, 0.5064, 0.6201],
}
export const ABOUT_GREET_POSE = {
  right: GREET_RIGHT,
  left: {
    upperArm: mirrorX(GREET_RIGHT.upperArm),
    lowerArm: mirrorX(GREET_RIGHT.lowerArm),
    hand: mirrorX(GREET_RIGHT.hand),
  },
  // Respectful bow: small forward pitch (radians, about X) on the spine chain.
  bow: 0.1,
  at: 0.06,
  settle: 0.2,
  // Greeting window inside the About progress range: the gesture completes as
  // the camera settles, holds through the beat reveals, releases pre-exit.
  holdUntil: 0.56,
  releaseAt: 0.6,
}

export const resolveAboutView = (view) => ABOUT_VIEWS[view] ?? ABOUT_VIEWS.desktop

// Subtle orientation beats while the technology groups reveal (radians,
// relative to faceYaw). Deliberately tiny - the content stays the focus, and
// the character never turns dramatically four times.
export const ABOUT_YAW_BEATS = [
  { at: 0.3, yaw: -0.14, group: 'FULL-STACK' },
  { at: 0.38, yaw: -0.22, group: 'AI / ML' },
  { at: 0.46, yaw: -0.05, group: 'DATABASE' },
  { at: 0.54, yaw: 0.02, group: 'TOOLS' },
]

/**
 * The whole About shot as ONE paused timeline (progress 0 -> 1). HeroExperience
 * attaches it to a single scrubbed ScrollTrigger; keeping it ScrollTrigger-free
 * here means the choreography can be verified headlessly (node) as pure maths.
 *
 * @param {object}  target  shared mutable choreo object (x, yaw, radius, height, lookY, lookX)
 * @param {Element} [stage] the fixed stage layer (opacity / retirement)
 * @param {string}  [view]  'desktop' | 'tablet' | 'mobile'
 * @param {number}  [lookX] the responsive Hero settle offset the shot starts from
 */
export const createAboutTimeline = ({ target, stage = null, view = 'desktop', lookX = HERO_LAYOUT.lookX }) => {
  const v = resolveAboutView(view)
  const faceYaw = CHARACTER_TRANSFORM.rotation.faceYaw
  const walkYaw = CHARACTER_TRANSFORM.rotation.walkYaw
  const hero = {
    radius: HERO_CAMERA.front.radius,
    height: HERO_CAMERA.front.height,
    lookY: HERO_CAMERA.front.lookY,
    lookX,
  }
  // Explicit from -> to everywhere: safe for any scrub direction / speed (no
  // start-value capture surprises when the playhead jumps). Only the FIRST
  // tween of each property renders immediately, so the shot always starts from
  // the exact state the Hero cinematic settles into - later tweens must never
  // pre-write their "from" values (that would park the character at the About
  // position before the user scrolls a pixel).
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false } })

  // 1) CAMERA - leave the Hero framing, recompose for About (slightly wider).
  tl.fromTo(
    target,
    { radius: hero.radius, height: hero.height, lookY: hero.lookY, lookX: hero.lookX },
    {
      radius: v.camera.settle.radius,
      height: v.camera.settle.height,
      lookY: v.camera.settle.lookY,
      lookX: v.lookX.settle,
      duration: 0.08,
      ease: 'power2.inOut',
      immediateRender: true,
    },
    0
  )

  // 2) THE CHARACTER WALKS INTO ABOUT. Position is scroll-driven; the Walk clip
  //    follows real travel (HeroCharacter derives the pose), so no clip is ever
  //    forced or restarted on a scroll frame.
  tl.fromTo(target, { yaw: faceYaw }, { yaw: walkYaw, duration: 0.04, ease: 'power2.inOut', immediateRender: true }, 0.03)
  tl.fromTo(target, { x: HERO_LAYOUT.restX }, { x: v.character.aboutX, duration: 0.13, immediateRender: true }, 0.06)
  //    Camera follows the walk subtly - enough to feel alive, never a shake.
  tl.fromTo(
    target,
    { lookX: v.lookX.settle },
    { lookX: v.lookX.settle + v.lookXFollow * v.character.aboutX, duration: 0.13, ease: 'none' },
    0.06
  )

  // 3) ARRIVAL - settles to Idle and orients gently toward the viewer/content.
  tl.fromTo(
    target,
    { yaw: walkYaw },
    { yaw: faceYaw + ABOUT_YAW_BEATS[0].yaw, duration: 0.08, ease: 'power2.out' },
    0.19
  )

  // 4) TECHNOLOGY BEATS - barely-perceptible orientation shifts, in the same
  //    order the groups reveal. The content remains the focus.
  ABOUT_YAW_BEATS.slice(1).forEach((beat, i) => {
    tl.fromTo(
      target,
      { yaw: faceYaw + ABOUT_YAW_BEATS[i].yaw },
      { yaw: faceYaw + beat.yaw, duration: 0.06, ease: 'power1.inOut' },
      beat.at
    )
  })

  // 5) PORTRAIT HOLD - the camera becomes very stable for the final statement
  //    (final statement left · character right) with only a slow, restrained
  //    creep so the frame never feels frozen. No orbit, no aggressive zoom.
  tl.fromTo(
    target,
    { radius: v.camera.settle.radius, height: v.camera.settle.height, lookY: v.camera.settle.lookY },
    { radius: v.camera.hold.radius, height: v.camera.hold.height, lookY: v.camera.hold.lookY, duration: 0.28 },
    0.28
  )
  tl.fromTo(
    target,
    { lookX: v.lookX.settle + v.lookXFollow * v.character.aboutX },
    { lookX: v.lookX.hold, duration: 0.28 },
    0.28
  )

  // 6) EXIT - turns toward the next environment, walks toward Skills while the
  //    camera pans with him and the About stage dissolves. The Skills section
  //    receives the viewer: no blank frame, no teleport.
  tl.fromTo(
    target,
    { yaw: faceYaw + ABOUT_YAW_BEATS[ABOUT_YAW_BEATS.length - 1].yaw },
    { yaw: walkYaw, duration: 0.1, ease: 'power2.inOut' },
    0.6
  )
  tl.fromTo(target, { x: v.character.aboutX }, { x: v.character.exitX, duration: 0.18, ease: 'none' }, 0.64)
  tl.fromTo(
    target,
    { radius: v.camera.hold.radius, height: v.camera.hold.height, lookY: v.camera.hold.lookY, lookX: v.lookX.hold },
    {
      radius: v.camera.exit.radius,
      height: v.camera.exit.height,
      lookY: v.camera.exit.lookY,
      lookX: v.lookX.exit,
      duration: 0.2,
      ease: 'power1.inOut',
    },
    0.62
  )

  // 7) STAGE - softens where the viewport is text-dominant (small screens),
  //    then dissolves as Skills arrives (first stage tween renders immediately
  //    so the layer always starts fully present).
  if (stage) {
    if (v.stage.settled < 1) {
      tl.fromTo(stage, { opacity: 1 }, { opacity: v.stage.settled, duration: 0.1, immediateRender: true }, 0.08)
      tl.fromTo(stage, { opacity: v.stage.settled }, { opacity: 0, duration: 0.16, ease: 'power1.in' }, 0.68)
    } else {
      tl.fromTo(stage, { opacity: 1 }, { opacity: 0, duration: 0.16, ease: 'power1.in', immediateRender: true }, 0.68)
    }
  }

  // Pad the timeline to a total duration of exactly 1.0 so scroll progress maps
  // 1:1 onto the phase fractions documented above (0.30 / 0.38 / 0.54 / 0.84…).
  tl.to({ aboutEnd: 0 }, { aboutEnd: 1, duration: 0.0001 }, 1)

  return tl
}

export default createAboutTimeline