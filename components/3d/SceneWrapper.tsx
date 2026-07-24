'use client'

import dynamic from 'next/dynamic'
import { Suspense, ReactNode } from 'react'
import type { CanvasProps } from '@react-three/fiber'

// Dynamically import Three.js Canvas with SSR disabled
const CanvasWrapper = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
)

interface SceneWrapperProps extends Partial<CanvasProps> {
  children: ReactNode
  className?: string
}

export default function SceneWrapper({ children, className = '', ...props }: SceneWrapperProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Suspense fallback={null}>
        <CanvasWrapper {...props}>
          {children}
        </CanvasWrapper>
      </Suspense>
    </div>
  )
}