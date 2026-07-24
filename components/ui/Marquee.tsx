'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Seamless horizontal marquee (content duplicated for a gapless loop). */
export default function Marquee({
  items,
  duration = 28,
  className,
}: {
  items: string[]
  duration?: number
  className?: string
}) {
  const row = [...items, ...items]
  return (
    <div
      className={cn(
        'group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]',
        className,
      )}
    >
      <motion.div
        className="flex w-max gap-10 pr-10"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {row.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-3 whitespace-nowrap font-mono text-sm uppercase tracking-[0.2em] text-zinc-500"
          >
            <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
