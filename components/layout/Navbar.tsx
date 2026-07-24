'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Magnetic from '@/components/ui/Magnetic'
import { useTheme } from '@/components/theme/ThemeProvider'
import { NAV_LINKS, SECTIONS, SITE } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const theme = useTheme()
  const light = theme === 'light'
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = Object.values(SECTIONS)
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3"
    >
      <nav
        className={cn(
          'flex w-full max-w-7xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500',
          scrolled ? (light ? 'glass-light' : 'glass') : 'border border-transparent',
        )}
      >
        <a href={`#${SECTIONS.overview}`} className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-500 to-cyan-400 font-mono text-sm font-extrabold text-white">
            X
          </span>
          <span className={cn('text-sm font-semibold tracking-tight transition-colors', light ? 'text-slate-900' : 'text-zinc-100')}>
            XAI
            <span className={light ? 'text-slate-400' : 'text-zinc-500'}> - Intelligence Workspace</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const on = active && l.href === `#${active}`
            return (
              <a
                key={l.href}
                href={l.href}
                className={cn(
                  'relative rounded-full px-3.5 py-1.5 text-sm transition-colors',
                  on
                    ? light ? 'text-slate-900' : 'text-white'
                    : light ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-100',
                )}
              >
                {on && (
                  <motion.span
                    layoutId="navActive"
                    className={cn('absolute inset-0 rounded-full', light ? 'bg-slate-900/[0.06]' : 'bg-white/[0.07]')}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </a>
            )
          })}
        </div>

        <div className="hidden md:block">
          <Magnetic strength={0.4}>
            <a
              href={`#${SECTIONS.workspace}`}
              className={cn(
                'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 active:scale-95',
                light ? 'bg-slate-900 text-white hover:shadow-lg hover:shadow-slate-900/20' : 'bg-zinc-100 text-zinc-950 hover:shadow-lg hover:shadow-cyan-500/10',
              )}
            >
              Open workspace
            </a>
          </Magnetic>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className={cn('rounded-lg p-1.5 transition-colors md:hidden', light ? 'text-slate-700 hover:bg-slate-900/5' : 'text-zinc-300 hover:bg-white/5')}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn('absolute left-4 right-4 top-16 rounded-2xl p-3 md:hidden', light ? 'glass-light' : 'glass')}
          >
            <div className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn('rounded-xl px-4 py-2.5 text-sm transition-colors', light ? 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900' : 'text-zinc-300 hover:bg-white/5 hover:text-white')}
                >
                  {l.label}
                </a>
              ))}
              <a
                href={`#${SECTIONS.workspace}`}
                onClick={() => setOpen(false)}
                className={cn('mt-2 rounded-xl px-4 py-2.5 text-center text-sm font-medium', light ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-zinc-950')}
              >
                Open workspace
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
