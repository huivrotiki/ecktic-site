# NEXT SESSION — ECKTIC Site

## Live URL
https://ecktic-site.vercel.app

## Repo
`huivrotiki/ecktic-site` (main)
Local: `/Users/work/ecktic-site/`

## Stack
- Vite + React (Single Page)
- Three.js (imperative, mounted via `useRef` in `App.jsx`)
- Web Audio API (drum synthesis, no audio files)
- Deployed on Vercel (auto-deploy on `git push`)

## Architecture

```
src/
├── main.jsx          — ReactDOM entry
├── App.jsx           — main component: 
│   ├── initDrumScene() via useEffect → returns canvas → appends to #canvas-root
│   ├── Scroll handler: dims 3D scene (opacity 1→0.4, blur 0→4px)
│   ├── IntersectionObserver: section visibility
│   └── <Overlay> renders hero + 4 sections + footer
├── DrumScene.js      — all Three.js + Web Audio code (550 lines)
│   ├── Chassis (black + orange accent)
│   ├── 6×16 pad grid, row labels = ECKTIC track names
│   ├── Screen displays (BPM, STEP, PITCH, VOL)
│   ├── Controls: Play, Clear, Random, Pitch knob, BPM dial, Volume fader
│   ├── Audio cable + interface (3D detail)
│   ├── Sound synthesis: kick, snare, hihat, clap, tom, bass
│   ├── Auto-demo pattern on load
│   ├── OrbitControls (mouse drag to rotate camera)
│   └── Returns { getCanvas, destroy }
├── App.css           — all styles (brutalist, #000/#fff/#FF5722 accent)
```

## What Works
- 3D drum machine renders, auto-demo plays on load
- Click pads → toggle on/off → plays sound
- Pitch knob drag (vertical), BPM dial, Volume fader
- Play/Clear/Random buttons
- Scroll → 4 sections fade in, 3D scene blurs/dims
- OrbitControls (rotate scene freely)
- Responsive layout

## Known Issues / To Do
1. **Audio requires user gesture** — browser policy. First click/tap on the page enables audio. Auto-demo starts after 1s but won't produce sound until user clicks anywhere.
2. **Photo grid** uses CSS placeholders. Real ECKTIC photos should replace these (from Obsidian vault `/Users/work/own video agent/` references).
3. **Contact form** is visual-only. Needs backend or mail service.
4. **No real audio player** for "ON MY OWN" track. Could add SoundCloud/YouTube embed.
5. **DrumScene.js** is imperative Three.js — could be refactored to `@react-three/fiber` components for better React integration.
6. **Vercel auto-deploy** set up. Just `git push` → deploys.

## Brand System
- Black chassis (#1A1A1A), orange accent (#FF5722), white text
- Wordmark: `ƎCKTIƆ` (first and last letters mirrored: `transform:scaleX(-1)`)
- Fonts: Archivo (headlines), Inter (body), Space Mono (technical)
- Track row labels: ON MY OWN, SYSTEM FAILURE, EMPTY TERMINAL, MODULAR DREAMS, GO ON YOUR OWN, PROJECT 042

## Credentials
- GitHub: `huivrotiki` (token via `gh auth token` — unset `GITHUB_TOKEN` env var first)
- Vercel: connected to GitHub repo, auto-deploys
