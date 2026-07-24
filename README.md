# Xai — Intelligence Workspace

A high-fidelity, single-page interactive product experience that shows how an AI
product turns **raw telemetry into autonomous intelligence** — told through
physics-driven motion, live geometry, and a 3D math-field synthesizer, rather
than marketing copy.

> Concept prototype for a frontend engineering challenge. Not affiliated with
> any real product.

---

## Project Overview

Xai is a one-page marketing/product experience built to demonstrate advanced
front-end animation and interaction engineering. Instead of static hero
imagery and copy, the whole page tells one continuous story — **Ingest →
Analyze → Generate** — using live WebGL particle fields, scroll-driven
timelines, and an interactive "run inference" demo that resolves noisy data
into a readable insight.

The four core sections:

1. **Hero — Data Transformation Field.** A Three.js / React Three Fiber point
   cloud (3,200 particles) morphs from chaotic scatter into an ordered "rope
   grid" that follows the cursor with a trailing wave, then relaxes back to
   chaos when idle. Optional generative **ambient audio** brightens as the
   field organizes.
2. **Interactive Insight Flow.** A **horizontally** scroll-pinned pipeline —
   **Ingest → Analyze → Generate** — driven by **GSAP + ScrollTrigger**
   (`pin` + `containerAnimation`) so each stage's geometry line-draws in as it
   crosses the viewport. Falls back to a clean vertical stack on mobile /
   reduced-motion.
3. **Intelligence Command Workspace.** A working telemetry deck: switchable
   views (spectrogram / payloads / rules), a radial vector radar, a morphing
   waveform, live node selection, and executable rules — all with tactile
   **Web Audio** feedback.
4. **Signature Interaction — Live Inference Field (the "wow" moment).** The
   payoff of the same narrative: a 3D cloud of raw signals you can drag to
   orbit. Press **Run inference** and watch Xai link the points, sweep the
   network, and resolve the noise into behavioural clusters and flagged
   anomalies — ending on a dashboard-style insight readout with a confidence
   score.

Plus a **Footer** (CTA, live system telemetry, navigation matrix, newsletter),
a sticky **glass navbar** with active-section highlighting + mobile sheet, and
a top **scroll-progress** bar.

## Technical Approach

- **Rendering strategy.** WebGL/Canvas scenes are client-only. The R3F hero
  loads through a dynamic `SceneWrapper` (`ssr: false`); GSAP/ScrollTrigger are
  dynamically imported inside effects so the server never touches `window`.
- **Animation stack.** Framer Motion drives UI choreography, `layoutId`
  transitions, and section reveals. GSAP + ScrollTrigger drives the
  horizontal pinned Insight Flow (`containerAnimation`-based line-draws).
  Three.js + React Three Fiber renders the hero field and the Live Inference
  Field.
- **Performance.** Per-frame values (particle buffers, camera angles) live in
  refs — never React state — to keep the render loop off the main React tree
  and avoid unnecessary re-renders.
- **Accessibility.** `prefers-reduced-motion` is respected in shared reveal
  wrappers, and the horizontally-pinned section degrades to a vertical stack
  on mobile / reduced-motion.
- **Audio.** A single shared Web Audio engine (`lib/sound.ts`) replaced three
  duplicated synth implementations, reusing one `AudioContext` across the
  dashboard, signature interaction, and footer.

## Architecture

```
xai-workspace/
├─ app/
│  ├─ layout.tsx          # fonts + real metadata
│  ├─ page.tsx            # composes nav, progress + all sections
│  └─ globals.css         # tokens, .glass / .text-gradient, scroll-margin
├─ components/
│  ├─ layout/             # Navbar, ScrollProgress
│  ├─ 3d/                 # SceneWrapper, DataTransformationCanvas,
│  │                      #   InsightEngineCanvas
│  └─ ui/                 # Container, Badge, Button, SectionHeading,
│                         #   Reveal, Magnetic, Marquee, GlassPanel
├─ sections/              # HeroSection, InsightFlow, DashboardPreview,
│                         #   SignatureInteraction, Footer
└─ lib/
   ├─ constants.ts        # site copy, nav links, section ids, capabilities
   ├─ sound.ts            # single shared Web Audio engine
   ├─ ambientSound.ts     # generative hero ambient music
   └─ utils.ts            # cn() = clsx + tailwind-merge
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Compiler) |
| UI library | React 19, TypeScript |
| 3D / WebGL | Three.js, @react-three/fiber, @react-three/drei |
| Scroll animation | GSAP + ScrollTrigger |
| UI animation | Framer Motion |
| Styling | Tailwind CSS v4 |
| Audio | Web Audio API |
| Icons | lucide-react |
| Utilities | clsx, tailwind-merge |

## Run Locally

Requires **Node 18.18+**.

```bash
git clone <this-repo-url>
cd xai-workspace
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build && npm run start
```

Lint:

```bash
npm run lint
```

Deploy: zero-config on **Vercel**.

## Key Animation & Interaction Decisions

A full walkthrough of these decisions is in the video below. In short:

- **Particles instead of images** in the hero to make the "raw data → order"
  metaphor literal and physically interactive (cursor-following rope grid).
- **GSAP `containerAnimation`** (not native scroll-snap) for the horizontal
  Insight Flow, so the pin and the line-draw timelines stay perfectly in
  sync with vertical scroll input.
- **Refs over state** for anything running every frame (particle positions,
  camera angles) to keep 60fps and avoid React re-render overhead in the
  render loop.
- **A single deferred "Run inference" action** in the signature section
  rather than autoplay, so the payoff feels earned and user-triggered.
- **Reduced-motion and mobile fallbacks** built in from the start rather than
  bolted on, since the whole page depends on motion to tell its story.

## Video Walkthrough

📹 **[Watch the project walkthrough video](https://drive.google.com/PASTE_YOUR_SHARE_LINK_HERE)**

_(Replace the link above with your public Google Drive or YouTube share link.
See `VIDEO_SCRIPT.md` for the full recording script.)_
