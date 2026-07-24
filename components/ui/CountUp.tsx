'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/** Animates the numeric part of a value (e.g. "2.4M", "1,208", "38ms"). */
export default function CountUp({ value, duration = 1.2 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState('0')

  const match = value.match(/^([^\d.-]*)([\d,.]+)(.*)$/)
  const prefix = match?.[1] ?? ''
  const raw = match?.[2] ?? '0'
  const suffix = match?.[3] ?? ''
  const target = parseFloat(raw.replace(/,/g, ''))
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
  const grouped = raw.includes(',')

  useEffect(() => {
    if (!inView) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      const n = target * eased
      setDisplay(grouped ? Math.round(n).toLocaleString() : n.toFixed(decimals))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, target, decimals, grouped, duration])

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
