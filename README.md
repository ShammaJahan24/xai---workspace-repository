# Xai — Intelligence Workspace

A high-fidelity, single-page interactive product experience that shows how an AI
product turns **raw telemetry into autonomous intelligence** — told through
physics-driven motion, live geometry, and a 3D math-field synthesizer, rather
than marketing copy.

> Concept prototype for a frontend engineering challenge. Not affiliated with
> any real product.

---

## Sections (the four required, one continuous story)

1. **Hero — Data Transformation Field.** A `Three.js` / R3F point cloud (3,200
   particles) morphs from chaotic scatter into an ordered "rope grid" that
   follows the cursor with a trailing wave, then relaxes back to chaos when
   idle. Optional generative **ambient audio** brightens as the field organizes.
2. **Interactive Insight Flow.** A **horizontally** scroll-pinned pipeline —
   **Ingest → Analyze → Generate** — driven by **GSAP + ScrollTrigger**
   (`pin` + `containerAnimation`) so each stage's geometry line-draws in as it
   crosses the viewport. Falls back to a clean vertical stack on mobile /
   reduced-motion.
3. **Intelligence Command Workspace.** A working telemetry deck: switchable
   views (spectrogram / payloads / rules), a radial vector radar, a morphing
   waveform, live node selection, executable rules — all with tactile **Web
   Audio** feedback.
4. **Signature Interaction — Live Inference Field (the WOW).** The payoff of the
   same narrative: a 3D cloud of raw signals you can drag to orbit. Press **Run
   inference** and watch Xai link the points, sweep the network, and resolve the
   noise into behavioural clusters and flagged anomalies — ending on a
   dashboard-style insight readout with a confidence score.

Plus a **Footer** (CTA, live system telemetry, navigation matrix, newsletter),
a sticky **glass navbar** with active-section highlighting + mobile sheet, and a
top **scroll-progress** bar.

## Technical approach

- **Rendering strategy.** WebGL/Canvas scenes are client-only. The R3F hero
  loads through a dynamic `SceneWrapper` (`ssr: false`); GSAP/ScrollTrigger are
  dynamically imported inside effects so the server never touches `window`.
- **Animation stack.** Framer Motion for UI choreography, `layoutId`
  transitions and reveals; **GSAP + ScrollTrigger** for the horizontal
  pinned Insight Flow (`containerAnimation`-driven line-draws); Three.js +
  React Three Fiber for the hero field and the Live Inference Field.
- **Performance.** Per-frame values (particle buffers, camera angles) live in
  refs — never React state — to keep the render loop off the main React tree.
- **Reduced motion** is respected in shared reveal wrappers.

## Architecture & reusable components

The refactor pulled repeated markup and logic into a small, typed component
library so sections stay declarative and DRY:

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
   ├─ sound.ts            # single shared Web Audio engine (was duplicated x3)
   ├─ ambientSound.ts     # generative hero ambient music
   └─ utils.ts            # cn() = clsx + tailwind-merge
```

Key cleanups made during the refactor:

- **Removed 3 copies** of the Web Audio synth (Dashboard, Synthesizer, Footer)
  into one reusable `lib/sound.ts` that reuses a single `AudioContext`.
- **Introduced reusable primitives** (`Button`, `Badge`, `SectionHeading`,
  `Container`, `Reveal`, `Magnetic`, `Marquee`, `GlassPanel`) to replace
  copy-pasted inline markup.
- **Added the missing navigation layer** (navbar + scroll progress) with
  IntersectionObserver-based active-section state.
- **Added GSAP** — required by the brief but previously unused — via the
  horizontal pinned Insight Flow (ScrollTrigger `pin` + `containerAnimation`).
- **Rebuilt the WOW section** so it's the narrative payoff (Live Inference
  Field) instead of an off-theme math plotter.
- Real page metadata; section anchors wired to the nav.

## Tech stack

Next.js 16 (App Router, React Compiler) · React 19 · TypeScript · Three.js +
@react-three/fiber · GSAP + ScrollTrigger · Framer Motion · Tailwind CSS v4 ·
Web Audio API · lucide-react.

## Run locally

Requires **Node 18.18+**.

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build && npm run start
```

Deploy: zero-config on **Vercel**.

## Video walkthrough

_Add a short (2-3 min) Google Drive / YouTube link explaining the key animation
and interaction decisions._
