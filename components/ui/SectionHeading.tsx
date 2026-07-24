'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import Badge from '@/components/ui/Badge'
import { useTheme } from '@/components/theme/ThemeProvider'
import { cn } from '@/lib/utils'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

type Props = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
  pulse?: boolean
  /** Optional override — by default the heading follows the global theme. */
  tone?: 'dark' | 'light'
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

/** Eyebrow badge + title + description with a staggered reveal. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  pulse = true,
  tone,
}: Props) {
  const { theme } = useTheme()
  const resolvedTone = tone ?? theme
  const centered = align === 'center'
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={cn(centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl', className)}
    >
      <motion.div variants={item} className={cn(centered && 'flex justify-center')}>
        <Badge pulse={pulse} tone={resolvedTone}>{eyebrow}</Badge>
      </motion.div>
      <motion.h2
        variants={item}
        className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-4xl md:text-5xl"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={item}
          className={cn('mt-4 max-w-xl text-slate-600 dark:text-zinc-400', centered && 'mx-auto')}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}
