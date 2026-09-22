/*
 * Feedback — honest local form states. No backend yet: values preserved,
 * duplicate submits blocked while sending, note never claims server send.
 * Swap queueLocalFeedback for a real POST later without touching JSX.
 */
import { useRef, useState } from 'react'
import { useReveal } from '../../hooks/useReveal.js'
import './Feedback.css'

const likeOptions = [
  'Design',
  '3D Experience',
  'Projects',
  'Technical Content',
  'Overall Experience',
]

const queueLocalFeedback = (payload) => {
  try {
    const key = 'portfolio-feedback-queue'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    existing.push({ ...payload, queuedAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(existing))
    return true
  } catch {
    return false
  }
}

export default function Feedback() {
  const headRef = useReveal()
  const formRef = useReveal()
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const timer = useRef(null)

  const set = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Please enter your name.'
    if (!values.email.trim()) nextErrors.email = 'Please enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'That email does not look valid.'
    }
    if (!values.message.trim()) nextErrors.message = 'Please write a few words.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setStatus('sending')
    const checked = Array.from(
      e.currentTarget.querySelectorAll('input[name="like"]:checked')
    ).map((el) => el.value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      queueLocalFeedback({ ...values, categories: checked })
      setStatus('queued')
    }, 900)
  }

  return (
    <section id="feedback" className="feedback section" aria-labelledby="feedback-title">
      <div className="container">
        <header ref={headRef} className="feedback__header reveal">
          <h2 id="feedback-title" className="feedback__title font-display">Your feedback matters.</h2>
          <p className="feedback__subtitle">
            I&apos;d love to know what you think about the experience.
          </p>
        </header>

        <form ref={formRef} className="feedback__form reveal" action="#" onSubmit={handleSubmit} noValidate>
          <div className="feedback__field">
            <label htmlFor="feedback-name">Name</label>
            <input
              id="feedback-name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              required
              value={values.name}
              onChange={set('name')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'feedback-name-error' : undefined}
            />
            {errors.name && (
              <span id="feedback-name-error" className="feedback__error" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className="feedback__field">
            <label htmlFor="feedback-email">Email</label>
            <input
              id="feedback-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              value={values.email}
              onChange={set('email')}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'feedback-email-error' : undefined}
            />
            {errors.email && (
              <span id="feedback-email-error" className="feedback__error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="feedback__field">
            <label htmlFor="feedback-message">Feedback</label>
            <textarea
              id="feedback-message"
              name="message"
              placeholder="What's on your mind?"
              rows={5}
              required
              value={values.message}
              onChange={set('message')}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'feedback-message-error' : undefined}
            />
            {errors.message && (
              <span id="feedback-message-error" className="feedback__error" role="alert">
                {errors.message}
              </span>
            )}
          </div>

          <fieldset className="feedback__field">
            <legend>Category (optional)</legend>
            <div className="feedback__options">
              {likeOptions.map((option) => (
                <label key={option} className="feedback__option">
                  <input type="checkbox" name="like" value={option} />
                  <span className="feedback__option-label">{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="btn btn--primary feedback__submit"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending…' : 'Send Feedback'}
          </button>

          {status === 'queued' && (
            <p className="feedback__note" role="status">
              ✓ Thanks for the feedback — saved on this device. This form is
              not yet connected to a backend, so nothing was sent anywhere.
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
