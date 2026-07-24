'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { motion } from 'framer-motion'
import type { Theme } from '@/lib/constants'

const STORAGE_KEY = 'site-theme'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}

const ThemeCtx = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  toggle: () => {},
})

export const useTheme = () => useContext(ThemeCtx)

const LIGHT_BG =
  'radial-gradient(1200px 620px at 72% -12%, #dbe4ff 0%, transparent 60%),' +
  'radial-gradient(900px 520px at 8% 6%, #dcfbff 0%, transparent 55%),' +
  'linear-gradient(180deg, #eef1f8 0%, #e9edf6 100%)'

const DARK_BG =
  'radial-gradient(1100px 700px at 78% -10%, rgba(129,140,248,0.18) 0%, transparent 60%),' +
  'radial-gradient(900px 600px at 12% 8%, rgba(34,211,238,0.12) 0%, transparent 55%),' +
  'linear-gradient(180deg, #09090b 0%, #0b0b10 100%)'

/** Reads any persisted choice, otherwise falls back to the OS preference, otherwise dark. */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* localStorage unavailable (e.g. private mode) — ignore and fall through */
  }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches === false) {
    return 'light'
  }
  return 'dark'
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with the site's default (dark) on the server and on first paint, then
  // sync to the persisted/OS preference right after mount to avoid a hydration
  // mismatch while still respecting the user's stored choice almost instantly.
  const [theme, setThemeState] = useState<Theme>('dark')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setThemeState(getInitialTheme())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore persistence errors */
    }
  }, [theme, hydrated])

  const setTheme = useCallback((next: Theme) => setThemeState(next), [])
  const toggle = useCallback(
    () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  )

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle])

  return (
    <ThemeCtx.Provider value={value}>
      {/* Crossfading backdrop: light layer underneath, dark layer fades in/out globally. */}
      <div className="fixed inset-0 -z-10" style={{ background: LIGHT_BG }} aria-hidden />
      <motion.div
        className="fixed inset-0 -z-10"
        style={{ background: DARK_BG }}
        initial={false}
        animate={{ opacity: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      />
      {children}
    </ThemeCtx.Provider>
  )
}
