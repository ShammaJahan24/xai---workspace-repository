import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

const base =
  'group/btn inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer motion-reduce:transform-none motion-reduce:transition-none'

const variants: Record<Variant, string> = {
  primary: 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-lg shadow-white/5 hover:shadow-xl hover:shadow-cyan-500/10',
  secondary:
    'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-600',
  ghost: 'text-zinc-300 hover:text-white hover:bg-white/5',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
}

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  /** When set, renders an <a> instead of a <button>. */
  href?: string
}

/** Renders an <a> when `href` is given, otherwise a <button>. */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  href,
  ...rest
}: Props) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
