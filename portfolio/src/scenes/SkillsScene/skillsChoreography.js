/*
 * skillsChoreography — the About → Skills hand-over, expressed as numbers.
 *
 * The Hero stage carries the character through the Hero and About shots and
 * dissolves inside the hand-over window (see aboutChoreography.js). This module
 * gives the Skills stage its own beat of the same story: he walks in beside the
 * Cyber-Box and settles to Idle there — "Walk → Idle at the Cyber-Box".
 *
 * Same conventions as the Hero/About choreography: ONE timeline (created in
 * SkillsExperience, attached to that section's single ScrollTrigger) writes a
 * plain `choreo` object; SceneCharacter / useCharacterController read it per
 * frame and derive Walk ⇄ Idle from REAL travel, so no clip is ever forced or
 * restarted on a scroll frame and scrolling up reverses the walk exactly.
 *
 * The Skills stage (SkillsCanvas) is its own small room: the floor circle sits
 * at y = -0.9, the console hovers around x = 0.9 at z ≈ -1.2, and the camera
 * looks straight down -Z from (0, 1.4, 6.4) with fov 38. The numbers below come
 * from that room, not from taste:
 *   - standing at (x -1.1, z -1.6) puts him front-left of the console, clear of
 *     the console body in 3D (box spans x -0.4…2.2, z -2.0…-0.4) so he can
 *     never intersect or hide it, while the camera's frame bottom at his depth
 *     is y ≈ -1.38 (feet at -0.9 stay inside) on every panel aspect we ship.
 *   - entering from x = -6.0 is off-frame on all of them (panel aspect >= 0.7),
 *     so he walks INTO the stage instead of popping into it.
 */
export const SKILLS_CHARACTER = {
  // Ground contact: the Skills floor mesh (see SkillsExperience).
  floorY: -0.9,
  // Walk-in start (off-frame left) → standing spot beside the console.
  enterX: -6.0,
  standX: -1.1,
  standZ: -1.6,
  // The rig faces +Z: travelling toward +X is yaw +90°; the settled pose turns
  // most of the way back to the viewer so the console reads beside him.
  walkYaw: Math.PI / 2,
  standYaw: 0.35,
  // Timeline positions (absolute, in the section timeline's own time base): he
  // arrives while the capsule drops and opens, then simply STAYS — idle and
  // present beside the console for the rest of the section.
  walkAt: 0,
  walkDuration: 1.8,
  yawAt: 1.7,
  yawDuration: 0.9,
}

export default SKILLS_CHARACTER
