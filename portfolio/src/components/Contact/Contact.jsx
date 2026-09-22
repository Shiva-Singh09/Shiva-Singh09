/*
 * Contact — "How can you reach Shiva?" Rope stage + semantic links.
 * The 3D interaction is visual only; every contact method is a real
 * accessible link below, usable without WebGL. LinkedIn renders muted
 * because no exact URL is known (never invented).
 */
import { contactMethods } from '../../data/contact.js'
import { useReveal } from '../../hooks/useReveal.js'
import ContactScene from '../../scenes/ContactScene/ContactScene.jsx'
import './Contact.css'

// Minimal inline SVG icons — no icon library dependency.
const icons = {
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 .297C5.373.297 0 5.67 0 12.304c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.043-1.61-4.043-1.61C3.7 19.23 3.333 18.45 3.333 18.45c-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.469-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.288-1.23 3.288-1.23.656 1.653.245 2.873.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.81 5.625-5.94 2.555.39.72.584 1.27.727 1.806.666-1.26 1.45-2.31 2.334-3.05-.834-.66-1.382-1.95-1.382-3.375 0-.39.035-.78.12-1.17.085.035.12.06 1.235 1.91 2.334 3.05 1.45 2.873 2.334 3.176.656-1.653.245-2.873.118-3.176.77-.84 1.235-1.91 1.235-3.22 0-4.61-2.81-5.625-5.94-2.555.39-.72.584-1.27.727-1.806.666-1.26 1.45-2.31 2.334-3.05 0 .06.08.37.08.37"/>
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 12.713.937 10.54l11.063 6.96 11.063-6.96L12 12.713zm0 2L1 9.54v14.12h22V9.54l-11 6.17z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.79a1 1 0 01.94.94c.03 1.35.3 2.67.79 3.88a1 1 0 01-.21 1.11A17.92 17.92 0 014.2 5.21a1 1 0 011.11-.21 15.05 15.05 0 002.2 2.2 1 1 0 01-.21 1.11M5.09 5.66c-.04.3-.09.59-.09.89 0 3.25 2.65 5.9 5.9 5.9.3 0 .59.05.89.09a13.9 13.9 0 01-7.74 3.59 16.9 16.9 0 01-.9-7.74 16.7 16.7 0 01.05-.73z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M.69 12.45c0-5.57 4.47-10 10-10 2.65 0 5.13.99 7.07 2.63l-1.47 1.47a8.5 8.5 0 10-2.6 6.6h1.52a8.46 8.46 0 01-4.49.82 8.5 8.5 0 010-16.9 8.48 8.48 0 017.82 5.04l1.64-1.64A9.96 9.96 0 0010.69 2.45c-5.52 0-10 4.48-10 10 0 2.64.99 5.12 2.63 7.07l1.47-1.47A8.47 8.47 0 01.69 12.45zm9.57 5.27V9.71c0-.35.28-.64.63-.64h1.34c.35 0 .63.29.63.64v7.06c0 .35-.28.63-.63.63h-1.34c-.35 0-.63-.28-.63-.63zm-4.23-9.26a1.06 1.06 0 110 2.12 1.06 1.06 0 010-2.12z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.05-1.85-3.05-1.85 0-2.13 1.45-2.13 2.94v5.68H9.35V9h3.41v1.56h.05c.48-.89 1.65-1.83 3.4-1.83 3.65 0 4.33 2.41 4.33 5.53v6.2zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
}

export default function Contact() {
  const headRef = useReveal()
  const listRef = useReveal()
  return (
    <section id="contact" className="contact section" aria-labelledby="contact-title">
      <div className="container">
        <header ref={headRef} className="section-header reveal">
          <span className="section-number" aria-label="Section 05 of 5">
            05 / CONTACT
          </span>
          <h2 id="contact-title" className="section-title">
            <span className="section-title__number">05</span> / Contact
          </h2>
        </header>

        <ContactScene />

        <ul ref={listRef} className="contact__list reveal">
          {contactMethods.map((method) => (
            <li key={method.label} className="contact__item">
              {method.href ? (
                <a
                  href={method.href}
                  className="contact__link btn"
                  target={method.href.startsWith('https') ? '_blank' : undefined}
                  rel={method.href.startsWith('https') ? 'noopener noreferrer' : undefined}
                >
                  <span className="contact__icon" aria-hidden="true">
                    {icons[method.icon]}
                  </span>
                  <span className="contact__label">{method.label}</span>
                  <span className="contact__value">{method.value}</span>
                </a>
              ) : (
                <span className="contact__link contact__link--pending btn" aria-disabled="true">
                  <span className="contact__icon" aria-hidden="true">
                    {icons[method.icon]}
                  </span>
                  <span className="contact__label">{method.label}</span>
                  <span className="contact__value">{method.value}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
