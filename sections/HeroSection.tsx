'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, MousePointerClick, Volume2, VolumeX } from 'lucide-react'
import SceneWrapper from '@/components/3d/SceneWrapper'
import DataTransformationCanvas from '@/components/3d/DataTransformationCanvas'
import { ambientEngine } from '@/lib/ambientSound'
import { SECTIONS } from '@/lib/constants'

export default function HeroSection() {
  const [muted, setMuted] = useState(true)

  const toggleAudio = () => setMuted(ambientEngine.toggleMute())

  return (
    <section
      id={SECTIONS.overview}
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden text-slate-900 dark:text-zinc-100"
    >
      {/* Morphing prototype field (light palette) */}
      <SceneWrapper camera={{ position: [0, 0, 7.5], fov: 55 }}>
        <DataTransformationCanvas />
      </SceneWrapper>

      <div className="pointer-events-none z-10 max-w-4xl space-y-8 px-4 text-center">
        {/* Badge + audio toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-surface pointer-events-auto inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 shadow-sm"
        >
          <span className="flex items-center gap-2">
            <MousePointerClick className="h-3.5 w-3.5 text-indigo-500" />
            <span>XAI — Intelligence Workspace</span>
          </span>
          <span className="h-3.5 w-px bg-slate-300 dark:bg-zinc-700" />
          <button onClick={toggleAudio} className="flex items-center gap-1.5 font-semibold transition-colors hover:text-slate-900 dark:hover:text-zinc-100">
            {muted ? <VolumeX className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-600" /> : <Volume2 className="h-3.5 w-3.5 text-indigo-500" />}
            {muted ? 'Ambient sound' : 'Playing'}
          </button>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-6xl md:text-7xl"
        >
          Prototype interactions,
          <br />
          <span className="bg-linear-to-r from-indigo-500 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
            not just screens
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-zinc-400 md:text-xl"
        >
          XAI turns static frames into living, high-fidelity prototypes — real
          motion, real logic, real timing. Move your cursor to shape the field.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pointer-events-auto flex items-center justify-center gap-4 pt-2"
        >
          <a
            href={`#${SECTIONS.workspace}`}
            className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-zinc-100 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-950 shadow-lg shadow-slate-900/10 dark:shadow-cyan-500/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          >
            Open the workspace
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
          <a
            href={`#${SECTIONS.flow}`}
            className="rounded-xl border border-slate-300 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/50 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-zinc-300 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-900 active:scale-95"
          >
            How it works
          </a>
        </motion.div>
      </div>

      {/* fade into the next section, matched to the active theme */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-[#e9edf6]/70 to-transparent dark:from-[#0b0b10]/70" />
    </section>
  )
}
