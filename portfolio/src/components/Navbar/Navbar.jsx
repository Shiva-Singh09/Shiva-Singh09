/*
 * Navbar — sticky, semantic, fully keyboard accessible.
 *
 * Desktop: brand + right-aligned nav links.
 * Mobile: brand + hamburger; a side panel reveals the same links.
 *
 * Phase 2: the Scene Director gates its reveal — minimal/hidden during the
 * strongest intro beats (heroPhase entering/arrived/closeup/orbit), then
 * revealed after handover. Reduced-motion / no-WebGL reveals immediately.
 * Hiding is visibility + transform only (never display:none) so layout,
 * sticky positioning and keyboard flow are untouched.
 */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { navLinks } from '../../data/navLinks.js'
import { useSceneDirector } from '../../hooks/useSceneDirector.js'
import './Navbar.css'

const HamburgerIcon = () => (
  <svg
    className="navbar__icon"
    width="22"
    height="18"
    viewBox="0 0 22 18"
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M0 1.5h22v2H0zM0 8h22v2H0zM0 14.5h22v2H0z" />
  </svg>
)

const CloseIcon = () => (
  <svg
    className="navbar__icon"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M11.41 10l6.29-6.29-1.42-1.42L10 8.58 3.71 2.29 2.29 3.71 8.58 10l-6.29 6.29 1.42 1.42L10 11.42l6.29 6.29 1.42-1.42z" />
  </svg>
)

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const buttonRef = useRef(null)
  // SceneDirector gates the cinematic reveal; default visible so Phase 1
  // behaviour (always-on) holds until the Hero reports its first phase.
  // Navbar is visible only if explicitly revealed OR hero is complete/fallback.
  const { state } = useSceneDirector()
  const navbarVisible = state?.navbarVisible ?? true

  // Close on Escape / click outside; keep the panel self-contained.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onOutside)
    }
  }, [open])

  // Prevent scroll-backs beneath the mobile panel when it is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <>
      <header className={`navbar${navbarVisible ? ' navbar--visible' : ' navbar--intro'}`}>
        <nav className="navbar__nav container" aria-label="Main navigation">
          <a href="#hero" className="navbar__brand">
            <span className="navbar__name">Shiva Singh</span>
          </a>

          <div className="navbar__desktop">
            <ul className="navbar__list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a className="navbar__link navbar__link--desktop" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <button
            ref={buttonRef}
            type="button"
            className="navbar__toggle"
            aria-controls="navbar-panel"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </nav>
      </header>

      {/* Mobile panel — portaled into <body> so its `position: fixed` is always
          anchored to the viewport. Rendering it as a direct child of <body>
          (rather than inside .navbar) avoids the backdrop-filter on .navbar
          becoming a containing block for fixed descendants — otherwise the
          off-canvas slide would land in the document flow and inflate the
          scroll width, producing horizontal overflow on desktop. */}
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              id="navbar-panel"
              className={`navbar__panel ${open ? 'navbar__panel--open' : ''}`}
              aria-label="Site navigation"
            >
              <ul className="navbar__list navbar__list--mobile">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      className="navbar__link navbar__link--mobile"
                      href={link.href}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
