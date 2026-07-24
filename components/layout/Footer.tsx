'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Check, Globe, MessageCircle, Send } from 'lucide-react'
import Magnetic from '@/components/ui/Magnetic'
import { playUISound } from '@/lib/sound'
import { SITE } from '@/lib/constants'

export default function Footer() {
  const ref = useRef<HTMLElement>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  // Cursor spotlight — a subtle glow that follows the pointer across the footer.
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    playUISound('trigger')
    setSent(true)
    setEmail('')
    setTimeout(() => setSent(false), 3200)
  }

  return (
    <footer
      ref={ref}
      onPointerMove={onMove}
      className="group/foot relative overflow-hidden border-t border-slate-200/70 bg-white dark:border-zinc-800/60 dark:bg-zinc-950"
      style={{ ['--mx' as string]: '50%', ['--my' as string]: '50%' }}
    >
      {/* cursor-follow spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/foot:opacity-100"
        style={{
          background:
            'radial-gradient(360px circle at var(--mx) var(--my), rgba(34,211,238,0.10), transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-8">
        {/* Left: brand + contact */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-cyan-400 to-violet-500 font-mono text-sm font-extrabold text-zinc-950">
              X
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">{SITE.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            Ready to prototype interactions that actually feel right? Drop your
            email and the team will reach out.
          </p>

          {/* Contact form */}
          <form onSubmit={submit} className="mt-6 flex max-w-md items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors duration-300 focus:border-cyan-500/60 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder-zinc-600"
            />
            <Magnetic strength={0.35}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.04] active:scale-95 dark:bg-zinc-100 dark:text-zinc-950"
              >
                {sent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {sent ? 'Sent' : 'Get in touch'}
              </button>
            </Magnetic>
          </form>

          <motion.p
            initial={false}
            animate={{ opacity: sent ? 1 : 0, y: sent ? 0 : 4 }}
            className="mt-2 text-xs text-cyan-400"
          >
            Thanks — we&rsquo;ll be in touch shortly.
          </motion.p>
        </div>

        {/* Right: quick links */}
        <div className="flex flex-col items-start gap-4 lg:items-end">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500">
            Follow along
          </span>
          <div className="flex items-center gap-2">
            {[
              { Icon: Globe, label: 'Website' },
              { Icon: MessageCircle, label: 'Community' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                onMouseEnter={() => playUISound('hover')}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-slate-200 dark:border-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-slate-500 dark:text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-3 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>All systems nominal</span>
            <span className="text-slate-300 dark:text-zinc-700">·</span>
            <span>© 2026 {SITE.name}</span>
          </div>

          <div className="flex items-center gap-5">
            {['Privacy', 'Terms'].map((l) => (
              <a
                key={l}
                href="#"
                className="relative transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-cyan-400 after:transition-[width] after:duration-300 hover:text-slate-800 dark:hover:text-zinc-200 hover:after:w-full"
              >
                {l}
              </a>
            ))}
            <button
              onClick={() => {
                playUISound('top')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:text-white"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
