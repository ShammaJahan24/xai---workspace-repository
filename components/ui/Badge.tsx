import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  className?: string
  dot?: boolean
  pulse?: boolean
  tone?: 'dark' | 'light'
}

/** Small mono chip used to head sections and mark statuses. */
export default function Badge({ children, className, dot = true, pulse = false, tone = 'dark' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs',
        tone === 'dark'
          ? 'border-cyan-500/20 bg-cyan-950/40 text-cyan-400'
          : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600',
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            tone === 'dark' ? 'bg-cyan-400' : 'bg-indigo-500',
            pulse && 'animate-ping',
          )}
        />
      )}
      {children}
    </span>
  )
}
