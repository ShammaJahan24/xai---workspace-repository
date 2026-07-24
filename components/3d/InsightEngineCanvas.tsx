'use client'

import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

export const NODE_COUNT = 200
export const CLUSTER_COUNT = 4
export const ANOMALY_COUNT = 8

const CLUSTER_COLORS = ['#22d3ee', '#818cf8', '#34d399', '#a78bfa']
const RAW_COLOR = '#3f6f7a'
const ANOMALY_COLOR = '#f472b6'

function rand(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

type Props = {
  /** 0 = raw scatter, 1 = fully resolved clusters. */
  progress: RefObject<number>
  /** Drag-driven rotation, radians. */
  rotation: RefObject<{ x: number; y: number }>
}

export default function InsightEngineCanvas({ progress, rotation }: Props) {
  const group = useRef<THREE.Group>(null)
  const cores = useRef<THREE.InstancedMesh>(null)
  const halos = useRef<THREE.InstancedMesh>(null)
  const hubs = useRef<THREE.InstancedMesh>(null)
  const pulses = useRef<THREE.InstancedMesh>(null)
  const lineGeo = useRef<THREE.BufferGeometry>(null)

  const data = useMemo(() => {
    const raw = new Float32Array(NODE_COUNT * 3)
    const resolved = new Float32Array(NODE_COUNT * 3)
    const rawCol = new THREE.Color(RAW_COLOR)
    const targetCol: THREE.Color[] = []
    const isAnomaly: boolean[] = []
    const clusterOf: number[] = []
    const centers: THREE.Vector3[] = []
    let anomaliesSoFar = 0

    for (let c = 0; c < CLUSTER_COUNT; c++) {
      const a = (c / CLUSTER_COUNT) * Math.PI * 2
      centers.push(new THREE.Vector3(Math.cos(a) * 4.6, Math.sin(a) * 3.2, (rand(c) - 0.5) * 1.6))
    }

    const linePos = new Float32Array(NODE_COUNT * 2 * 3)

    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3
      const r = 4.8 * Math.cbrt(rand(i + 1))
      const theta = rand(i + 2) * Math.PI * 2
      const phi = Math.acos(2 * rand(i + 3) - 1)
      raw[i3] = r * Math.sin(phi) * Math.cos(theta)
      raw[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      raw[i3 + 2] = r * Math.cos(phi)

      const anomaly = i % 13 === 0 && anomaliesSoFar < ANOMALY_COUNT
      if (anomaly) anomaliesSoFar++
      isAnomaly.push(anomaly)

      if (anomaly) {
        resolved[i3] = (rand(i + 7) - 0.5) * 4
        resolved[i3 + 1] = 4.6 + rand(i + 8) * 1.4
        resolved[i3 + 2] = 1.8 + rand(i + 9) * 1.4
        targetCol.push(new THREE.Color(ANOMALY_COLOR))
        clusterOf.push(-1)
      } else {
        const c = i % CLUSTER_COUNT
        const center = centers[c]
        resolved[i3] = center.x + (rand(i + 4) - 0.5) * 1.8
        resolved[i3 + 1] = center.y + (rand(i + 5) - 0.5) * 1.8
        resolved[i3 + 2] = center.z + (rand(i + 6) - 0.5) * 1.8
        targetCol.push(new THREE.Color(CLUSTER_COLORS[c]))
        clusterOf.push(c)
      }
    }

    return { raw, resolved, rawCol, targetCol, isAnomaly, clusterOf, centers, linePos }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const tmpColor = useMemo(() => new THREE.Color(), [])
  const haloColor = useMemo(() => new THREE.Color('#1b8fa8'), [])
  const hub = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const p = progress.current ?? 0
    const e = p * p * (3 - 2 * p) // smoothstep
    const core = cores.current
    const halo = halos.current
    const pulse = pulses.current
    if (!core || !halo) return

    const lp = data.linePos

    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3
      const anomaly = data.isAnomaly[i]

      let x = data.raw[i3] + (data.resolved[i3] - data.raw[i3]) * e
      let y = data.raw[i3 + 1] + (data.resolved[i3 + 1] - data.raw[i3 + 1]) * e
      let z = data.raw[i3 + 2] + (data.resolved[i3 + 2] - data.raw[i3 + 2]) * e

      const fl = 0.12 * (1 - e * 0.6)
      x += Math.sin(t * 0.8 + i) * fl
      y += Math.cos(t * 0.7 + i * 1.3) * fl

      // core
      dummy.position.set(x, y, z)
      const grow = anomaly ? 1 + e * 1.9 : 1
      const breathe = anomaly ? 1 + Math.sin(t * 3 + i) * 0.14 * e : 1
      const s = 0.1 * grow * breathe
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      core.setMatrixAt(i, dummy.matrix)
      tmpColor.copy(data.rawCol).lerp(data.targetCol[i], e)
      if (anomaly) tmpColor.multiplyScalar(1 + e * 0.5)
      core.setColorAt(i, tmpColor)

      // halo (glow)
      dummy.scale.setScalar(s * (anomaly ? 4.2 : 2.6))
      dummy.updateMatrix()
      halo.setMatrixAt(i, dummy.matrix)

      // connection node -> hub (clusters only; anomalies stay detached)
      if (anomaly) {
        // zero-length -> invisible line
        lp[i * 6] = x; lp[i * 6 + 1] = y; lp[i * 6 + 2] = z
        lp[i * 6 + 3] = x; lp[i * 6 + 4] = y; lp[i * 6 + 5] = z
      } else {
        hub.copy(data.centers[data.clusterOf[i]])
        const hx = data.raw[i3] + (hub.x - data.raw[i3]) * e
        const hy = data.raw[i3 + 1] + (hub.y - data.raw[i3 + 1]) * e
        const hz = data.raw[i3 + 2] + (hub.z - data.raw[i3 + 2]) * e
        lp[i * 6] = x; lp[i * 6 + 1] = y; lp[i * 6 + 2] = z
        lp[i * 6 + 3] = hx; lp[i * 6 + 4] = hy; lp[i * 6 + 5] = hz
      }

      // travelling light pulse toward the hub (only once resolving)
      if (pulse) {
        if (!anomaly && e > 0.45) {
          const ph = (t * 0.55 + rand(i + 11)) % 1
          const px = x + (hub.x - x) * ph
          const py = y + (hub.y - y) * ph
          const pz = z + (hub.z - z) * ph
          dummy.position.set(px, py, pz)
          dummy.scale.setScalar(0.07 * e * Math.sin(ph * Math.PI))
          dummy.updateMatrix()
          pulse.setMatrixAt(i, dummy.matrix)
        } else {
          dummy.scale.setScalar(0.0001)
          dummy.updateMatrix()
          pulse.setMatrixAt(i, dummy.matrix)
        }
      }
    }

    core.instanceMatrix.needsUpdate = true
    if (core.instanceColor) core.instanceColor.needsUpdate = true
    halo.instanceMatrix.needsUpdate = true
    if (pulse) pulse.instanceMatrix.needsUpdate = true
    if (lineGeo.current) {
      const attr = lineGeo.current.getAttribute('position') as THREE.BufferAttribute | undefined
      if (attr) attr.needsUpdate = true
    }

    // hub cores pulse + grow as clusters form
    const hb = hubs.current
    if (hb) {
      for (let c = 0; c < CLUSTER_COUNT; c++) {
        const center = data.centers[c]
        dummy.position.copy(center)
        const hs = (0.18 + e * 0.5) * (1 + Math.sin(t * 2 + c) * 0.12 * e)
        dummy.scale.setScalar(hs)
        dummy.updateMatrix()
        hb.setMatrixAt(c, dummy.matrix)
        tmpColor.set(CLUSTER_COLORS[c])
        hb.setColorAt(c, tmpColor)
      }
      hb.instanceMatrix.needsUpdate = true
      if (hb.instanceColor) hb.instanceColor.needsUpdate = true
    }

    if (group.current) {
      const g = group.current
      const target = rotation.current ?? { x: 0, y: 0 }
      g.rotation.y += (target.y + t * 0.05 - g.rotation.y) * 0.08
      g.rotation.x += (target.x - g.rotation.x) * 0.08
    }
  })

  return (
    <>
      {/* cosmic backdrop */}
      <Stars radius={80} depth={50} count={1400} factor={4} saturation={0} fade speed={0.6} />

      <group ref={group}>
        {/* connections */}
        <lineSegments>
          <bufferGeometry ref={lineGeo}>
            <bufferAttribute attach="attributes-position" args={[data.linePos, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#22d3ee" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>

        {/* glow halos */}
        <instancedMesh ref={halos} args={[undefined, undefined, NODE_COUNT]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={haloColor} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </instancedMesh>

        {/* node cores */}
        <instancedMesh ref={cores} args={[undefined, undefined, NODE_COUNT]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>

        {/* cluster hub cores */}
        <instancedMesh ref={hubs} args={[undefined, undefined, CLUSTER_COUNT]}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshBasicMaterial transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </instancedMesh>

        {/* travelling light pulses */}
        <instancedMesh ref={pulses} args={[undefined, undefined, NODE_COUNT]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#cdf5ff" transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </instancedMesh>
      </group>
    </>
  )
}
