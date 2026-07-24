'use client'

import React, { useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Box,
  Check,
  Copy,
  Layers,
  Move,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
} from 'lucide-react'
import { playUISound } from '@/lib/sound'
import { cn } from '@/lib/utils'

type Pt = { x: number; y: number }
type Preset = { name: string; p1: Pt; p2: Pt }

const PRESETS: Preset[] = [
  { name: 'ease', p1: { x: 0.25, y: 0.1 }, p2: { x: 0.25, y: 1 } },
  { name: 'easeIn', p1: { x: 0.42, y: 0 }, p2: { x: 1, y: 1 } },
  { name: 'easeOut', p1: { x: 0, y: 0 }, p2: { x: 0.58, y: 1 } },
  { name: 'easeInOut', p1: { x: 0.42, y: 0 }, p2: { x: 0.58, y: 1 } },
  { name: 'expo', p1: { x: 0.16, y: 1 }, p2: { x: 0.3, y: 1 } },
  { name: 'back', p1: { x: 0.34, y: 1.56 }, p2: { x: 0.64, y: 1 } },
  { name: 'elastic', p1: { x: 0.68, y: -0.55 }, p2: { x: 0.265, y: 1.55 } },
]

const S = 300 // svg size
const P = 34 // inner padding
const INNER = S - P * 2

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const toPx = (u: Pt) => ({ x: P + u.x * INNER, y: S - P - u.y * INNER })

/** Cubic-bezier easing evaluator */
function makeBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x: number) => {
    let t = x
    for (let i = 0; i < 8; i++) {
      const d = dX(t)
      const err = sampleX(t) - x
      if (Math.abs(err) < 1e-5 || d === 0) break
      t -= err / d
    }
    return sampleY(t)
  }
}

export default function SignatureInteraction() {
  const [p1, setP1] = useState<Pt>(PRESETS[4].p1)
  const [p2, setP2] = useState<Pt>(PRESETS[4].p2)
  const [duration, setDuration] = useState(1200)
  const [playing, setPlaying] = useState(true)
  const [copied, setCopied] = useState(false)
  const [preset, setPreset] = useState('expo')
  const [viewMode, setViewMode] = useState<'3d' | 'ui' | 'rail'>('3d')
  const [scrubProgress, setScrubProgress] = useState(1)
  const [isScrubbing, setIsScrubbing] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef<null | 'p1' | 'p2'>(null)
  const [loop, setLoop] = useState(0)

  // 3D Tilt Motion Values
  const stageX = useMotionValue(0)
  const stageY = useMotionValue(0)
  const rotateX = useSpring(useTransform(stageY, [-0.5, 0.5], [20, -20]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(stageX, [-0.5, 0.5], [-20, 20]), { stiffness: 200, damping: 20 })

  const ease: [number, number, number, number] = [p1.x, p1.y, p2.x, p2.y]
  const cssValue = `cubic-bezier(${ease.map((n) => Number(n.toFixed(2))).join(', ')})`

  const bezierFn = useMemo(() => makeBezier(p1.x, p1.y, p2.x, p2.y), [p1, p2])

  const ghosts = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => clamp(bezierFn(i / 15), -0.3, 1.3))
  }, [bezierFn])

  const applyPreset = (pr: Preset) => {
    setP1(pr.p1)
    setP2(pr.p2)
    setPreset(pr.name)
    setLoop((l) => l + 1)
    if (typeof playUISound === 'function') playUISound('select')
  }

  const onDrag = (e: React.PointerEvent) => {
    const which = dragging.current
    const svg = svgRef.current
    if (!which || !svg) return
    const r = svg.getBoundingClientRect()
    const ux = clamp(((e.clientX - r.left) / r.width - P / S) / (INNER / S), 0, 1)
    const uy = clamp((S - P - ((e.clientY - r.top) / r.height) * S) / INNER, -0.5, 1.5)
    const next = { x: ux, y: uy }
    if (which === 'p1') setP1(next)
    else setP2(next)
    setPreset('custom')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cssValue)
    } catch {
      /* ignore */
    }
    setCopied(true)
    if (typeof playUISound === 'function') playUISound('click')
    setTimeout(() => setCopied(false), 1500)
  }

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    stageX.set(x)
    stageY.set(y)
  }

  const handleStageMouseLeave = () => {
    stageX.set(0)
    stageY.set(0)
  }

  const a1 = toPx(p1)
  const a2 = toPx(p2)
  const start = toPx({ x: 0, y: 0 })
  const end = toPx({ x: 1, y: 1 })

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        
        {/* ---- Left Column: Curve Editor ---- */}
        <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-mono text-xs font-medium tracking-wider text-zinc-400">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" /> EASING CURVE
            </span>
            <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 font-mono text-xs text-cyan-400 border border-cyan-500/20">
              {preset}
            </span>
          </div>

          {/* SVG Canvas */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-2 shadow-inner">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${S} ${S}`}
              className="w-full touch-none select-none cursor-crosshair"
              onPointerMove={onDrag}
              onPointerUp={() => (dragging.current = null)}
              onPointerLeave={() => (dragging.current = null)}
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                <g key={g}>
                  <line x1={P + g * INNER} y1={P} x2={P + g * INNER} y2={S - P} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
                  <line x1={P} y1={P + g * INNER} x2={S - P} y2={P + g * INNER} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
                </g>
              ))}

              {/* Reference Diagonal */}
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />

              {/* Control Lines */}
              <line x1={start.x} y1={start.y} x2={a1.x} y2={a1.y} stroke="#22d3ee" strokeWidth="2" strokeDasharray="2 2" opacity="0.8" />
              <line x1={end.x} y1={end.y} x2={a2.x} y2={a2.y} stroke="#a78bfa" strokeWidth="2" strokeDasharray="2 2" opacity="0.8" />

              {/* Main Bezier Curve */}
              <path
                d={`M${start.x} ${start.y} C${a1.x} ${a1.y} ${a2.x} ${a2.y} ${end.x} ${end.y}`}
                fill="none"
                stroke="url(#eg)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="eg" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>

              {/* Endpoints */}
              <circle cx={start.x} cy={start.y} r="5" fill="#52525b" />
              <circle cx={end.x} cy={end.y} r="5" fill="#52525b" />

              {/* Interactive Control Handles */}
              <g className="cursor-grab active:cursor-grabbing">
                <circle cx={a1.x} cy={a1.y} r="12" fill="#22d3ee" fillOpacity="0.2" />
                <circle
                  cx={a1.x}
                  cy={a1.y}
                  r="7"
                  fill="#22d3ee"
                  stroke="#ffffff"
                  strokeWidth="2"
                  onPointerDown={() => {
                    dragging.current = 'p1'
                    if (typeof playUISound === 'function') playUISound('tab')
                  }}
                />
              </g>
              <g className="cursor-grab active:cursor-grabbing">
                <circle cx={a2.x} cy={a2.y} r="12" fill="#a78bfa" fillOpacity="0.2" />
                <circle
                  cx={a2.x}
                  cy={a2.y}
                  r="7"
                  fill="#a78bfa"
                  stroke="#ffffff"
                  strokeWidth="2"
                  onPointerDown={() => {
                    dragging.current = 'p2'
                    if (typeof playUISound === 'function') playUISound('tab')
                  }}
                />
              </g>
            </svg>
          </div>

          {/* CSS Output & Copy */}
          <button
            onClick={copy}
            className="group flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2.5 font-mono text-xs text-zinc-300 transition-all hover:border-cyan-500/40 hover:bg-zinc-900"
          >
            <span className="truncate">{cssValue}</span>
            {copied ? (
              <Check className="h-4 w-4 shrink-0 text-cyan-400" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-300" />
            )}
          </button>

          {/* Coordinate Readout */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-2">
              <span className="text-cyan-400">P1: </span>({p1.x.toFixed(2)}, {p1.y.toFixed(2)})
            </div>
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-2">
              <span className="text-purple-400">P2: </span>({p2.x.toFixed(2)}, {p2.y.toFixed(2)})
            </div>
          </div>
        </div>

        {/* ---- Right Column: Live Interactive 3D/2D Showcase ---- */}
        <div className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-xl shadow-2xl">
          
          {/* Header Controls */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {/* View Mode Selector */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
              <button
                onClick={() => setViewMode('3d')}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  viewMode === '3d'
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                <Box className="h-3.5 w-3.5" /> 3D Stage
              </button>
              <button
                onClick={() => setViewMode('ui')}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  viewMode === 'ui'
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                <Layers className="h-3.5 w-3.5" /> UI Card
              </button>
              <button
                onClick={() => setViewMode('rail')}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  viewMode === 'rail'
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                <Move className="h-3.5 w-3.5" /> Motion Rail
              </button>
            </div>

            {/* Play/Pause & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLoop((l) => l + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/60 text-zinc-300 transition-colors hover:bg-zinc-700"
                title="Restart Animation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setPlaying((v) => !v)
                  setLoop((l) => l + 1)
                  if (typeof playUISound === 'function') playUISound('toggle')
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playing ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>

          {/* Canvas Display Container */}
          <div
            className="relative flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 perspective-[1000px]"
            onMouseMove={handleStageMouseMove}
            onMouseLeave={handleStageMouseLeave}
          >
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

            {/* --- VIEW MODE 1: 3D SPATIAL STAGE --- */}
            {viewMode === '3d' && (
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                }}
                className="relative flex h-52 w-64 flex-col items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-6 shadow-2xl backdrop-blur-md"
              >
                {/* Floating Depth Layers */}
                <motion.div
                  key={`3d-card-${loop}-${playing}-${isScrubbing ? scrubProgress : 'auto'}`}
                  style={{ transformStyle: 'preserve-3d' }}
                  initial={{ rotateY: -35, rotateX: 20, z: -40, opacity: 0.2 }}
                  animate={
                    playing && !isScrubbing
                      ? {
                          rotateY: [-35, 35, -35],
                          rotateX: [20, -20, 20],
                          z: [-40, 60, -40],
                          opacity: [0.3, 1, 0.3],
                        }
                      : {
                          rotateY: (scrubProgress - 0.5) * 70,
                          rotateX: (0.5 - scrubProgress) * 40,
                          z: (scrubProgress - 0.5) * 100,
                          opacity: 1,
                        }
                  }
                  transition={
                    playing && !isScrubbing
                      ? { duration: duration / 1000, ease, repeat: Infinity, repeatType: 'mirror' }
                      : { duration: 0.1 }
                  }
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border border-violet-500/40 bg-gradient-to-br from-cyan-500/20 to-purple-600/30 p-5 shadow-cyan-500/20 shadow-2xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-lg shadow-cyan-500/40">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-xs font-semibold text-zinc-100">3D Spatial Motion</p>
                    <p className="font-mono text-[10px] text-cyan-300/80">Depth & Rotation</p>
                  </div>
                </motion.div>

                <p className="absolute bottom-2 font-mono text-[10px] text-zinc-500">
                  Hover to orbit perspective
                </p>
              </motion.div>
            )}

            {/* --- VIEW MODE 2: UI CARD PREVIEW --- */}
            {viewMode === 'ui' && (
              <div className="w-full max-w-md">
                <motion.div
                  key={`ui-card-${loop}-${playing}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-700/80 bg-zinc-800/80 p-4 shadow-xl backdrop-blur-md"
                  initial={{ opacity: 0, y: 35, scale: 0.95 }}
                  animate={
                    playing
                      ? { opacity: 1, y: 0, scale: 1 }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  transition={
                    playing
                      ? { duration: duration / 1000, ease, repeat: Infinity, repeatType: 'reverse' }
                      : { duration: 0.3 }
                  }
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 shadow-md" />
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 w-3/4 rounded-full bg-zinc-600" />
                    <div className="h-2 w-1/2 rounded-full bg-zinc-700" />
                  </div>
                </motion.div>
              </div>
            )}

            {/* --- VIEW MODE 3: MOTION RAIL --- */}
            {viewMode === 'rail' && (
              <div className="relative w-full max-w-lg py-12">
                {/* Track Line */}
                <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-800" />
                
                {/* Ghost Trail */}
                {ghosts.map((v, i) => (
                  <span
                    key={i}
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
                    style={{
                      left: `calc(${clamp(v, 0, 1) * 100}% - 0.3rem)`,
                      background: '#22d3ee',
                      opacity: 0.15 + (i / 15) * 0.6,
                    }}
                  />
                ))}

                {/* Animated Moving Marker */}
                <motion.div
                  key={`rail-marker-${loop}-${playing}`}
                  className="absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/40"
                  initial={{ left: '0%' }}
                  animate={playing ? { left: 'calc(100% - 2rem)' } : { left: '0%' }}
                  transition={
                    playing
                      ? { duration: duration / 1000, ease, repeat: Infinity, repeatType: 'mirror' }
                      : { duration: 0.3 }
                  }
                />
              </div>
            )}
          </div>

          {/* Interactive Scrubbing Slider */}
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
            <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-zinc-400">
              <span>MANUAL SCRUBBER</span>
              <span className="text-cyan-400">{(scrubProgress * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={scrubProgress}
              onMouseDown={() => {
                setIsScrubbing(true)
                setPlaying(false)
              }}
              onMouseUp={() => setIsScrubbing(false)}
              onChange={(e) => setScrubProgress(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Duration Slider */}
          <div className="mt-3 flex items-center gap-3">
            <span className="font-mono text-[11px] font-medium text-zinc-400">DURATION</span>
            <input
              type="range"
              min={300}
              max={3000}
              step={50}
              value={duration}
              onChange={(e) => {
                setDuration(Number(e.target.value))
                setLoop((l) => l + 1)
              }}
              className="flex-1 accent-cyan-400"
            />
            <span className="w-14 text-right font-mono text-xs text-zinc-300">{duration}ms</span>
          </div>

          {/* Easing Presets */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {PRESETS.map((pr) => (
              <button
                key={pr.name}
                onClick={() => applyPreset(pr)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 font-mono text-xs transition-all duration-200',
                  preset === pr.name
                    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                )}
              >
                {pr.name}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}