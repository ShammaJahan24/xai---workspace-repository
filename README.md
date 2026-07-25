# XAI — Intelligence Workspace

A single-page, high-fidelity product experience for a fictional **interaction
prototyping tool**. The page argues its own thesis: *if a product is about
motion, the marketing site should be the demo.* So instead of screenshots and
copy, every section is a working instrument — a WebGL field you shape with your
cursor, a scroll-driven pipeline, a live dashboard, and an easing-curve editor
that plays your timing back on a real transition.

> Concept prototype built for a frontend engineering challenge. Not affiliated
> with any real product.

Live site link: (https://xai-workspace-repository.vercel.app/#flow)**
Youtube video link : (https://drive.google.com/PASTE_YOUR_SHARE_LINK_HERE)**
Figma :(https://www.figma.com/design/059umChDQqMCWEMVk7R8Fk/Untitled?node-id=0-1&t=XAijZACLSjsX2xcc-1)**


---

## Project Overview

The product being pitched is **XAI**, a tool that turns static design frames
into living prototypes. The page tells that product's story in four beats, in
the same order a user would experience the tool itself:

```
  HERO              INSIGHT FLOW               WORKSPACE              MOTION LAB
  "raw → ordered"   Import → Compose →         The tool, running      Tune the timing
  3D particle       Preview & share            5 live dashboard       and feel it play
  field, cursor-    horizontally pinned,       views, ⌘K palette,     back on a real
  driven            scroll-scrubbed            audio feedback         transition
       │                    │                        │                     │
       └────────────────────┴────── one continuous narrative ──────────────┘
```

### 1. Hero — Data Transformation Field

A Three.js / React Three Fiber point cloud of **3,200 particles** starts as
chaotic scatter and morphs into an ordered 8×8 "rope grid" that runs into depth.
The grid follows your cursor with a **trailing wave** (a 100-frame mouse-history
buffer, so the ripple lags the pointer like fabric), then relaxes back into
chaos when you stop moving. Optional **generative ambient audio** (four
major/minor-7th chord voicings, muted by default) brightens as the field
organises.

*Why:* the whole product is "unstructured input → intentional output". A
particle field makes that metaphor literal and, more importantly, *physical* —
you can push it around.

### 2. Insight Flow — the horizontally pinned pipeline

**Import → Compose → Preview & share**, laid out on a horizontal track that is
pinned to the viewport and scrubbed by vertical scroll via **GSAP
ScrollTrigger**. Each stage carries an SVG diagram whose paths **line-draw**
themselves as the panel crosses the viewport, driven by ScrollTrigger's
`containerAnimation` so the drawing stays locked to the horizontal motion rather
than to page scroll. A progress rail and stage counter track position.

Below 768px and under `prefers-reduced-motion`, `gsap.matchMedia()` never
installs the pin — the section degrades to a clean vertical stack with the SVG
paths fully drawn.

### 3. Intelligence Command Workspace

A dashboard that actually works, not a screenshot. Five switchable views —
**Overview, Prototypes, Components, Flows, Handoff** — sharing a persistent
shell:

- **Overview** — `Today / 7d / 30d` range switch that re-animates an SVG area
  chart, four KPI cards with counting-up values and sparklines, an interaction-
  type donut, and a live-appending activity feed.
- **Prototypes** — searchable table with an `AnimatePresence` detail panel that
  crossfades on selection, and `layout`-animated rows as the filter narrows.
- **Components / Flows / Handoff** — async action states, preference toggles,
  and export targets.
- **⌘K command palette** — fuzzy filter, keyboard navigation, jumps between
  views.

Every discrete action fires a short **Web Audio** blip (distinct envelopes for
tab, click, toggle, hover, trigger) for tactile feedback.

### 4. Motion Lab — the signature interaction

The payoff, and the most opinionated part of the page: a **cubic-Bézier easing
editor** wired to a live playback stage.

- Drag the two control handles on the 300×300 curve canvas. Handles travel
  **outside** the 0–1 box (y from −0.5 to 1.5) so you can author overshoot and
  elastic curves, not just the safe ones.
- The curve is evaluated by a hand-rolled Bézier solver (Newton–Raphson,
  8 iterations) so the preview uses *your exact* easing, not an approximation.
- Watch it play in three modes: **3D Stage** (depth-layered cards on a
  cursor-tilted stage), **UI Card** (a realistic component transition), and
  **Motion Rail** (a marker plus 16 ghost samples of the curve — the timing
  made visible as spacing).
- **Scrub** the timeline by hand to inspect any single frame, adjust duration,
  snap to seven presets, and **copy the `cubic-bezier(...)` value** to your
  clipboard.

*Why:* it closes the loop. The hero claims motion is the product; this section
hands the visitor the actual control surface and lets them prove it.

### Plus

A sticky glass **navbar** with `IntersectionObserver`-driven active-section
highlighting and a `layoutId` pill that slides between links, a **light/dark
theme toggle** that crossfades two full-page gradient backdrops, a spring-
smoothed **scroll-progress** bar, and a **footer** with magnetic-hover CTA,
newsletter state, and a navigation matrix.

## Technical Approach

**Rendering strategy.** Everything WebGL or Canvas is client-only. The R3F hero
mounts through `SceneWrapper`, which `dynamic()`-imports the `<Canvas>` with
`ssr: false`. GSAP and ScrollTrigger are `await import()`-ed *inside* the effect
that uses them, so the server bundle never touches `window` and the animation
code stays out of the initial payload.

**Animation stack — three tools, three jobs.** They are not interchangeable, so
each is used where it wins:

| Tool | Used for | Why not the others |
|---|---|---|
| **Framer Motion** | UI choreography, `layoutId` sliding pills (nav, console tabs, range switch), `AnimatePresence` enter/exit, spring-smoothed scroll progress | Declarative and React-native; `layoutId` alone would take a lot of manual FLIP work in GSAP |
| **GSAP + ScrollTrigger** | The pinned horizontal section, scroll-scrubbed timelines, SVG line-draws | `pin` + `containerAnimation` has no equivalent in Framer Motion |
| **Three.js / R3F** | The hero particle field | Thousands of points per frame need the GPU |

**Performance.** Anything that changes every frame — particle position and
velocity buffers, camera angles, morph progress, mouse history — lives in a
`useRef`, never in React state. The render loop mutates typed arrays in place
and flags `needsUpdate`; React re-renders only on real interaction (view
switches, preset changes). The particle sprite is a radial-gradient texture
drawn once to an offscreen canvas and reused.

**Theming.** `@custom-variant dark` in `globals.css` rebinds Tailwind's `dark:`
prefix to a `data-theme="dark"` attribute on `<html>` instead of the
`prefers-color-scheme` media query. That means every existing `dark:` utility
keeps working *and* responds instantly to the manual toggle. Initial theme reads
`localStorage` → OS preference → dark, applied after mount to avoid a hydration
mismatch. A `.glass-surface` helper resolves the right frosted recipe per theme
so components no longer choose between light and dark variants themselves.

**Accessibility.** `prefers-reduced-motion` is honoured globally in
`globals.css` (animations and transitions collapse to ~0ms, smooth scrolling
off) *and* structurally — the pinned section is never installed under reduced
motion, since a scroll-hijacked pin can't be meaningfully "sped up". Audio is
opt-in and muted by default. Sections carry `scroll-margin-top` so anchor jumps
clear the sticky navbar.

**Audio.** One shared `AudioContext` in `lib/sound.ts` with a named envelope per
UI sound, replacing three duplicated synths that each leaked their own context.
`lib/ambientSound.ts` holds the separate generative hero pad.

## Architecture

```
xai-workspace/
├─ app/
│  ├─ layout.tsx        # Geist fonts, metadata, Open Graph
│  ├─ page.tsx          # composes ThemeProvider → progress → nav → 4 sections → footer
│  └─ globals.css       # tokens, dark custom-variant, .glass-surface, reduced-motion
├─ components/
│  ├─ theme/
│  │  └─ ThemeProvider.tsx        # data-theme + crossfading gradient backdrops
│  ├─ layout/
│  │  ├─ Navbar.tsx               # glass nav, IntersectionObserver, layoutId pill, theme toggle
│  │  ├─ ScrollProgress.tsx       # spring-smoothed top bar
│  │  └─ Footer.tsx               # CTA, newsletter, nav matrix, audio feedback
│  ├─ 3d/
│  │  ├─ SceneWrapper.tsx         # dynamic <Canvas>, ssr: false
│  │  └─ DataTransformationCanvas.tsx  # 3,200-point hero field
│  └─ ui/                         # Container, SectionHeading, Badge, CountUp, Magnetic, …
├─ sections/
│  ├─ HeroSection.tsx             # 1 · particle field + headline + ambient toggle
│  ├─ InsightFlow.tsx             # 2 · GSAP pinned horizontal pipeline
│  ├─ DashboardPreview.tsx        # 3 · 5-view workspace, charts, ⌘K palette
│  └─ SignatureInteraction.tsx    # 4 · Motion Lab easing editor
└─ lib/
   ├─ constants.ts                # site copy, nav links, section ids
   ├─ sound.ts                    # single shared Web Audio engine
   ├─ ambientSound.ts             # generative hero ambient pad
   └─ utils.ts                    # cn() = clsx + tailwind-merge
```

Path alias `@/*` maps to the project root (`tsconfig.json`).

<details>
<summary>Legacy files still in the tree</summary>

`sections/Capabilities.tsx`, `components/ui/InteractiveInsightFlow.tsx` and
`components/3d/InsightEngineCanvas.tsx` are no longer imported. The first two
are `export {}` no-ops, kept because the authoring environment could not delete
files; the third is an earlier instanced-mesh clustering scene, superseded when
section 4 became the Motion Lab. Safe to delete.
</details>

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, React Compiler via `babel-plugin-react-compiler`) |
| UI | React 19.2, TypeScript 5 (strict) |
| 3D / WebGL | Three.js 0.185, @react-three/fiber 9, @react-three/drei 10 |
| Scroll animation | GSAP 3.15 + ScrollTrigger |
| UI animation | Framer Motion 12 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`, CSS-first config) |
| Audio | Web Audio API (no dependency) |
| Icons | lucide-react |
| Utilities | clsx, tailwind-merge |
| Lint | ESLint 9 + eslint-config-next (flat config) |

## Run Locally

Requires **Node.js 20.9+** (Next.js 16 minimum) and npm.

```bash
git clone <this-repo-url>
cd xai-workspace
npm install
npm run dev
```

Open **http://localhost:3000**.

Production build and serve:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

Deploys zero-config on **Vercel**. No environment variables, API keys or
backend — all data in the workspace section is local fixtures in
`sections/DashboardPreview.tsx`.

### Getting the full experience

The page is built around input, so a few things only show up if you go looking:

1. **Move your cursor across the hero** — the field organises and a wave trails
   the pointer. Stop, and it decays back to chaos.
2. **Unmute "Ambient sound"** in the hero badge (browsers require a gesture
   before audio can start).
3. **Scroll slowly through Insight Flow on a ≥768px viewport** — the section
   pins and scrolls sideways. On mobile it is intentionally a vertical stack.
4. **Press ⌘K / Ctrl+K** in the workspace section.
5. **In the Motion Lab, drag a control handle up past the top of the box** to
   author an overshoot, then scrub the timeline slider to step through frames.
6. **Toggle the theme** in the navbar to watch the backdrop crossfade.
7. **Turn on OS "Reduce motion"** and reload to see the fallback paths.

## Key Animation & Interaction Decisions

The video walks through these on screen. In short:

- **Particles, not imagery, in the hero.** The product's premise is
  unstructured → intentional. A field you can physically disturb states that in
  one gesture; a hero image would only assert it. The trailing 100-frame mouse
  history is the detail that sells it — the grid behaves like fabric, not a
  cursor follower.
- **GSAP `containerAnimation` rather than CSS scroll-snap** for the horizontal
  pipeline. Snap can move a track sideways, but it can't keep independent
  line-draw timelines phase-locked to that sideways motion. `pin` + `scrub` +
  `containerAnimation` gives one authoritative timeline for both.
- **Refs over state in every render loop.** Particle buffers, camera angles and
  morph progress mutate in place inside `useFrame`. Routing per-frame values
  through `useState` would push thousands of React renders per second for
  values React never needs to see.
- **A hand-written Bézier solver in the Motion Lab.** Newton–Raphson inversion
  of the curve means the preview animates on the visitor's exact control points,
  including out-of-range overshoot. Snapping to a library preset would have
  quietly made the demo lie.
- **Deferred, user-triggered payoff.** The Motion Lab scrubber, view modes and
  handles do nothing until touched — no autoplay. Motion that runs on its own
  is decoration; motion the visitor drives is a product demo.
- **Fallbacks designed in, not bolted on.** Because the page uses motion to
  carry meaning, reduced-motion and mobile needed real alternative layouts
  (vertical stack, pre-drawn SVG paths) rather than just disabled animations.
- **Audio as confirmation, never as ambience-by-default.** UI blips are ~40ms
  and tied to discrete actions; the hero pad is opt-in. Sound reinforces
  causality without becoming a surprise.
