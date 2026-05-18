import { useEffect, useRef, useState } from 'react'
import { initDrumScene } from './DrumScene.js'
import './App.css'

function Overlay({ loading, error }) {
  return (
    <>
      <div id="hero">
        <div className="wordmark">
          <span className="mirror">E</span>CKTI<span className="mirror">C</span>
        </div>
        <div className="meta">
          <span>V1.0 // MASTER</span>
          <span>CLASSIFIED</span>
          <span>BERLIN 2026</span>
        </div>
        <div className="tagline">The only winning move is not to play</div>
        <div className="scroll-hint">▼ SCROLL ▼</div>
      </div>

      {loading && <div className="status">LOADING 3D ENGINE...</div>}
      {error && <div className="status" style={{color:'#cc3333'}}>3D OFFLINE: {error}</div>}

      <div id="content">
        <section className="section" data-i="0">
          <span className="s-label">01 // Identity</span>
          <h2>ECKTIC</h2>
          <p className="body">A project operating at the intersection of electronic music, visual art, and psychological performance. Darkwave from Berlin. Modular synth culture. Brutalist aesthetics.</p>
          <dl className="grid">
            <dt>Project</dt><dd>042 // CLASSIFIED</dd>
            <dt>Track</dt><dd>ON MY OWN</dd>
            <dt>Year</dt><dd>2026</dd>
            <dt>Origin</dt><dd>Berlin, DE</dd>
            <dt>System</dt><dd>TouchDesigner / Analog Synth / Point Cloud</dd>
            <dt>Status</dt><dd>OPERATIONAL</dd>
          </dl>
        </section>

        <section className="section" data-i="1">
          <span className="s-label">02 // Protocol</span>
          <h2>TERMINAL<br/>MANIFESTO</h2>
          <div className="terminal">
[SYS] &gt; You have to break the pattern today...<br/>
[SYS] &gt; ...or the cycle will repeat tomorrow.<br/>
[SYS] &gt;<br/>
[SYS] &gt; Operator intervention required.<br/>
[SYS] &gt; The system is locked. The cables are patched.<br/>
[SYS] &gt; Every route leads back to the same node.<br/>
[SYS] &gt;<br/>
[SYS] &gt; Override available: [Y/N] ?
          </div>
          <div className="divider">◆ ◇ ◆</div>
          <div className="terminal manifesto">
A STRANGE GAME.<br/>
THE ONLY WINNING MOVE<br/>
IS NOT TO PLAY.<span className="cursor">_</span>
          </div>
        </section>

        <section className="section" data-i="2">
          <span className="s-label">03 // Visual Field</span>
          <h2>MONOCHROME<br/>FIELD NOTES</h2>
          <div className="photos">
            {[
              ['▣','BETON / NIGHT','est. 03 // 2026'],
              ['◈','WINTER FOREST','est. 07 // 2026'],
              ['◉','MODULAR RIG','est. 12 // 2025'],
              ['⎔','FLYOVER / BRUTALISM','est. 02 // 2026'],
              ['⊞','CRT / TERMINAL','est. 05 // 2026'],
              ['⌗','POINT CLOUD','est. 06 // 2026'],
            ].map(([icon,label,sub],i) => (
              <div className="photo" key={i}>
                <span className="icon">{icon}</span>
                <span className="lbl">{label}</span>
                <span className="sub">{sub}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section" data-i="3">
          <span className="s-label">04 // Connect</span>
          <h2>OPERATOR<br/>OFFLINE</h2>
          <div className="terminal" style={{marginBottom:'1.5rem'}}>
&gt; THE ONLY WINNING MOVE IS NOT TO PLAY.<br/>
&gt; [OPERATOR OFFLINE]<br/>
&gt; <span className="cursor">_</span>
          </div>
          <div className="form">
            {['your_name','your_signal','message'].map(f => (
              <div className="field" key={f}>
                <span className="prompt">&gt;</span> {f}: <input type="text" placeholder="type here..." />
              </div>
            ))}
            <button>TRANSMIT &gt;&gt;</button>
          </div>
        </section>
      </div>

      <footer className="footer">∃CKTIƆ 2026 // PROJECT 042 // CLASSIFIED</footer>
    </>
  )
}

export default function App() {
  const canvasRef = useRef(null)
  const canvasWrap = useRef(null)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState(null)
  const cleanupRef = useRef(null)

  useEffect(() => {
    let stopped = false
    setReady(false)
    setErr(null)

    async function boot() {
      try {
        const { destroy, getCanvas } = await initDrumScene(canvasRef.current)
        if (stopped) { destroy(); return }
        canvasRef.current.appendChild(getCanvas())
        cleanupRef.current = destroy
        setReady(true)
      } catch (e) {
        if (!stopped) setErr(e.message)
      }
    }
    boot()
    return () => { stopped = true; cleanupRef.current?.() }
  }, [])

  // Scroll: dim 3D scene
  useEffect(() => {
    if (!ready) return
    const wrap = canvasWrap.current
    const hero = document.getElementById('hero')
    let ticking = false

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const sy = window.scrollY
          const ms = document.body.scrollHeight - window.innerHeight
          const p = ms > 0 ? Math.min(sy/ms, 1) : 0
          wrap.style.opacity = 1 - p * 0.6
          wrap.style.filter = `blur(${p*4}px)`
          hero.style.opacity = Math.max(0, 1 - (sy/(window.innerHeight*0.6)))
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Section observer
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.section').forEach(s => obs.observe(s))

    return () => {
      window.removeEventListener('scroll', onScroll)
      obs.disconnect()
    }
  }, [ready])

  return (
    <>
      <div id="canvas-wrap" ref={canvasWrap}>
        <div ref={canvasRef} id="canvas-root"></div>
      </div>
      <Overlay loading={!ready && !err} error={err} />
    </>
  )
}
