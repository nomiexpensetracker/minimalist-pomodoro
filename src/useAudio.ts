import { useRef, useCallback } from 'react'

// ── Sound mode type ───────────────────────────────────────────────────────────

export type SoundMode = 'restaurant' | 'rain' | 'birds'

export interface SoundOption {
  id: SoundMode
  label: string
  emoji: string
  file: string
  description: string
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'restaurant',
    label: 'Restaurant',
    emoji: '☕',
    file: '/audio/restaurant-ambience.mp3',
    description: 'Warm café chatter & clinking cups.',
  },
  {
    id: 'rain',
    label: 'Rain',
    emoji: '🌧️',
    file: '/audio/rain-ambience.mp3',
    description: 'Steady rainfall with distant thunder.',
  },
  {
    id: 'birds',
    label: 'Birds',
    emoji: '🐦',
    file: '/audio/beach-ambience.mp3',
    description: 'Morning birdsong in a quiet forest.',
  },
]

// ── Types ─────────────────────────────────────────────────────────────────────

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'error'

export interface UseAudioReturn {
  play: (mode: SoundMode) => Promise<void>
  stop: () => void
  statusRef: React.MutableRefObject<AudioStatus>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAudio(): UseAudioReturn {
  const ctxRef         = useRef<AudioContext | null>(null)
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null)
  const masterRef      = useRef<GainNode | null>(null)
  const bufferCacheRef = useRef<Partial<Record<SoundMode, AudioBuffer>>>({})
  const statusRef      = useRef<AudioStatus>('idle')

  // ── Stop & tear down ───────────────────────────────────────────────────────
  const stop = useCallback(() => {
    // Fade out gracefully over 0.8 s then destroy context
    if (masterRef.current && ctxRef.current) {
      const gain = masterRef.current
      const ctx  = ctxRef.current
      gain.gain.cancelScheduledValues(ctx.currentTime)
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8)
    }
    setTimeout(() => {
      try { sourceRef.current?.stop()      } catch (_) {}
      try { masterRef.current?.disconnect() } catch (_) {}
      try { ctxRef.current?.close()         } catch (_) {}
      sourceRef.current = null
      masterRef.current = null
      ctxRef.current    = null
      statusRef.current = 'idle'
    }, 850)
  }, [])

  // ── Fetch + decode with per-mode cache ────────────────────────────────────
  const getBuffer = useCallback(async (
    ctx: AudioContext,
    mode: SoundMode,
  ): Promise<AudioBuffer> => {
    if (bufferCacheRef.current[mode]) {
      return bufferCacheRef.current[mode]!
    }
    const option = SOUND_OPTIONS.find(o => o.id === mode)!
    const response = await fetch(option.file)
    if (!response.ok) {
      throw new Error(`Audio fetch failed: ${response.status} — ${option.file}`)
    }
    const arrayBuffer  = await response.arrayBuffer()
    const audioBuffer  = await ctx.decodeAudioData(arrayBuffer)
    bufferCacheRef.current[mode] = audioBuffer
    return audioBuffer
  }, [])

  // ── Play ──────────────────────────────────────────────────────────────────
  const play = useCallback(async (mode: SoundMode) => {
    // Hard-stop any previous session immediately (new track starts right away)
    try { sourceRef.current?.stop()      } catch (_) {}
    try { masterRef.current?.disconnect() } catch (_) {}
    try { ctxRef.current?.close()         } catch (_) {}
    sourceRef.current = null
    masterRef.current = null
    ctxRef.current    = null

    statusRef.current = 'loading'

    const ctx = new AudioContext()
    ctxRef.current = ctx

    // Master gain — starts silent for smooth fade-in
    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.connect(ctx.destination)
    masterRef.current = master

    try {
      const buffer = await getBuffer(ctx, mode)

      // Guard: context may have been replaced while fetching
      if (ctxRef.current !== ctx) return

      const source  = ctx.createBufferSource()
      source.buffer = buffer
      source.loop   = true // Loop indefinitely until stopped

      // Light EQ shaping per ambience type
      const eq = ctx.createBiquadFilter()
      switch (mode) {
        case 'restaurant':
          // Tame harsh high-mids from voices
          eq.type            = 'highshelf'
          eq.frequency.value = 5000
          eq.gain.value      = -4
          break
        case 'rain':
          // Boost low-end rumble slightly
          eq.type            = 'lowshelf'
          eq.frequency.value = 200
          eq.gain.value      = 3
          break
        case 'birds':
          // Remove low-frequency handling noise
          eq.type            = 'highpass'
          eq.frequency.value = 120
          break
      }

      source.connect(eq)
      eq.connect(master)
      source.start(0)
      sourceRef.current = source
      statusRef.current = 'playing'

      // Fade in over 2.5 s
      master.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 2.5)

      source.onended = () => {
        if (statusRef.current === 'playing') statusRef.current = 'idle'
      }
    } catch (err) {
      console.error('[useAudio] Playback error:', err)
      statusRef.current = 'error'
      try { ctx.close() } catch (_) {}
      if (ctxRef.current === ctx) {
        ctxRef.current = null
      }
    }
  }, [getBuffer])

  return { play, stop, statusRef }
}
