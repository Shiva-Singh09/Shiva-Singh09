/*
 * App — root layout. Complete portfolio flow:
 *   Hero → About → Skills → Projects → Journey → Contact → Feedback → Footer
 * Every section renders immediately (readable with/without 3D or motion);
 * heavy 3D scenes lazy-mount on approach inside their own components.
 */
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar/Navbar.jsx'
import Hero from './components/Hero/Hero.jsx'
import About from './components/About/About.jsx'
import Skills from './components/Skills/Skills.jsx'
import Projects from './components/Projects/Projects.jsx'
import Journey from './components/Journey/Journey.jsx'
import Contact from './components/Contact/Contact.jsx'
import Feedback from './components/Feedback/Feedback.jsx'
import Footer from './components/Footer/Footer.jsx'
import Loading from './components/Loading/Loading.jsx'

function App() {
    // Gate the experience behind font readiness so the cinematic intro never
  // flashes unstyled. Falls back to immediate-ready if fonts API is absent.
  // A hard timeout guarantees the app can never hang (e.g. offline / fonts
  // that never settle) — the content must always be available.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let timer
    const onReady = () => setReady(true)
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(onReady, onReady)
      timer = setTimeout(onReady, 3000)
    } else {
      onReady()
    }
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Loading ready={ready} />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <Contact />
      </main>
      <Feedback />
      <Footer />
    </>
  )
}

export default App
