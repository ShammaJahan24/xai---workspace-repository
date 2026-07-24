'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Boxes,
  Command,
  Download,
  Layers,
  LayoutDashboard,
  MonitorSmartphone,
  Play,
  Search,
  Share2,
  TrendingUp,
  Workflow,
  X,
} from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import CountUp from '@/components/ui/CountUp'
import { SECTIONS } from '@/lib/constants'
import { playUISound } from '@/lib/sound'
import { cn } from '@/lib/utils'

/* ------------------------------- data --------------------------------- */

type ViewId = 'overview' | 'prototypes' | 'components' | 'flows' | 'handoff'

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'prototypes', label: 'Prototypes', icon: Layers },
  { id: 'components', label: 'Components', icon: Boxes },
  { id: 'flows', label: 'Flows', icon: Workflow },
  { id: 'handoff', label: 'Handoff', icon: Share2 },
]

type Range = 'today' | '7d' | '30d'
const RANGES: { id: Range; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
]

const SERIES: Record<Range, number[]> = {
  today: [22, 26, 24, 30, 28, 36, 33, 41, 38, 46, 44, 52, 49, 58, 55, 63, 60, 69, 66, 74, 72, 80, 77, 86, 83, 90, 88, 95],
  '7d': [40, 44, 39, 52, 61, 55, 70, 64, 58, 72, 80, 74, 66, 60, 78, 85, 79, 90, 84, 76, 88, 96, 89, 82, 92, 99, 94, 100],
  '30d': [55, 48, 60, 52, 66, 58, 70, 62, 74, 68, 80, 72, 66, 78, 84, 76, 88, 80, 92, 84, 78, 90, 96, 88, 82, 94, 100, 97],
}

const KPIS: Record<Range, { label: string; value: string; delta: number; spark: number[] }[]> = {
  today: [
    { label: 'Active prototypes', value: '12', delta: 4.2, spark: [8, 9, 10, 10, 11, 11, 12, 12] },
    { label: 'Screens', value: '148', delta: 6.1, spark: [120, 126, 130, 134, 138, 142, 145, 148] },
    { label: 'Interactions wired', value: '512', delta: 8.4, spark: [420, 440, 455, 470, 482, 495, 505, 512] },
    { label: 'Avg preview FPS', value: '60', delta: 0.0, spark: [58, 59, 60, 60, 59, 60, 60, 60] },
  ],
  '7d': [
    { label: 'Active prototypes', value: '34', delta: 9.7, spark: [22, 25, 27, 29, 30, 32, 33, 34] },
    { label: 'Screens', value: '1,204', delta: 11.2, spark: [900, 960, 1010, 1060, 1110, 1150, 1180, 1204] },
    { label: 'Interactions wired', value: '4.1K', delta: 14.6, spark: [2800, 3100, 3300, 3500, 3700, 3900, 4000, 4100] },
    { label: 'Preview sessions', value: '882', delta: 5.3, spark: [640, 690, 720, 760, 790, 820, 855, 882] },
  ],
  '30d': [
    { label: 'Active prototypes', value: '96', delta: 18.4, spark: [50, 58, 64, 70, 78, 84, 90, 96] },
    { label: 'Screens', value: '5.8K', delta: 21.0, spark: [3600, 4000, 4300, 4700, 5000, 5300, 5600, 5800] },
    { label: 'Interactions wired', value: '18.2K', delta: 24.1, spark: [11000, 12500, 13800, 15000, 16000, 17000, 17800, 18200] },
    { label: 'Preview sessions', value: '3,410', delta: 9.8, spark: [2200, 2450, 2650, 2850, 3000, 3180, 3300, 3410] },
  ],
}

const DISTRIBUTION = [
  { label: 'Transition', value: 38, color: '#6366f1' },
  { label: 'Tap', value: 29, color: '#06b6d4' },
  { label: 'Drag', value: 20, color: '#8b5cf6' },
  { label: 'Scroll', value: 13, color: '#94a3b8' },
]

type Row = {
  id: string
  name: string
  kind: 'flow' | 'screen' | 'overlay'
  transitions: number
  status: 'Ready' | 'Draft' | 'Shared'
  note: string
}
const ROWS: Row[] = [
  { id: 'PR-01', name: 'Onboarding · welcome', kind: 'flow', transitions: 6, status: 'Ready', note: 'Spring 260/26 · fade-through' },
  { id: 'PR-02', name: 'Checkout · payment sheet', kind: 'overlay', transitions: 4, status: 'Shared', note: 'Slide-up · drag-to-dismiss' },
  { id: 'PR-03', name: 'Home · pull to refresh', kind: 'screen', transitions: 3, status: 'Draft', note: 'Rubber-band · scroll trigger' },
  { id: 'PR-04', name: 'Settings · theme toggle', kind: 'screen', transitions: 2, status: 'Ready', note: 'Cross-fade · 240ms' },
  { id: 'PR-05', name: 'Gallery · pinch zoom', kind: 'overlay', transitions: 5, status: 'Draft', note: 'Gesture-driven · shared element' },
]

const STATUS_STYLE: Record<Row['status'], string> = {
  Ready: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/25',
  Draft: 'text-amber-700 bg-amber-500/10 border-amber-500/25',
  Shared: 'text-indigo-700 bg-indigo-500/10 border-indigo-500/25',
}

const FEED_SEED = [
  'Screen “Checkout” linked to “Confirmation”',
  'Spring tuned on primary CTA · 260 / 26',
  'Shared link opened by 3 reviewers',
  'Component “Button” synced from Figma',
]
const FEED_POOL = [
  'Drag-to-dismiss added to payment sheet',
  'Easing changed to easeOutExpo on hero',
  'New device preview: iPhone 15 Pro',
  'Handoff spec exported for “Onboarding”',
  'Scroll trigger wired on gallery',
]

/* ------------------------------ component ------------------------------ */

export default function DashboardPreview() {
  const [view, setView] = useState<ViewId>('overview')
  const [range, setRange] = useState<Range>('7d')
  const [paletteOpen, setPaletteOpen] = useState(false)

  const go = (id: ViewId) => {
    setView(id)
    playUISound('tab')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
      if (e.key === 'Escape') setPaletteOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const current = NAV.find((n) => n.id === view)!

  return (
    <section id={SECTIONS.workspace} className="relative border-t border-slate-200/70 py-24 text-slate-900">
      <Container>
        <SectionHeading
          tone="light"
          eyebrow="The Workspace"
          title="Where prototypes come together."
          description="A working slice of the real product — route the sidebar, press ⌘K to jump anywhere, switch the time range, inspect a flow. It behaves like software, not a screenshot."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-2xl shadow-slate-900/5 backdrop-blur-xl"
        >
          {/* window chrome */}
          <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-300" />
                <span className="h-3 w-3 rounded-full bg-yellow-300" />
                <span className="h-3 w-3 rounded-full bg-green-300" />
              </span>
              <span className="ml-2 border-l border-slate-200 pl-3 text-slate-400">
                kinetic / {current.label.toLowerCase()}
              </span>
            </div>
            <button
              onClick={() => {
                setPaletteOpen(true)
                playUISound('scan')
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-500 transition-colors duration-300 hover:border-slate-300 hover:text-slate-700"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="ml-1 hidden items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 sm:flex">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
            {/* sidebar */}
            <aside className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50/50 p-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r">
              {NAV.map((n) => {
                const Icon = n.icon
                const active = view === n.id
                return (
                  <button
                    key={n.id}
                    onClick={() => go(n.id)}
                    className={cn(
                      'relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-300',
                      active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="consoleNav"
                        className="absolute inset-0 rounded-xl border border-indigo-500/30 bg-indigo-500/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon className={cn('relative h-4 w-4', active ? 'text-indigo-600' : '')} />
                    <span className="relative">{n.label}</span>
                  </button>
                )
              })}

              <div className="mt-auto hidden rounded-xl border border-slate-200 bg-white p-3 lg:block">
                <p className="text-xs text-slate-500">Preview health</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-600">60 FPS</span>
                  <span className="font-mono text-[10px] text-slate-400">smooth</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '96%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-linear-to-r from-indigo-500 to-cyan-400"
                  />
                </div>
              </div>
            </aside>

            {/* main */}
            <div className="min-w-0 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{current.label}</h3>
                  <p className="text-xs text-slate-500">Live workspace · updated just now</p>
                </div>
                {view === 'overview' && (
                  <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                    {RANGES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setRange(r.id)
                          playUISound('toggle')
                        }}
                        className={cn(
                          'relative rounded-full px-3.5 py-1.5 text-xs transition-colors duration-300',
                          range === r.id ? 'text-white' : 'text-slate-500 hover:text-slate-800',
                        )}
                      >
                        {range === r.id && (
                          <motion.span
                            layoutId="rangePill"
                            className="absolute inset-0 rounded-full bg-slate-900"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span className="relative">{r.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 min-h-[430px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {view === 'overview' && <Overview range={range} />}
                    {view === 'prototypes' && <Prototypes />}
                    {view === 'components' && <Components />}
                    {view === 'flows' && <Flows />}
                    {view === 'handoff' && <Handoff />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <CommandPalette
            open={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            onPick={(id) => {
              setView(id)
              setPaletteOpen(false)
              playUISound('select')
            }}
          />
        </motion.div>
      </Container>
    </section>
  )
}

/* ------------------------------ primitives ----------------------------- */

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  )
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn('rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5', className)}
    >
      {children}
    </motion.div>
  )
}

/* -------------------------------- views -------------------------------- */

function Overview({ range }: { range: Range }) {
  return (
    <div className="space-y-5">
      <Panel className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS[range].map((k) => (
          <Card key={k.label}>
            <p className="text-xs text-slate-500">{k.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900">
              <CountUp value={k.value} />
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className={cn('text-xs', k.delta >= 0 ? 'text-emerald-600' : 'text-rose-500')}>
                {k.delta >= 0 ? '▲' : '▼'} {Math.abs(k.delta)}%
              </span>
            </div>
            <Sparkline data={k.spark} positive={k.delta >= 0} />
          </Card>
        ))}
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Preview sessions</p>
            <span className="flex items-center gap-1 font-mono text-xs text-indigo-600">
              <TrendingUp className="h-3.5 w-3.5" /> {range}
            </span>
          </div>
          <div className="h-52">
            <AreaChart data={SERIES[range]} rangeKey={range} />
          </div>
        </Card>
        <Card>
          <p className="mb-4 text-sm font-medium text-slate-700">Interaction mix</p>
          <Donut />
        </Card>
      </div>

      <Card>
        <p className="mb-3 text-sm font-medium text-slate-700">Activity</p>
        <ActivityFeed />
      </Card>
    </div>
  )
}

function Prototypes() {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<Row | null>(null)
  const rows = ROWS.filter(
    (r) => !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.id.toLowerCase().includes(q.toLowerCase()) || r.status.toLowerCase().includes(q.toLowerCase()),
  )
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-colors focus-within:border-indigo-400">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter prototypes…"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-400">No prototypes match “{q}”.</p>}
          {rows.map((r, i) => {
            const active = selected?.id === r.id
            return (
              <motion.button
                key={r.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  setSelected(active ? null : r)
                  playUISound('scan')
                }}
                className={cn('flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm transition-colors duration-200 last:border-0', active ? 'bg-indigo-500/10' : 'hover:bg-slate-50')}
              >
                <div className="min-w-0">
                  <p className="truncate text-slate-800">{r.name}</p>
                  <p className="font-mono text-xs text-slate-400">{r.id} · {r.transitions} transitions</p>
                </div>
                <span className={cn('shrink-0 rounded-full border px-2.5 py-1 text-[11px]', STATUS_STYLE[r.status])}>{r.status}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected?.id ?? 'empty'}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-indigo-600">{selected.id}</span>
                <span className={cn('rounded-full border px-2.5 py-1 text-[11px]', STATUS_STYLE[selected.status])}>{selected.status}</span>
              </div>
              <dl className="space-y-2 text-xs">
                {[
                  ['Name', selected.name],
                  ['Type', selected.kind],
                  ['Transitions', String(selected.transitions)],
                  ['Motion', selected.note],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-right font-mono text-slate-700">{v}</dd>
                  </div>
                ))}
              </dl>
              <button onClick={() => playUISound('trigger')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2 text-xs font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-95">
                <Play className="h-3.5 w-3.5" /> Open preview
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center text-slate-400">
              <MonitorSmartphone className="h-6 w-6" />
              <p className="mt-2 text-sm">Select a prototype to inspect its motion.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Components() {
  const [busy, setBusy] = useState<string | null>(null)
  const comps = [
    { id: 'button', name: 'Button', instances: 128, usage: 96 },
    { id: 'sheet', name: 'Bottom sheet', instances: 42, usage: 78 },
    { id: 'card', name: 'Card', instances: 210, usage: 88 },
  ]
  return (
    <Panel className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {comps.map((m) => {
        const running = busy === m.id
        return (
          <Card key={m.id}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-900">{m.name}</p>
              <span className="rounded-full border border-slate-200 px-2 py-0.5 font-mono text-[10px] text-slate-500">{m.instances}×</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{running ? 'Syncing from Figma…' : 'In sync'}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Adoption</span>
              <span className="font-mono text-slate-700">{m.usage}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.usage}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full bg-linear-to-r from-indigo-500 to-cyan-400" />
            </div>
            <button
              onClick={() => {
                setBusy(m.id)
                playUISound('trigger')
                setTimeout(() => setBusy((b) => (b === m.id ? null : b)), 2200)
              }}
              disabled={running}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs text-slate-700 transition-colors duration-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" />
              {running ? 'Working…' : 'Sync'}
            </button>
          </Card>
        )
      })}
    </Panel>
  )
}

function Flows() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ reduce: true, haptics: false, autoAdvance: true })
  const rules = [
    { id: 'reduce', name: 'Reduced-motion fallback', desc: 'Respect the OS “reduce motion” setting' },
    { id: 'haptics', name: 'Haptics on tap', desc: 'Fire a light impact on primary actions' },
    { id: 'autoAdvance', name: 'Auto-advance demo', desc: 'Loop the flow for unattended playback' },
  ]
  return (
    <Panel className="space-y-3">
      {rules.map((r) => {
        const on = prefs[r.id]
        return (
          <motion.div key={r.id} variants={rise} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm text-slate-900">{r.name}</p>
              <p className="text-xs text-slate-500">{r.desc}</p>
            </div>
            <button
              onClick={() => {
                setPrefs((p) => ({ ...p, [r.id]: !p[r.id] }))
                playUISound('toggle')
              }}
              className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300', on ? 'bg-indigo-500' : 'bg-slate-300')}
              aria-pressed={on}
            >
              <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 34 }} className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow', on ? 'right-0.5' : 'left-0.5')} />
            </button>
          </motion.div>
        )
      })}
    </Panel>
  )
}

function Handoff() {
  const items = [
    { name: 'Interaction spec · Onboarding', date: 'Jul 21, 2026', size: '1.2 MB' },
    { name: 'Motion tokens · JSON', date: 'Jul 20, 2026', size: '18 KB' },
    { name: 'React snippets · Checkout', date: 'Jul 18, 2026', size: '96 KB' },
  ]
  return (
    <Panel className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {items.map((r) => (
        <motion.div key={r.name} variants={rise} className="flex items-center justify-between border-b border-slate-100 px-4 py-4 text-sm transition-colors duration-200 last:border-0 hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <Share2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-slate-800">{r.name}</p>
              <p className="text-xs text-slate-400">{r.date} · {r.size}</p>
            </div>
          </div>
          <button onClick={() => playUISound('click')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition-colors duration-300 hover:bg-slate-50 hover:text-slate-900">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </motion.div>
      ))}
    </Panel>
  )
}

/* ------------------------------- charts -------------------------------- */

function buildPath(data: number[], w: number, h: number, pad = 6) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const step = (w - pad * 2) / (data.length - 1)
  return data
    .map((v, i) => {
      const x = pad + i * step
      const y = h - pad - ((v - min) / span) * (h - pad * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function AreaChart({ data, rangeKey }: { data: number[]; rangeKey: string }) {
  const w = 640
  const h = 220
  const line = buildPath(data, w, h)
  const area = `${line} L${w - 6} ${h - 6} L6 ${h - 6} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fillL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="strokeL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="6" y1={h * g} x2={w - 6} y2={h * g} stroke="rgba(15,23,42,0.06)" strokeWidth="1" />
      ))}
      <motion.path key={`a-${rangeKey}`} d={area} fill="url(#fillL)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} />
      <motion.path key={`l-${rangeKey}`} d={line} fill="none" stroke="url(#strokeL)" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
    </svg>
  )
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const path = buildPath(data, 120, 34, 3)
  return (
    <svg viewBox="0 0 120 34" className="mt-2 h-8 w-full">
      <motion.path d={path} fill="none" stroke={positive ? '#6366f1' : '#f43f5e'} strokeWidth="1.8" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0.4 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} />
    </svg>
  )
}

function Donut() {
  const total = DISTRIBUTION.reduce((s, d) => s + d.value, 0)
  const r = 52
  const c = 2 * Math.PI * r
  const round = (n: number) => Math.round(n * 100) / 100
  let offset = 0
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 140 140" className="h-32 w-32 -rotate-90">
        {DISTRIBUTION.map((d) => {
          const frac = d.value / total
          const seg = (
            <motion.circle key={d.label} cx="70" cy="70" r={r} fill="none" stroke={d.color} strokeWidth="14" strokeDasharray={`${round(frac * c)} ${round(c)}`} strokeDashoffset={-round(offset)} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
          )
          offset += frac * c
          return seg
        })}
      </svg>
      <ul className="space-y-2">
        {DISTRIBUTION.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-500">{d.label}</span>
            <span className="ml-auto tabular-nums text-slate-800">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ActivityFeed() {
  type FeedItem = { id: number; text: string }
  const [items, setItems] = useState<FeedItem[]>(() => FEED_SEED.map((text, i) => ({ id: i, text })))
  const nextId = useRef(FEED_SEED.length)
  useEffect(() => {
    const t = setInterval(() => {
      setItems((prev) => {
        const text = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)]
        return [{ id: nextId.current++, text }, ...prev].slice(0, 5)
      })
    }, 3600)
    return () => clearInterval(t)
  }, [])
  return (
    <ul className="relative space-y-2" style={{ minHeight: 5 * 40 }}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ layout: { type: 'spring', stiffness: 500, damping: 40 }, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-600"
          >
            <Activity className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
            <span className="truncate">{item.text}</span>
            <span className="ml-auto shrink-0 font-mono text-[10px] text-slate-400">now</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

/* --------------------------- command palette --------------------------- */

function CommandPalette({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (id: ViewId) => void }) {
  const [q, setQ] = useState('')
  const [hi, setHi] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo(() => NAV.filter((n) => n.label.toLowerCase().includes(q.toLowerCase())), [q])

  useEffect(() => {
    if (open) {
      setQ('')
      setHi(0)
      setTimeout(() => inputRef.current?.focus(), 20)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHi((h) => Math.min(results.length - 1, h + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHi((h) => Math.max(0, h - 1))
      } else if (e.key === 'Enter' && results[hi]) {
        onPick(results[hi].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, hi, onPick])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 z-30 flex items-start justify-center bg-slate-900/20 p-6 pt-20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <Command className="h-4 w-4 text-indigo-600" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setHi(0)
                }}
                placeholder="Jump to…"
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
              <button onClick={onClose} className="text-slate-400 transition-colors hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto p-2">
              {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-400">No matches.</li>}
              {results.map((n, i) => {
                const Icon = n.icon
                return (
                  <li key={n.id}>
                    <button
                      onMouseEnter={() => setHi(i)}
                      onClick={() => onPick(n.id)}
                      className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors', i === hi ? 'bg-indigo-500/10 text-slate-900' : 'text-slate-600 hover:bg-slate-50')}
                    >
                      <Icon className={cn('h-4 w-4', i === hi ? 'text-indigo-600' : 'text-slate-400')} />
                      Go to {n.label}
                      <ArrowRight className={cn('ml-auto h-3.5 w-3.5', i === hi ? 'text-indigo-600' : 'text-slate-300')} />
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
