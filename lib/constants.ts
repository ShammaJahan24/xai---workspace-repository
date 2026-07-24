// Central site config: nav, section anchors, theme map, copy.

export const SITE = {
  name: 'XAI',
  product: 'Intelligence Workspace',
  description:
    'XAI is a high-fidelity intelligence workspace. Import your screens, wire real motion and logic, preview on-device, and hand off — with timing and easing you can actually feel.',
}

/** Section anchor ids, referenced by the navbar and each <section id>. */
export const SECTIONS = {
  overview: 'overview',
  flow: 'flow',
  workspace: 'workspace',
  lab: 'lab',
} as const

export type Theme = 'light' | 'dark'

export const NAV_LINKS = [
  { href: `#${SECTIONS.flow}`, label: 'How it works' },
  { href: `#${SECTIONS.workspace}`, label: 'Workspace' },
  { href: `#${SECTIONS.lab}`, label: 'Motion Lab' },
]
