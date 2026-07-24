'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ambientEngine } from '@/lib/ambientSound'

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123
  return x - Math.floor(x)
}

export default function DataTransformationCanvas({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const count = 3200
  const pointsRef = useRef<THREE.Points>(null)
  
  const lastMousePos = useRef({ x: 0, y: 0 })
  const handOffset = useRef({ x: 0, y: 0 }) 
  const morphProgress = useRef(0)
  const lastMoveTime = useRef(0) 
  
  const historyLength = 100 
  const mouseHistory = useRef(new Array(historyLength).fill({ x: 0, y: 0 }))

  const gridCols = 8
  const gridRows = 8
  const ropesCount = gridCols * gridRows
  const dotsPerRope = Math.floor(count / ropesCount) 

  const initialData = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const rope = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)

    const spacingX = 2.5 
    const spacingY = 2.5 
    const depthSpan = 15.0 

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Chaotic scattered positions
      pos[i3] = (pseudoRandom(i * 3 + 1) - 0.5) * 20.0
      pos[i3 + 1] = (pseudoRandom(i * 3 + 2) - 0.5) * 20.0
      pos[i3 + 2] = (pseudoRandom(i * 3 + 3) - 0.5) * 20.0

      const ropeIndex = Math.floor(i / dotsPerRope)
      const dotInRopeIndex = i % dotsPerRope
      const col = ropeIndex % gridCols
      const row = Math.floor(ropeIndex / gridCols)

      rope[i3] = (col - (gridCols - 1) / 2) * spacingX
      rope[i3 + 1] = (row - (gridRows - 1) / 2) * spacingY
      rope[i3 + 2] = 2.0 - (dotInRopeIndex / (dotsPerRope - 1)) * depthSpan

      // start near the indigo base so points read on the light hero
      cols[i3] = 0.39
      cols[i3 + 1] = 0.4
      cols[i3 + 2] = 0.95
    }

    return { positions: pos, ropeBase: rope, colors: cols }
  }, [count, dotsPerRope, gridCols, gridRows])

  const physicsRef = useRef<{ positions: Float32Array, velocities: Float32Array } | null>(null)

  const dotTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)')
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 64, 64)
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Light-mode palette: darker inks so particles read on the light hero.
  const baseColor = useMemo(() => new THREE.Color('#6366f1'), [])
  const tensionColor1 = useMemo(() => new THREE.Color('#0891b2'), [])
  const tensionColor2 = useMemo(() => new THREE.Color('#7c3aed'), [])

  useFrame((state) => {
    if (!pointsRef.current) return

    if (!physicsRef.current) {
      const vel = new Float32Array(count * 3)
      const bouncingPos = new Float32Array(initialData.positions) 
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        vel[i3] = (pseudoRandom(i * 4 + 1) - 0.5) * 0.08
        vel[i3 + 1] = (pseudoRandom(i * 4 + 2) - 0.5) * 0.08
        vel[i3 + 2] = (pseudoRandom(i * 4 + 3) - 0.5) * 0.08
      }
      physicsRef.current = { positions: bouncingPos, velocities: vel }
    }

    const { pointer, clock } = state
    const geo = pointsRef.current.geometry
    
    const currentPos = geo.attributes.position.array as Float32Array
    const currentCols = geo.attributes.color.array as Float32Array

    const physics = physicsRef.current
    const bPos = physics.positions
    const bVel = physics.velocities
    const ropeBase = initialData.ropeBase

    const currentMousePos = { x: pointer.x * 5.0, y: pointer.y * 5.0 }
    const dx = currentMousePos.x - lastMousePos.current.x
    const dy = currentMousePos.y - lastMousePos.current.y
    lastMousePos.current = currentMousePos

    const mouseSpeed = Math.sqrt(dx * dx + dy * dy)
    
    if (mouseSpeed > 0.005) {
      lastMoveTime.current = clock.elapsedTime
    }

    handOffset.current.x += dx * 25.0
    handOffset.current.y += dy * 25.0
    handOffset.current.x *= 0.4
    handOffset.current.y *= 0.4

    const timeSinceMove = clock.elapsedTime - lastMoveTime.current
    const isAwake = timeSinceMove < 3.0
    const targetMorph = isAwake ? 1.0 : 0.0
    
    // DIFFERENTIATED MORPH SPEED: Fast to assemble, very slow and smooth to drift back to chaos
    const morphSpeed = isAwake ? 0.05 : 0.015
    morphProgress.current += (targetMorph - morphProgress.current) * morphSpeed
    const morph = morphProgress.current

    // CALCULATE SHAKE INTENSITY (0.5 sec window right before chaos)
    let shakeIntensity = 0
    if (timeSinceMove > 2.5 && timeSinceMove <= 3.0) {
      // Normalizes 2.5s -> 3.0s into a 0.0 to 1.0 progress
      const shakeProgress = (timeSinceMove - 2.5) / 0.5
      // Exponential curve for a dramatic build-up
      shakeIntensity = Math.pow(shakeProgress, 2) * 0.4 
    }

    ambientEngine.updateOrganization(morph)

    mouseHistory.current.unshift({ x: handOffset.current.x, y: handOffset.current.y })
    while (mouseHistory.current.length > historyLength) {
      mouseHistory.current.pop()
    }

    const boundingBox = 12.0

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Process slow-moving background chaos particles
      bPos[i3] += bVel[i3]
      bPos[i3 + 1] += bVel[i3 + 1]
      bPos[i3 + 2] += bVel[i3 + 2]

      if (Math.abs(bPos[i3]) > boundingBox) bVel[i3] *= -1
      if (Math.abs(bPos[i3 + 1]) > boundingBox) bVel[i3 + 1] *= -1
      if (Math.abs(bPos[i3 + 2]) > boundingBox) bVel[i3 + 2] *= -1

      const dotInRopeIndex = i % dotsPerRope
      const zRatio = dotInRopeIndex / (dotsPerRope - 1)

      const exactHistoryIndex = zRatio * (historyLength - 1)
      const idx1 = Math.floor(exactHistoryIndex)
      const idx2 = Math.min(historyLength - 1, idx1 + 1)
      const t = exactHistoryIndex - idx1 

      const hist1 = mouseHistory.current[idx1] || { x: 0, y: 0 }
      const hist2 = mouseHistory.current[idx2] || { x: 0, y: 0 }

      const smoothX = THREE.MathUtils.lerp(hist1.x, hist2.x, t)
      const smoothY = THREE.MathUtils.lerp(hist1.y, hist2.y, t)

      const waveClamp = 1.0 - Math.pow(zRatio, 6.0) 
      
      const offsetX = smoothX * waveClamp
      const offsetY = smoothY * waveClamp
      
      // AMPLITUDE-BASED COLOR
      const amplitude = Math.sqrt(offsetX * offsetX + offsetY * offsetY)

      // ATOMIC VIBRATION OFFSET
      let shakeX = 0, shakeY = 0, shakeZ = 0
      if (shakeIntensity > 0) {
        shakeX = (Math.random() - 0.5) * shakeIntensity
        shakeY = (Math.random() - 0.5) * shakeIntensity
        shakeZ = (Math.random() - 0.5) * shakeIntensity
      }

      // Add shaking offset into the target resting position
      const targetRopeX = ropeBase[i3] + offsetX + shakeX
      const targetRopeY = ropeBase[i3 + 1] + offsetY + shakeY
      const targetRopeZ = ropeBase[i3 + 2] + shakeZ

      currentPos[i3] = THREE.MathUtils.lerp(bPos[i3], targetRopeX, morph)
      currentPos[i3 + 1] = THREE.MathUtils.lerp(bPos[i3 + 1], targetRopeY, morph)
      currentPos[i3 + 2] = THREE.MathUtils.lerp(bPos[i3 + 2], targetRopeZ, morph)

      const activeColor = new THREE.Color()
      
      if (amplitude > 1.5) {
        activeColor.copy(tensionColor1).lerp(tensionColor2, Math.min(1.0, (amplitude - 1.5) * 0.4))
      } else {
        activeColor.copy(baseColor).lerp(tensionColor1, amplitude / 1.5)
      }

      const finalR = THREE.MathUtils.lerp(baseColor.r, activeColor.r, morph)
      const finalG = THREE.MathUtils.lerp(baseColor.g, activeColor.g, morph)
      const finalB = THREE.MathUtils.lerp(baseColor.b, activeColor.b, morph)

      currentCols[i3] += (finalR - currentCols[i3]) * 0.1
      currentCols[i3 + 1] += (finalG - currentCols[i3 + 1]) * 0.1
      currentCols[i3 + 2] += (finalB - currentCols[i3 + 2]) * 0.1
    }

    geo.attributes.position.needsUpdate = true
    geo.attributes.color.needsUpdate = true

    pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, pointer.x * 0.15 * morph, 0.1)
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, -pointer.y * 0.15 * morph, 0.1)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[initialData.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[initialData.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        map={dotTexture}
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.NormalBlending}
        sizeAttenuation
      />
    </points>
  )
}