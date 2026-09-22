# Shiva Singh — Portfolio

A cinematic personal portfolio for **Shiva Singh**, Full-Stack Developer & AI Engineer.

> Phase 1 foundation. The 3D character, walking animation, camera orbit,
> Cyber-Box, project wireframes, rope interaction, audio and heavy scroll
> choreography are intentionally deferred to later phases. See
> [DESIGN.md](./DESIGN.md) for the locked visual direction.

## Tech stack

- React 19 + Vite 8
- Three.js + `@react-three/fiber` + `@react-three/drei` (declared; wired in Phase 2)
- GSAP (declared; used for cinematic orchestration in later phases)
- CSS variables + co-located component styles

## Development

```bash
npm install        # install dependencies
npm run dev        # localhost:5173
npm run build      # production build
npm run preview    # preview the production build locally
```

## Structure

```text
portfolio/
├── public/        (models/ audio/ textures/ logos/ — reserved for Phase 2 assets)
├── src/
│   ├── components/  Navbar, Hero, About, Skills, Projects, Journey, Contact, Feedback, Loading
│   ├── scenes/      HeroScene/SkillsScene/ProjectsScene/ContactScene + shared/SceneMount
│   ├── data/        navLinks, skills, projects, journey, contact
│   ├── hooks/       useSceneDirector, useReducedMotion, useWebGLSupport
│   ├── state/       SceneDirectorContext (React Context — no Zustand)
│   ├── styles/      tokens.css, base.css, utilities.css, index.css
│   ├── App.jsx
│   └── main.jsx
├── DESIGN.md
├── package.json
├── vite.config.js
└── README.md
```

## Section flow

Identity → Story → Skills → Projects → Journey → Contact → Feedback

## Theme

**Cinematic Dark × Futuristic Professional.** See `DESIGN.md`.
