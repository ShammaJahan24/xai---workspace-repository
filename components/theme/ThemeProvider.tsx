'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { SECTION_THEME, type Theme } from '@/lib/constants'

const ThemeCtx = createContext<Theme>('light')
export const useTheme = () => useContext(ThemeCtx)

const LIGHT_BG =
  'radial-gradient(1200px 620px at 72% -12%, #dbe4ff 0%, transparent 60%),' +
  'radial-gradient(900px 520px at 8% 6%, #dcfbff 0%, transparent 55%),' +
  'linear-gradient(180deg, #eef1f8 0%, #e9edf6 100%)'

const DARK_BG =
  'radial-gradient(1100px 700px at 78% -10%, rgba(129,140,248,0.18) 0%, transparent 60%),' +
  'radial-gradient(900px 600px at 12% 8%, rgba(34,211,238,0.12) 0%, transparent 55%),' +
  'linear-gradient(180deg, #09090b 0%, #0b0b10 100%)'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const ids = Object.keys(SECTION_THEME)
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!els.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const next = SECTION_THEME[entry.target.id]
            if (next) setTheme(next)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo(() => theme, [theme])

  return (
    <ThemeCtx.Provider value={value}>
      {/* Crossfading backdrop: light layer underneath, dark layer fades in. */}
      <div className="fixed inset-0 -z-10" style={{ background: LIGHT_BG }} aria-hidden />
      <motion.div
        className="fixed inset-0 -z-10"
        style={{ background: DARK_BG }}
        initial={false}
        animate={{ opacity: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      />
      {children}
    </ThemeCtx.Provider>
  )
}
