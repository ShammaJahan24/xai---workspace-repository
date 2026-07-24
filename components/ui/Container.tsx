import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

/** Centered max-width shell used by every section for consistent gutters. */
export default function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}
