/* Footer — © 2026 Shiva Singh + real links only. */
import { contactInfo } from '../../data/contact.js'
import './Footer.css'

export default function Footer() {
  const links = [
    { label: 'GitHub', href: contactInfo.github.href },
    { label: 'Email', href: contactInfo.email.href },
    { label: 'WhatsApp', href: contactInfo.whatsapp.href },
  ].filter((l) => Boolean(l.href))

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__copy">© 2026 Shiva Singh</p>
        <p className="footer__role">Full-Stack Developer | AI Engineer</p>
        <nav className="footer__nav" aria-label="Footer">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="footer__link"
              target={link.href.startsWith('https') ? '_blank' : undefined}
              rel={link.href.startsWith('https') ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
