'use client'

/**
 * Shared UI sound engine.
 *
 * Previously the same Web Audio synth was copy-pasted into DashboardPreview,
 * SignatureInteraction and Footer. This centralises every blip into one place
 * and reuses a single AudioContext instead of leaking a new one per click.
 */

export type SoundType =
  | 'tab'
  | 'click'
  | 'toggle'
  | 'trigger'
  | 'scan'
  | 'align'
  | 'scatter'
  | 'select'
  | 'typing'
  | 'hover'
  | 'top'

type Envelope = {
  wave: OscillatorType
  from: number
  to: number
  gain: number
  dur: number
}

const ENVELOPES: Record<SoundType, Envelope> = {
  tab: { wave: 'sine', from: 620, to: 280, gain: 0.38, dur: 0.05 },
  click: { wave: 'sine', from: 720, to: 220, gain: 0.35, dur: 0.045 },
  toggle: { wave: 'sine', from: 900, to: 350, gain: 0.3, dur: 0.035 },
  trigger: { wave: 'triangle', from: 520, to: 1040, gain: 0.35, dur: 0.12 },
  scan: { wave: 'sine', from: 1200, to: 400, gain: 0.3, dur: 0.04 },
  align: { wave: 'sawtooth', from: 200, to: 880, gain: 0.4, dur: 0.25 },
  scatter: { wave: 'triangle', from: 750, to: 150, gain: 0.35, dur: 0.22 },
  select: { wave: 'sine', from: 950, to: 320, gain: 0.35, dur: 0.04 },
  typing: { wave: 'sine', from: 850, to: 450, gain: 0.18, dur: 0.03 },
  hover: { wave: 'sine', from: 600, to: 800, gain: 0.08, dur: 0.03 },
  top: { wave: 'triangle', from: 300, to: 900, gain: 0.25, dur: 0.2 },
}

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return null
    ctx = new AudioCtor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Play a short synthesized UI sound. Silently no-ops if audio is unavailable. */
export function playUISound(type: SoundType = 'click') {
  try {
    const audio = getContext()
    if (!audio) return

    const env = ENVELOPES[type]
    const now = audio.currentTime
    const osc = audio.createOscillator()
    const gain = audio.createGain()

    osc.type = env.wave
    osc.frequency.setValueAtTime(env.from, now)
    osc.frequency.exponentialRampToValueAtTime(env.to, now + env.dur)

    gain.gain.setValueAtTime(env.gain, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + env.dur)

    osc.connect(gain)
    gain.connect(audio.destination)

    osc.start(now)
    osc.stop(now + env.dur)
  } catch {
    // Ignore browser autoplay / policy restrictions.
  }
}
