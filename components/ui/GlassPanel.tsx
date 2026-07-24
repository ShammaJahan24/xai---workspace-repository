import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/** Standard frosted surface used for cards, decks and panels. */
export default function GlassPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-2xl',
        className,
      )}
    >
      {children}
    </div>
  )
}
