/*
 * scene-probe.mjs — headless verification of the Hero → About → Skills shot.
 *
 * Drives a real Chrome/Edge via CDP against the built preview, scrolls the
 * page exactly through the About timeline's own progress grid and records,
 * for every step:
 *   - the app's runtime snapshot (window.__heroSceneProbe, see
 *     src/scenes/HeroScene/HeroSceneProbe.jsx): camera pos/target, character
 *     world transform + world bounding box, its NDC footprint (is he inside
 *     the frame?), canvas size, stage-layer computed opacity/visibility
 *   - a PNG screenshot, so the result can be confirmed by eye too
 *   - console errors / failed requests (model, chunk)
 *
 * Usage (from portfolio/):
 *   npm run build
 *   npx vite preview --port 4173
 *   node scripts/scene-probe.mjs
 */
import cp from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'

const BASE = process.env.PROBE_URL || 'http://127.0.0.1:4173/'
const URL = `${BASE}${BASE.includes('?') ? '&' : '?'}sceneDebug=1`
const OUT = path.resolve('.probe')
const PORT = Number(process.env.PROBE_PORT || 9222)
const W = Number(process.env.PROBE_W || 1440)
const H = Number(process.env.PROBE_H || 900)
const TAG = process.env.PROBE_TAG || `${W}x${H}`

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
const chromePath = chromeCandidates.find((p) => p && fs.existsSync(p))
if (!chromePath) throw new Error('No Chrome/Edge binary found — set CHROME_PATH')

fs.mkdirSync(OUT, { recursive: true })

const chrome = cp.spawn(
  chromePath,
  [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    `--window-size=${W},${H}`,
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--enable-unsafe-swiftshader',
    `--user-data-dir=${path.join(os.tmpdir(), `scene-probe-${Date.now()}`)}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Chrome spawns a process tree; killing only the launcher leaves renderers (and
// the CDP port) alive, which then poisons the next run. Kill the whole tree.
const killChrome = () => {
  try {
    if (process.platform === 'win32') cp.execSync(`taskkill /PID ${chrome.pid} /T /F`, { stdio: 'ignore' })
    else chrome.kill('SIGKILL')
  } catch {
    /* already gone */
  }
}

const getJson = (url) =>
  new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = ''
      res.on('data', (c) => (d += c))
      res.on('end', () => {
        try {
          resolve(JSON.parse(d))
        } catch (err) {
          reject(err)
        }
      })
    }).on('error', reject)
  })

async function main() {
  // Wait for the debugger endpoint, then attach to the page target.
  let target = null
  for (let i = 0; i < 40 && !target; i += 1) {
    try {
      const list = await getJson(`http://127.0.0.1:${PORT}/json/list`)
      target = list.find((t) => t.type === 'page')
    } catch {
      /* not up yet */
    }
    if (!target) await sleep(250)
  }
  if (!target) throw new Error('CDP endpoint never came up')

  const ws = new WebSocket(target.webSocketDebuggerUrl)
  const pending = new Map()
  let nextId = 1
  const problems = []
  ws.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`))
      else resolve(msg.result)
      return
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails
      const frames = (d.stackTrace?.callFrames ?? [])
        .slice(0, 8)
        .map((f) => `      at ${f.functionName || '<anon>'} (${f.url}:${f.lineNumber + 1}:${f.columnNumber})`)
        .join('\n')
      problems.push(`EXCEPTION: ${d.exception?.description ?? d.text}\n${frames}`)
    }
    if (msg.method === 'Runtime.consoleAPICalled' && (msg.params.type === 'error' || msg.params.type === 'warning')) {
      const frames = (msg.params.stackTrace?.callFrames ?? [])
        .slice(0, 8)
        .map((f) => `      at ${f.functionName || '<anon>'} (${f.url}:${f.lineNumber + 1}:${f.columnNumber})`)
        .join('\n')
      problems.push(
        `${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ')}\n${frames}`
      )
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      problems.push(`log: ${msg.params.entry.text} ${msg.params.entry.url ?? ''}`)
    }
  })
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Log.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
  // Optional accessibility pass: PROBE_RM=1 runs the whole shot with
  // prefers-reduced-motion: reduce emulated (set BEFORE navigation so the app
  // boots in that mode). The same grid then proves the reduced-motion path:
  // no walking timeline is created, the stage retires instead of dissolving,
  // and the Skills stage still receives a standing character.
  if (process.env.PROBE_RM) {
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
  }

  const evaluate = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (res.exceptionDetails) throw new Error(`${res.exceptionDetails.text} :: ${expression.slice(0, 120)}`)
    return res.result?.value
  }

  await send('Page.navigate', { url: URL })
  await evaluate('new Promise(r => { window.addEventListener("load", r, { once: true }) })')

  // The Hero intro is time-based (~12.5s at tier high). Wait for the phase
  // handover rather than a fixed sleep, then give the About trigger a frame.
  const phase = await evaluate(`new Promise((resolve) => {
    const t0 = Date.now()
    const tick = () => {
      const p = document.querySelector('#hero')?.getAttribute('data-hero-phase')
      const canvas = document.querySelector('.hero__scene canvas')
      if ((p === 'complete' || p === 'fallback') && canvas) return resolve(p)
      if (Date.now() - t0 > 45000) return resolve('timeout:' + p)
      requestAnimationFrame(tick)
    }
    tick()
  })`)
  console.log(`hero phase: ${phase}`)
  await sleep(600)

  // Disable smooth scrolling (html { scroll-behavior: smooth }) so every probe
  // step is an exact position, then read the About range from the DOM.
  const range = await evaluate(`(() => {
    document.documentElement.style.scrollBehavior = 'auto'
    const about = document.querySelector('#about')
    const skills = document.querySelector('#skills')
    const a = about.getBoundingClientRect()
    const s = skills.getBoundingClientRect()
    return {
      vh: window.innerHeight,
      aboutTop: a.top + window.scrollY,
      aboutHeight: a.height,
      skillsTop: s.top + window.scrollY,
      docHeight: document.documentElement.scrollHeight,
      heroCanvas: !!document.querySelector('.hero__scene canvas'),
    }
  })()`)
  console.log('range', range)

  const snapshot = async () =>
    JSON.parse(await evaluate('JSON.stringify(window.__heroSceneProbe ? window.__heroSceneProbe() : {probe:"missing"})'))

  const shot = async (name) => {
    const res = await send('Page.captureScreenshot', { format: 'png' })
    fs.writeFileSync(path.join(OUT, `${TAG}-${name}.png`), Buffer.from(res.data, 'base64'))
  }

  const f = (n, d = 2) => (typeof n === 'number' ? n.toFixed(d) : String(n))

  const report = async (label, progress) => {
    const s = await snapshot()
    if (s.probe === 'missing') {
      console.log(`${label}: PROBE MISSING (window.__heroSceneProbe undefined)`)
      return s
    }
    // Section-scene health: does the Projects step tracking run (its own
    // ScrollTrigger) and is the Skills stage / canvas alive?
    const dom = await evaluate(`(() => {
      const p = document.querySelector('.projects__scene')
      const stageBox = document.querySelector('.skills__scene')
      return {
        projStep: p ? p.getAttribute('data-step') : 'n/a',
        skillsCanvas: !!document.querySelector('.skills__scene canvas'),
        skillsTop: stageBox ? Math.round(stageBox.getBoundingClientRect().top) : null,
      }
    })()`)
    const ch = s.choreo || {}
    const ndc = s.character?.ndc
    console.log(
      [
        label.padEnd(14),
        progress === null ? '     ' : `p=${progress.toFixed(2)}`,
        `scroll=${String(s.scroll.y).padStart(6)}`,
        `x=${f(ch.x, 3)}`,
        `yaw=${f(ch.yaw)}`,
        `rad=${f(ch.radius)}`,
        `lookX=${f(ch.lookX)}`,
        `greet=${f(ch.greet)}`,
        `charC=${s.character.box ? s.character.box.center.map((n) => n.toFixed(2)).join(',') : 'n/a'}`,
        `ndcX=[${ndc ? f(ndc.minX) : '?'},${ndc ? f(ndc.maxX) : '?'}]`,
        `ndcY=[${ndc ? f(ndc.minY) : '?'},${ndc ? f(ndc.maxY) : '?'}]`,
        `onScreen=${ndc ? ndc.onScreen : '?'}`,
        `vis=${s.character.visible}`,
        `stage=${s.stage.opacity}/${s.stage.visibility}${s.stage.dormant ? '/DORMANT' : ''}`,
        `projStep=${dom.projStep}`,
        `skillsCanvas=${dom.skillsCanvas}`,
        `frame=${s.frame}@${s.t}ms`,
        `ctxLost=${s.contextLost}`,
      ].join(' ')
    )
    return s
  }

  console.log('\n— Hero settled (scroll 0) —')
  await evaluate('window.scrollTo({ top: 0, behavior: "instant" })')
  await sleep(500)
  await report('hero-settled', null)
  await shot('00-hero-settled')

  console.log('\n— About progress grid (0 = About top at viewport bottom, 1 = bottom at top) —')
  const span = range.aboutHeight + range.vh
  const toScroll = (p) => Math.round(range.aboutTop - range.vh + p * span)
  const grid = [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.25, 0.3, 0.35, 0.42, 0.5, 0.58, 0.64, 0.68, 0.72, 0.76, 0.8, 0.84, 0.88, 0.94, 1]
  for (const p of grid) {
    await evaluate(`window.scrollTo({ top: ${toScroll(p)}, behavior: "instant" })`)
    await sleep(700) // scrub 0.6 + damping settles
    await report('about', p)
    if ([0, 0.12, 0.2, 0.3, 0.5, 0.7, 0.8, 0.84, 1].includes(p)) await shot(`about-${String(p).replace('.', '_')}`)
  }

  console.log('\n— Skills (past the About range) —')
  // Step through the panel's own travel so the hand-over can be judged from
  // screenshots too (the panel is in view between ~skillsTop-900 and ~skillsTop+800).
  for (const extra of [150, 400, 700, 1100, 1600]) {
    await evaluate(`window.scrollTo({ top: ${toScroll(1) + extra}, behavior: "instant" })`)
    await sleep(700)
    await report('skills', null)
    await shot(`skills-${extra}`)
  }

  console.log('\n— Reverse scroll back to the Hero —')
  for (const p of [0.84, 0.5, 0.2, 0.08, 0]) {
    await evaluate(`window.scrollTo({ top: ${toScroll(p)}, behavior: "instant" })`)
    await sleep(700)
    await report('reverse', p)
  }
  await shot('60-reverse-back')

  console.log('\n— Console / network problems —')
  const unique = [...new Set(problems)]
  if (!unique.length) console.log('none')
  else unique.slice(0, 12).forEach((p) => console.log('•', p))

  console.log(`\nScreenshots: ${OUT}`)
  ws.close()
}

main()
  .catch((err) => {
    console.error('PROBE FAILED:', err.message)
    process.exitCode = 1
  })
  .finally(() => {
    killChrome()
  })
