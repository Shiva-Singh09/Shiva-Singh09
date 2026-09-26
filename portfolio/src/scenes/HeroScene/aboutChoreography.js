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
  // Progress at/after which the stage layer is retired (visibility) so it can
  // never sit over the Skills / Projects stages once they are the subject. The
  // About shot ends exactly at 1.0, so the dissolve (0.74 -> 0.94 in the
  // timeline) and this gate both belong to the hand-over: the character stays
  // visible for the whole About shot and is received by the Skills stage
  // (SkillsScene -> SceneCharacter) as the Hero layer dissolves.
  dormantAt: 0.94,
}

// ── Content beats (viewport anchors, consumed by About.jsx) ──────────────
// One scrubbed timeline per beat - never one trigger per element.
export const ABOUT_TEXT_BEATS = {
  // "01 / ABOUT ME" label + section title - the opening visual focus: enters
  // from the left together with the camera push-in toward the character
  // (progress window approx. 0.08 - 0.21), then the remaining beats reveal
  // only after the greeting gesture settles (fold 0.2 - 0.3).
  label: { start: 'top 96%', end: 'top 66%', scrub: 0.5 },
  // "Hi, I'm Shiva Singh." + role - left-entry completes before the fold
  // (window approx. 0.13 - 0.21).
  lead: { start: 'top 88%', end: 'top 70%', scrub: 0.5 },
  // introduction (bio block, pillars, voice controls) - starts only after the
  // Namaste has settled (window approx. 0.31 - 0.43).
  intro: { start: 'top 60%', end: 'top 33%', scrub: 0.5 },
  // technology ecosystem: group -> logos, progressively (window approx.
  // 0.44 - 0.56, tracked by ABOUT_YAW_BEATS).
  tech: { start: 'top 51%', end: 'top 24%', scrub: 0.6 },
  // final personal statement (slower, stronger but restrained); window
  // approx. 0.50 - 0.58, complete before the hands release and the turn at 0.6.
  closing: { start: 'top 64%', end: 'top 46%', scrub: 0.5 },
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
//
// FRUSTUM INVARIANT (the bug this table exists around): the character must stay
// INSIDE the horizontal frame at every beat, on every viewport class -
// otherwise he is clipped by the right edge and then walks off screen, i.e.
// "the character disappears when scrolling into About".
//   |charX - lookX| <= 0.92 * radius * tan(fov/2) * aspect - halfBody
// with halfBody ~ 0.55 m (the rig's measured world bbox half-width) and
// aspect >= 1.25 (the narrowest desktop-class window). tan(fov/2) = 0.3443, so
// the budget is 0.396 * radius - 0.55:
//   radius 4.40 (hero front) -> 1.19 m     radius 5.00 (settle) -> 1.43 m
//   radius 3.90 (pushed in)  -> 0.99 m     radius 5.15 (hold)   -> 1.49 m
//                                          radius 5.60 (exit)   -> 1.67 m
// Every character position below is paired with the lookX that keeps the
// offset inside that budget, so the camera pans WITH him instead of leaving him
// behind the right edge (the old -1.55 / -2.35 focus pushed him out of frame
// from ~p 0.15 and off screen well before the shot ended).
export const ABOUT_VIEWS = {
  desktop: {
    camera: {
      settle: { radius: 5.0, height: 1.38, lookY: 1.02 },
      hold: { radius: 5.15, height: 1.34, lookY: 1.06 },
      exit: { radius: 5.6, height: 1.52, lookY: 1.12 },
    },
    // Frustum budget at each beat (see the invariant above the table):
    // settle 1.43 / push 0.99 / hold 1.49 / exit 1.67 m. The offsets used here
    // are 1.35 / 0.95 / 1.40 / 1.55, so he is never clipped by the right edge.
    lookX: { settle: -1.05, push: -0.65, hold: -1.1, exit: -0.2 },
    character: { aboutX: 0.3, exitX: 1.35 },
    // The stage stays fully present for the whole About shot.
    stage: { settled: 1 },
  },
  tablet: {
    camera: {
      settle: { radius: 5.7, height: 1.5, lookY: 1.85 },
      hold: { radius: 5.85, height: 1.46, lookY: 1.9 },
      exit: { radius: 6.2, height: 1.62, lookY: 2.0 },
    },
    // Same pan as before at settle/hold; the exit keeps a 1.7 m offset so he
    // stays inside the 6.2 m frame while walking toward the Skills stage.
    lookX: { settle: -0.4, push: -0.31, hold: -0.44, exit: -0.3 },
    character: { aboutX: 0.4, exitX: 1.4 },
    // Small screens keep a legibility veil (About.css) - never a blackout.
    stage: { settled: 0.85 },
  },
  mobile: {
    camera: {
      // Portrait: the character lives in the lower-right pocket only.
      settle: { radius: 8.5, height: 1.6, lookY: 2.63 },
      hold: { radius: 8.65, height: 1.58, lookY: 2.66 },
      exit: { radius: 9.2, height: 1.7, lookY: 2.72 },
    },
    // Portrait aspect is the tightest frame (budget 0.79 m at the exit
    // radius), so the exit pan follows him with a 0.70 m offset.
    lookX: { settle: 0, push: 0.08, hold: -0.02, exit: 0.85 },
    character: { aboutX: 0.54, exitX: 1.55 },
    stage: { settled: 0.8 },
  },
}

// Greeting pose + camera-push tables live in aboutGreet.js (re-exported above).
export const resolveAboutView = (view) => ABOUT_VIEWS[view] ?? ABOUT_VIEWS.desktop

// Subtle orientation beats while the technology groups reveal (radians,
// relative to faceYaw). Deliberately tiny - the content stays the focus, and
// the character never turns dramatically four times.
export const ABOUT_YAW_BEATS = [
  { at: 0.3, yaw: -0.14, group: 'FULL-STACK' },
  { at: 0.47, yaw: -0.22, group: 'AI / ML' },
  { at: 0.5, yaw: -0.05, group: 'DATABASE' },
  { at: 0.53, yaw: 0.02, group: 'TOOLS' },
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
  //    Camera recomposes toward the walking character - the horizontal half of
  //    the intro push-in (settle -> push focus), so the model lands in the
  //    right third of the pushed-in frame instead of cropping at the edge.
  tl.fromTo(
    target,
    { lookX: v.lookX.settle },
    { lookX: v.lookX.push, duration: 0.13, ease: 'none' },
    0.06
  )

  // 2b) CAMERA PUSH - the opening move: while the label / lead enter from the
  //    left, the camera draws in and stops at the below-waist framing where
  //    the greeting reads (radius only; the horizontal pan rides the walk
  //    tween above, and the settled height / lookY already frame the
  //    character). Starts at 0.08 so it takes `radius` over exactly when the
  //    recompose tween above lets go.
  tl.fromTo(
    target,
    { radius: v.camera.settle.radius },
    {
      radius: v.camera.settle.radius - ABOUT_CAMERA_PUSH.radiusIn,
      duration: ABOUT_CAMERA_PUSH.settleAt - ABOUT_CAMERA_PUSH.at,
      ease: 'power2.inOut',
    },
    ABOUT_CAMERA_PUSH.at
  )

  // 2c) NAMASTE - the fold rises ONLY after the camera has stopped (greet.at =
  //    push.settleAt), holds through the introduction / technology reveals and
  //    releases just before the turn toward Skills. Hero never writes `greet`
  //    (HeroCharacter falls back to 0), so the Hero cinematic is untouched.
  tl.fromTo(
    target,
    { greet: 0 },
    {
      greet: 1,
      duration: ABOUT_GREET_POSE.settle - ABOUT_GREET_POSE.at,
      ease: 'power2.inOut',
    },
    ABOUT_GREET_POSE.at
  )
  tl.fromTo(
    target,
    { greet: 1 },
    {
      greet: 0,
      duration: ABOUT_GREET_POSE.releaseAt - ABOUT_GREET_POSE.holdUntil,
      ease: 'power1.inOut',
    },
    ABOUT_GREET_POSE.holdUntil
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
    // Returns FROM the pushed radius: continuous chain hero -> settle (0.08)
    // -> pushed (0.2) -> hold (0.56) -> exit (0.62), never a snap.
    {
      radius: v.camera.settle.radius - ABOUT_CAMERA_PUSH.radiusIn,
      height: v.camera.settle.height,
      lookY: v.camera.settle.lookY,
    },
    { radius: v.camera.hold.radius, height: v.camera.hold.height, lookY: v.camera.hold.lookY, duration: 0.28 },
    0.28
  )
  tl.fromTo(
    target,
    { lookX: v.lookX.push },
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
  //    then dissolves ONLY in the hand-over window (0.74 -> 0.94): the copy has
  //    receded, the character has walked to his Skills-side position still
  //    inside the frame, and the Skills panel is arriving. The first stage
  //    tween renders immediately so the layer always starts fully present.
  if (stage) {
    if (v.stage.settled < 1) {
      tl.fromTo(stage, { opacity: 1 }, { opacity: v.stage.settled, duration: 0.1, immediateRender: true }, 0.08)
      tl.fromTo(stage, { opacity: v.stage.settled }, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0.74)
    } else {
      tl.fromTo(stage, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: 'power1.in', immediateRender: true }, 0.74)
    }
  }

  // Pad the timeline to a total duration of exactly 1.0 so scroll progress maps
  // 1:1 onto the phase fractions documented above (0.30 / 0.38 / 0.54 / 0.84…).
  tl.to({ aboutEnd: 0 }, { aboutEnd: 1, duration: 0.0001 }, 1)

  return tl
}

export default createAboutTimeline