# DESIGN.md

> Permanent visual source of truth for the **Shiva Singh** portfolio.
> Theme: **Cinematic Dark × Futuristic Professional.**

This file locks the visual direction for the whole project. Every decision
about color, typography, spacing, and motion should trace back here.

---

## 1. Overall identity

**Core feeling:** a developer entering his own digital workspace.

The 3D character is the signature visual element, but the portfolio content
must remain **professional and readable** at every moment.

The website must **NOT** feel:

- like a gaming website
- like a crypto website
- like a generic AI portfolio
- like a neon cyberpunk template
- overly colorful
- overly animated
- childish
- cluttered

### Priority order

Identity → Story → Skills → Projects → Journey → Contact → Feedback

---

## 2. Color system

All colors are CSS variables (see `src/styles/tokens.css`) and are **locked**.

| Role               | Variable                   | Value                  |
| ------------------ | ------------------------- | ---------------------- |
| Background         | `--color-bg`              | `#050507`              |
| Secondary surface  | `--color-surface`         | `#0B0B10`              |
| Primary accent     | `--color-accent-primary`  | `#E9307C` (fuchsia)    |
| Secondary accent   | `--color-accent-secondary`| `#7C5CFF` (violet)     |
| Cool highlight     | `--color-accent-cool`     | `#4DA3FF` (blue)       |
| Main text          | `--color-text-primary`    | `#F5F5F7`              |
| Secondary text     | `--color-text-secondary`  | `#A1A1AA`              |
| Borders            | `--color-border`          | `rgba(255,255,255,0.10)` |

**Usage rules:**

- Fuchsia = primary brand accent (CTAs, active nav, section-number accent).
- Violet/blue = controlled atmosphere and 3D lighting only.
- White = primary information.
- Gray = supporting information.

The full page is never turned pink or purple. Accents are restrained and
contextual.

---

## 3. Typography

| Role                        | Font             |
| --------------------------- | ---------------- |
| Display / cinematic headings| **DM Serif Display** |
| Body / UI / navigation      | **Manrope**      |

**Hierarchy (restrained, no giant headings everywhere):**

- Hero identity + display titles use `DM Serif Display`, weight 500–700.
- Section numbers, nav, body copy, form labels use `Manrope`, weight 300–600.
- Fluid sizing via `clamp()` keeps hierarchy intact on every viewport.

Do **not** use generic system typography as the final design, excessive font
weights, or giant headings everywhere. The serif display font is reserved for
major cinematic headings and identity moments.

---

## 4. Global design principles

- dark cinematic background
- spacious layout
- strong hierarchy
- restrained borders
- subtle atmospheric gradients
- controlled fuchsia highlights
- clean navigation
- readable body text
- smooth section transitions (added in a later phase)
- **no** excessive cards
- **no** unnecessary glowing elements
- **no** fake statistics
- **no** fake proficiency percentages
- **no** fake experience

---

## 5. Application structure (Phase 1)

```text
00 / CINEMATIC INTRO     (Hero)
01 / ABOUT ME
02 / SKILLS
03 / PROJECTS
04 / MY JOURNEY
05 / CONTACT
FEEDBACK
```

For Phase 1 these are clean, semantic, **structural placeholders** that already
have: semantic HTML, proper IDs, responsive layout, correct typography,
spacing, section numbering, and visual hierarchy. No final 3D scenes yet.

---

## 6. Section details (Phase 1 content)

### Hero (00 / CINEMATIC INTRO)

Future final sequence: dark environment → character enters from left → walks
to centre → close-up → 360° camera orbit → identity → CTA → navbar reveal.

Phase 1 fallback always displays:

```text
Shiva Singh

Full-Stack Developer | AI Engineer

[ View Projects ]  [ Download Resume ]
```

- CTA "View Projects" → `#projects`.
- CTA "Download Resume" → `/resume.pdf` (no fake resume file is created).
- A `HeroScene` mount surface is reserved for the future R3F canvas; it is
  empty today and never breaks the fallback.

### Navbar

- **Desktop:** `Shiva Singh` … `About` `Projects` `Skills` `Journey` `Contact`
  (order is intentional — navbar order ≠ section order).
- **Mobile:** `Shiva Singh` … `☰` (hamburger opens a side panel).
- Sticky, semantic `<nav>`, keyboard accessible, visible `:focus-visible`,
  mobile-friendly.
- Always visible in Phase 1. Later the **Scene Director** controls when it
  appears (e.g. after the Hero character reaches centre).

### About (01 / ABOUT ME)

> Hi, I'm Shiva Singh.
> Full-Stack Developer & AI Engineer

Short factual intro: B.Tech CSE-AI, full-stack development, backend/system
design, AI/ML integration, building practical software products. No invented
achievements.

### Skills (02 / SKILLS)

Content only — categorical list, no ratings/percentages. The future
**Cyber-Box** scene mounts here in Phase 2.

- FRONTEND: React, Next.js, JavaScript, HTML, CSS
- BACKEND: Node.js, Express.js, FastAPI, ASP.NET
- DATABASE: MongoDB, PostgreSQL, Supabase, SQL Server
- AI / ML: Python, Machine Learning, Generative AI, Computer Vision, PyTorch
- TOOLS: Git, GitHub, VS Code, Vercel

### Projects (03 / PROJECTS)

Data-driven from `src/data/projects.js` (never hard-coded in JSX).
Five real projects:

1. LANDLOGY
2. ShilpSaathi
3. SMM Panel
4. TeaTalks
5. Campus Complaint Management System

Links are only rendered when the exact URL is known; nothing is invented.

### Journey (04 / MY JOURNEY)

Factual milestones as a timeline (NOT labelled "Experience"):

- 2021 — 10th — 86%
- 2024 — Diploma IT — 78%
- 2025 — ML Training — NIELIT Lucknow
- 2025 — ASP.NET Web Development — Mecatredz Technology, Lucknow
- 2027 — B.Tech CSE-AI — Lucknow University — Expected completion

### Contact (05 / CONTACT)

Semantic methods: Email Me, Call Me, WhatsApp, GitHub, LinkedIn.
Actual links are used only when known; LinkedIn is a placeholder because no
exact URL is known. The future **rope-interaction** ContactScene mounts here
in Phase 2.

### Feedback

Heading: "Your feedback matters." Subtext included. Semantic form:

- Your Name
- Your Email
- Feedback message
- "What did you like?" — Design, 3D Experience, Projects, Technical Content,
  Overall Experience
- Send Feedback

No backend submission yet. No fake success response.

---

## 7. Scene Director architecture

A lightweight orchestration layer so the cinematic scenes never fight over a
shared resource (camera, character, lighting, environment, sound).

**Stack:** plain React Context + a consumer hook — **no Zustand**, no extra
state library. The state surface is intentionally tiny.

Location: `src/state/SceneDirectorContext.jsx` + `src/hooks/useSceneDirector.js`.

Represented state (Phase 1 declares the shape + setters only; nothing
orchestrates yet):

| Field              | Values                                                        |
| ------------------ | ------------------------------------------------------------- |
| `currentSection`   | hero \| about \| skills \| projects \| journey \| contact \| feedback |
| `cameraState`      | idle \| intro-orbit \| focused \| ...                         |
| `characterState`   | idle \| entering \| walking \| posing \| orbiting             |
| `lightingState`    | scene-based preset                                            |
| `environmentState` | scene-based preset                                            |
| `soundEnabled`     | boolean                                                       |
| `qualityLevel`     | low \| medium \| high                                          |

### Future flow

```text
Section → Character → Camera → Lighting → Environment → Sound
```

GSAP / ScrollTrigger will eventually drive animation **progress** rather than
every component creating competing scroll animations. Phase 1 only installs the
boundary so components read/write from a single source of truth.

---

## 8. 3D scene architecture

Folders exist as **structural boundaries** for future R3F scenes:

```text
src/scenes/
  HeroScene/          (rendered by Hero — mount surface reserved)
  SkillsScene/        (will host the Cyber-Box)
  ProjectsScene/      (will host project wireframes)
  ContactScene/       (will host the rope interaction)
  shared/SceneMount.jsx  (shared mount surface + capability data)
```

**Do NOT** create fake 3D models, random cubes, placeholder character geometry,
or emoji placeholders. Each scene placeholder renders an empty mount surface
that exposes `data-webgl` and `data-quality` attributes so Phase 2 can degrade
gracefully. The dependencies (`three`, `@react-three/fiber`, `@react-three/drei`)
are declared and installed but **not imported** until scenes are built.

---

## 9. WebGL fallback

The experience must keep working when:

- WebGL is unavailable
- 3D fails to load
- device performance is insufficient
- reduced motion is enabled

Fallbacks prioritise **content**:

```text
Shiva Singh
Full-Stack Developer | AI Engineer
[ View Projects ]  [ Download Resume ]
```

No error page is shown just because 3D cannot load. `src/hooks/useWebGLSupport.js`
feeds a boolean into `SceneMount` so scenes can decide whether to instantiate
the canvas.

---

## 10. Responsive foundation

| Tier                  | Treatment                                      |
| --------------------- | ---------------------------------------------- |
| Large desktop         | Full cinematic experience.                     |
| Desktop / laptop      | Full experience, reduced scene complexity.     |
| Tablet                | Reduced camera movement & particle density.    |
| Mobile                | Simplified 3D, fewer particles, readable type, touch-friendly. |

The mobile version is a complete portfolio, never a broken desktop layout.

---

## 11. Accessibility foundation

- semantic HTML
- keyboard navigation
- visible `:focus-visible` states
- accessible buttons and links
- proper form labels (`<label for>` / `<fieldset>` / `<legend>`)
- readable contrast
- touch targets ≥ ~44px
- `prefers-reduced-motion` honoured (CSS + `useReducedMotion` hook)
- no content depending solely on animation
- no native `alert()` / `confirm()` / `prompt()`

When reduced motion is enabled, the portfolio still communicates the complete
story without cinematic motion.

---

## 12. CSS architecture

```text
src/styles/
  tokens.css     — CSS variables (colors, typography, spacing, radius,
                   transitions, layout widths, z-index layers)
  base.css       — reset, box model, body, focus rings, font inheritance
  utilities.css  — reusable helpers (.container, .section, .btn, etc.)
  index.css      — entry point, global background gradients, imports the above
```

Component styles are co-located with each component (e.g. `Hero/Hero.css`).
Variables are used everywhere; avoid one-off magic values.

---

## 13. Loading foundation

Minimal cinematic gate shown on first paint:

```text
SHIVA SINGH

INITIALIZING EXPERIENCE...
```

Phase 1: no complex loading animations. Fades out once fonts are ready
(`document.fonts.ready`), and instantaneously under
`prefers-reduced-motion`.

---

## 14. Performance architecture

Prepared for lazy loading. Intended future order:

```text
Initial:        Character + Hero
After Hero:     About
Before Skills:  Cyber-Box assets
Before Projects: Project structures
Before Contact: Rope/contact assets
```

No lazy loading is wired yet (no real assets). The chunk boundary for the 3D
stack is pre-declared in `vite.config.js` (`three` / `@react-three/fiber` /
`@react-three/drei` manual chunk).

---

## 15. Things explicitly NOT built in Phase 1

3D character, GLB model, walking animation, 360° camera, rigging, Cyber-Box,
holographic skill panels, project wireframes, scanning beam, rope physics,
audio, voice-over, background music, particles system, volumetric fog, advanced
post-processing, complex scroll choreography, fake screenshots, fake
statistics, fake GitHub graph, fake API responses, fake backend, feedback
backend, random placeholder images.

### Removed concepts (do NOT implement)

- tech icons orbiting the Hero character
- icons collapsing into the character
- terminal command literals such as `$ ./skills --reveal`
- character typing a terminal command
- Matrix sunglasses Easter egg
- GitHub contribution graph in Journey
- floating API strings such as `GET /api/projects → 200`

---

## 16. Data integrity

Only factual content is used. Never create fake job experience, client names,
metrics, revenue, skill percentages, project achievements, or testimonials.
Where a URL is not known, the data is left configurable (null) rather than
invented.
