'use client'

/**
 * Ambient Music & Audio Synth Engine
 * Plays a continuous, calming ambient track with soft chords and spatial pads.
 */
class AmbientMusicEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private audioElement: HTMLAudioElement | null = null
  private isInitialized = false
  public isMuted = true
  private chordInterval: NodeJS.Timeout | null = null

  // Calm Ambient Chord Progressions (Frequency Triads)
  private chords = [
    [146.83, 220.00, 293.66, 370.00], // D Major 7
    [164.81, 246.94, 293.66, 392.00], // E Minor 7
    [130.81, 196.00, 261.63, 329.63], // C Major 7
    [110.00, 164.81, 220.00, 261.63], // A Minor 7
  ]
  private currentChordIndex = 0

  // OPTIONAL: Set a custom MP3 URL here if you want to use a real song file instead!
  private customMp3Url: string | null = null // e.g. "/music/ambient.mp3"

  public init() {
    if (this.isInitialized) return

    if (this.customMp3Url) {
      // Load custom MP3 track
      this.audioElement = new Audio(this.customMp3Url)
      this.audioElement.loop = true
      this.audioElement.volume = 0.25
    } else {
      // Generative Ambient Synth Track
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()

      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime)

      this.filter = this.ctx.createBiquadFilter()
      this.filter.type = 'lowpass'
      this.filter.frequency.setValueAtTime(400, this.ctx.currentTime)

      this.filter.connect(this.masterGain)
      this.masterGain.connect(this.ctx.destination)

      this.startAmbientSequence()
    }

    this.isInitialized = true
  }

  // Generates a soothing continuous ambient music stream
  private startAmbientSequence() {
    if (!this.ctx || !this.filter) return

    const playNextChord = () => {
      if (!this.ctx || !this.filter || this.isMuted) return

      const now = this.ctx.currentTime
      const chord = this.chords[this.currentChordIndex]
      this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length

      chord.forEach((freq) => {
        if (!this.ctx || !this.filter) return
        const osc = this.ctx.createOscillator()
        const oscGain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        // Soft piano/pad envelope
        oscGain.gain.setValueAtTime(0.001, now)
        oscGain.gain.linearRampToValueAtTime(0.04, now + 2.0) // Gentle fade in
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.5) // Long relaxing decay

        osc.connect(oscGain)
        oscGain.connect(this.filter)

        osc.start(now)
        osc.stop(now + 8.0)
      })
    }

    playNextChord()
    this.chordInterval = setInterval(playNextChord, 6000)
  }

  public toggleMute(): boolean {
    this.init()

    if (this.audioElement) {
      if (this.isMuted) {
        this.audioElement.play()
      } else {
        this.audioElement.pause()
      }
      this.isMuted = !this.isMuted
      return this.isMuted
    }

    if (this.ctx?.state === 'suspended') {
      this.ctx.resume()
    }

    this.isMuted = !this.isMuted
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.2
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.5)
    }

    return this.isMuted
  }

  public updateOrganization(progress: number) {
    if (!this.filter || !this.ctx || this.isMuted) return
    // Brighten music warmth as data organizes
    const cutoff = 300 + Math.pow(progress, 2) * 1800
    this.filter.frequency.setTargetAtTime(cutoff, this.ctx.currentTime, 0.2)
  }
}

export const ambientEngine = new AmbientMusicEngine()