'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, MousePointerClick, Share2 } from 'lucide-react'
import { SECTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Stage = {
  id: string
  number: string
  icon: typeof Layers
  title: string
  subtitle: string
  description: string
  metrics: { label: string; val: string }[]
  Visual: () => React.ReactElement
}

const STAGES: Stage[] = [
  {
    id: 'import',
    number: '01',
    icon: Layers,
    title: 'Import',
    subtitle: 'Bring your designs in',
    description:
      'Pull frames straight from Figma or Sketch, or drop in a file. Kinetic auto-detects layers, variants and components — pixel-perfect.',
    metrics: [
      { label: 'Sources', val: 'Figma · Sketch' },
      { label: 'Fidelity', val: '1:1' },
    ],
    Visual: IngestVisual,
  },
  {
    id: 'compose',
    number: '02',
    icon: MousePointerClick,
    title: 'Compose',
    subtitle: 'Wire real interactions',
    description:
      'Connect screens with triggers and gestures, then tune motion with springs and easing curves until every transition feels right.',
    metrics: [
      { label: 'Triggers', val: 'Tap · Drag · Scroll' },
      { label: 'Motion', val: 'Spring + Bézier' },
    ],
    Visual: AnalyzeVisual,
  },
  {
    id: 'preview',
    number: '03',
    icon: Share2,
    title: 'Preview & share',
    subtitle: 'Test on-device, hand off',
    description:
      'Preview live on real devices, share a link for feedback, and export clean specs and code snippets for engineering handoff.',
    metrics: [
      { label: 'Preview', val: 'On-device' },
      { label: 'Handoff', val: 'Specs + code' },
    ],
    Visual: GenerateVisual,
  },
]

export default function InsightFlow() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let killed = false
    let mm: { add: (query: string, fn: () => void) => void; revert: () => void } | undefined

    ;(async () => {
      const gsapMod = await import('gsap')
      const stMod = await import('gsap/ScrollTrigger')
      if (killed || !sectionRef.current || !trackRef.current) return
      const gsap = gsapMod.gsap ?? gsapMod.default
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default
      gsap.registerPlugin(ScrollTrigger)

      mm = gsap.matchMedia()

      // Desktop: pin the section and scrub the track horizontally.
      mm.add('(min-width: 768px)', () => {
        const track = trackRef.current!
        const section = sectionRef.current!

        const distance = () => track.scrollWidth - window.innerWidth

        const horiz = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setProgress(self.progress)
              setActive(Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length + 0.001)))
            },
          },
        })

        // Geometry line-draw per panel, triggered by the horizontal motion.
        const panels = gsap.utils.toArray<HTMLElement>('.flow-panel')
        panels.forEach((panel) => {
          const paths = panel.querySelectorAll<SVGPathElement>('[data-draw]')
          gsap.fromTo(
            paths,
            { strokeDashoffset: (_i: number, el: SVGPathElement) => el.getTotalLength?.() || 1200 },
            {
              strokeDashoffset: 0,
              stagger: 0.04,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horiz,
                start: 'left 75%',
                end: 'center center',
                scrub: true,
              },
            },
          )
        })

        ScrollTrigger.refresh()
        return () => {} // matchMedia auto-reverts these on cleanup
      })
    })()

    return () => {
      killed = true
      mm?.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id={SECTIONS.flow}
      className="relative overflow-hidden border-y border-slate-200/40 dark:border-zinc-800/40 md:h-screen"
    >
      {/* Pinned header overlay (desktop) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden px-8 pt-24 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 font-mono text-xs text-indigo-600 dark:border-cyan-500/20 dark:bg-cyan-950/40 dark:text-cyan-400">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400" />
            HOW XAI WORKS — INGEST · ANALYZE · GENERATE
          </div>
          <div className="font-mono text-xs text-slate-500 dark:text-zinc-500">
            STAGE <span className="text-cyan-400">{STAGES[active].number}</span> / 03
          </div>
        </div>
        {/* progress conduit */}
        <div className="mx-auto mt-4 h-px max-w-7xl bg-slate-100 dark:bg-zinc-800">
          <div
            className="h-px bg-linear-to-r from-cyan-400 to-violet-500 transition-[width] duration-150"
            style={{ width: `${Math.max(4, progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Track: horizontal on desktop, stacked on mobile */}
      <div
        ref={trackRef}
        className="flex w-full flex-col md:h-full md:w-max md:flex-row"
      >
        {STAGES.map((s, i) => (
          <FlowPanel key={s.id} stage={s} index={i} active={active === i} />
        ))}
      </div>
    </section>
  )
}

function FlowPanel({ stage, index, active }: { stage: Stage; index: number; active: boolean }) {
  const Icon = stage.icon
  const Visual = stage.Visual
  return (
    <div
      className={cn(
        'flow-panel flex w-full shrink-0 items-center px-6 py-24 md:h-full md:w-screen md:py-0',
      )}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Copy */}
        <div className={cn('transition-opacity duration-500', active ? 'opacity-100' : 'md:opacity-40')}>
          <div className="flex items-center gap-3 font-mono text-xs text-slate-600 dark:text-zinc-400">
            <span className="text-cyan-400">PHASE {stage.number}</span>
            <span>—</span>
            <span>{stage.subtitle}</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 text-cyan-400">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-4xl">
              {stage.title}
            </h3>
          </div>
          <p className="mt-4 max-w-md text-slate-600 dark:text-zinc-400">{stage.description}</p>

          <div className="mt-6 flex gap-8 border-t border-slate-200/60 dark:border-zinc-800/60 pt-4">
            {stage.metrics.map((m) => (
              <motion.div key={m.label} whileHover={{ y: -3 }} className="cursor-default">
                <div className="text-xs text-slate-500 dark:text-zinc-500">{m.label}</div>
                <div className="mt-0.5 font-mono text-lg font-semibold text-cyan-400">{m.val}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Geometry */}
        <div className="relative mx-auto aspect-square w-full max-w-[440px]">
          <Visual />
          <span className="pointer-events-none absolute right-2 top-2 font-mono text-[10px] text-slate-300 dark:text-zinc-700">
            0{index + 1}
          </span>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- geometry visuals --------------------------- */
// Paths carry data-draw + a large strokeDasharray so they render solid by
// default (mobile / reduced-motion) and GSAP can draw them in on desktop.

const DASH = { strokeDasharray: 1400 } as const

function IngestVisual() {
  // Round to 2 decimals so server and client render byte-identical strings
  // (avoids React hydration mismatches on the SVG coordinates).
  const round = (n: number) => Math.round(n * 100) / 100
  const pts = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2
    const r = 150 + (i % 4) * 26
    return { x: round(220 + Math.cos(a) * r), y: round(220 + Math.sin(a) * r) }
  })
  return (
    <svg viewBox="0 0 440 440" className="h-full w-full">
      <defs>
        <radialGradient id="ing" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {pts.map((p, i) => (
        <path
          key={i}
          data-draw
          d={`M${p.x} ${p.y} Q 220 220 220 220`}
          stroke="rgba(34,211,238,0.35)"
          strokeWidth="1.4"
          fill="none"
          style={DASH}
        />
      ))}
      {pts.map((p, i) => (
        <circle key={`c${i}`} cx={p.x} cy={p.y} r={2.4} fill="#818cf8" opacity={0.8} />
      ))}
      <circle cx="220" cy="220" r="66" fill="url(#ing)" />
      <circle cx="220" cy="220" r="22" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
      <circle cx="220" cy="220" r="7" className="animate-pulse" fill="#22d3ee" />
    </svg>
  )
}

function AnalyzeVisual() {
  const cols = 4
  const rows = 4
  const nodes: { x: number; y: number }[] = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) nodes.push({ x: 70 + c * 100, y: 70 + r * 100 })
  const links: [number, number][] = []
  nodes.forEach((_, i) => {
    if ((i + 1) % cols !== 0) links.push([i, i + 1])
    if (i + cols < nodes.length) links.push([i, i + cols])
    if ((i + 1) % cols !== 0 && i + cols < nodes.length) links.push([i, i + cols + 1])
  })
  return (
    <svg viewBox="0 0 440 440" className="h-full w-full">
      {links.map(([a, b], i) => (
        <path
          key={i}
          data-draw
          d={`M${nodes[a].x} ${nodes[a].y} L${nodes[b].x} ${nodes[b].y}`}
          stroke={i % 3 === 0 ? 'rgba(34,211,238,0.7)' : 'rgba(129,140,248,0.3)'}
          strokeWidth={i % 3 === 0 ? 1.8 : 1}
          fill="none"
          style={DASH}
        />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i % 3 === 0 ? 6 : 4} fill={i % 3 === 0 ? '#22d3ee' : '#3f3f46'}>
          {i % 3 === 0 && (
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.1}s`} />
          )}
        </circle>
      ))}
    </svg>
  )
}

function GenerateVisual() {
  return (
    <svg viewBox="0 0 440 440" className="h-full w-full">
      <defs>
        <linearGradient id="gen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      {[110, 190, 270, 350].map((y, i) => (
        <line key={i} x1="50" y1={y} x2="390" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      <path
        data-draw
        d="M50 330 C120 312 150 180 200 190 C255 200 295 110 350 100 C368 96 384 92 390 88"
        stroke="url(#gen)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        style={DASH}
      />
      <circle cx="390" cy="88" r="6" fill="#22d3ee" />
      <circle cx="390" cy="88" r="12" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.5">
        <animate attributeName="r" values="8;20;8" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
