/* About greeting (Namaste) — pose + camera-push tables.
 *
 * No folded-hands clip exists in the GLB (Idle/Walk/Jump/Wave only — verified
 * from the binary), so the pose is an additive bone overlay applied inside
 * HeroCharacter's own frame loop: the smallest compatible solution on the
 * existing rig. Right-arm local quats were solved offline against the bind
 * translations (palms meet near the chest centre-line, fingers up, elbows
 * down/out); the left arm mirrors the right (negate Y/Z of each local quat —
 * the bind chain is X-mirrored). A slight spine bow completes the respectful
 * reading. The overlay follows the shared choreography's `greet` channel
 * (0 → 1 → hold → release), which the About timeline writes — Hero never sets
 * it, so Hero behavior is untouched, and scroll stays the source of truth
 * (fully reversible). Reduced motion never raises the channel: no gesture.
 * Right-side targets (QUATS_JSON): UA [-0.2282,0.2996,0.3713,0.8487]
 * LA [-0.3255,0.1946,0.1099,0.9188] H [-0.5494,-0.239,0.5064,0.6201]
 */
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
  // Greeting window inside the About progress range: the gesture completes as
  // the camera settles, holds through the beat reveals, releases pre-exit.
  at: 0.06,
  settle: 0.2,
  holdUntil: 0.56,
  releaseAt: 0.6,
}

// ── Intro camera push (approach → below-waist hold) ────────────────────────
export const ABOUT_CAMERA_PUSH = {
  // Extra radius pull-in (metres) during the intro greeting window — on top
  // of the settle framing, toward a below-waist / upper-leg framing of the
  // ~1.9 m character without cropping face/body awkwardly. Same push on all
  // viewport classes; the base framing already differs per class.
  radiusIn: 1.1,
  // The push window mirrors the greeting window: complete as the hands meet.
  at: 0.06,
  settleAt: 0.2,
  releaseAt: 0.6,
}
