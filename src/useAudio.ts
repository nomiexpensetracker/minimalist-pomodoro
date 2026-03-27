import { useRef, useCallback } from 'react'

// Procedurally generated rain + lofi ambience using Web Audio API
// No external audio files — zero copyright concerns

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<AudioNode[]>([])
  const masterRef = useRef<GainNode | null>(null)

  const stop = useCallback(() => {
    nodesRef.current.forEach(n => {
      try { (n as AudioScheduledSourceNode).stop?.() } catch (_) {}
    })
    nodesRef.current = []
    masterRef.current?.disconnect()
    masterRef.current = null
    ctxRef.current?.close()
    ctxRef.current = null
  }, [])

  const play = useCallback(() => {
    stop()
    const ctx = new AudioContext()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    masterRef.current = master

    // Fade in
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 3)

    // ── Rain noise ────────────────────────────────────────────────────
    const bufferSize = ctx.sampleRate * 4
    const rainBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = rainBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

    const rainSrc = ctx.createBufferSource()
    rainSrc.buffer = rainBuffer
    rainSrc.loop = true

    // Band-pass to simulate rain frequencies (1k–8k Hz)
    const rainBp = ctx.createBiquadFilter()
    rainBp.type = 'bandpass'
    rainBp.frequency.value = 3000
    rainBp.Q.value = 0.4

    const rainGain = ctx.createGain()
    rainGain.gain.value = 0.18

    rainSrc.connect(rainBp).connect(rainGain).connect(master)
    rainSrc.start()
    nodesRef.current.push(rainSrc)

    // ── Deep rumble / thunder undertone ──────────────────────────────
    const rumbleSrc = ctx.createBufferSource()
    rumbleSrc.buffer = rainBuffer
    rumbleSrc.loop = true
    const rumbleLp = ctx.createBiquadFilter()
    rumbleLp.type = 'lowpass'
    rumbleLp.frequency.value = 80
    const rumbleGain = ctx.createGain()
    rumbleGain.gain.value = 0.5
    rumbleSrc.connect(rumbleLp).connect(rumbleGain).connect(master)
    rumbleSrc.start()
    nodesRef.current.push(rumbleSrc)

    // ── Lo-fi chord pads (detuned oscillators) ────────────────────────
    // Cmaj7 voicing: C3, E3, G3, B3 → 130, 164, 196, 246 Hz
    const chordFreqs = [130.81, 164.81, 196.00, 246.94]
    chordFreqs.forEach((freq, i) => {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.value = freq
      osc2.frequency.value = freq * 1.003 // slight detune for warmth

      const env = ctx.createGain()
      env.gain.value = 0
      env.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 4 + i * 0.5)

      // LFO tremolo
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.15
      lfoGain.gain.value = 0.012
      lfo.connect(lfoGain).connect(env.gain)
      lfo.start()

      osc1.connect(env)
      osc2.connect(env)
      env.connect(master)
      osc1.start()
      osc2.start()
      nodesRef.current.push(osc1, osc2, lfo)
    })

    // ── Sub-bass drone (F1 = 43.65 Hz) ──────────────────────────────
    const bass = ctx.createOscillator()
    bass.type = 'sine'
    bass.frequency.value = 43.65
    const bassGain = ctx.createGain()
    bassGain.gain.value = 0.12
    bass.connect(bassGain).connect(master)
    bass.start()
    nodesRef.current.push(bass)

    // ── Soft hi-hat clicks ────────────────────────────────────────────
    function scheduleHihat(time: number) {
      if (!ctxRef.current) return
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) {
        const t = i / ctx.sampleRate
        d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 120)
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 8000
      const g = ctx.createGain()
      g.gain.value = 0.06
      src.connect(hp).connect(g).connect(master)
      src.start(time)

      // schedule next — 8th notes at ~75 bpm (0.4s apart)
      const bpm = 75
      const interval = 60 / bpm / 2
      setTimeout(() => scheduleHihat(ctx.currentTime + interval), interval * 900)
    }
    scheduleHihat(ctx.currentTime + 2)

    // ── Occasional thunder accent ────────────────────────────────────
    function scheduleThunder() {
      if (!ctxRef.current) return
      const delay = 20000 + Math.random() * 40000
      setTimeout(() => {
        if (!ctxRef.current) return
        const tbuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate)
        const td = tbuf.getChannelData(0)
        for (let i = 0; i < td.length; i++) {
          const t = i / ctx.sampleRate
          td[i] = (Math.random() * 2 - 1) * Math.exp(-t * 1.5) * 0.6
        }
        const tsrc = ctx.createBufferSource()
        tsrc.buffer = tbuf
        const tlp = ctx.createBiquadFilter()
        tlp.type = 'lowpass'
        tlp.frequency.value = 300
        const tg = ctx.createGain()
        tg.gain.value = 0.7
        tsrc.connect(tlp).connect(tg).connect(master)
        tsrc.start()
        nodesRef.current.push(tsrc)
        scheduleThunder()
      }, delay)
    }
    scheduleThunder()
  }, [stop])

  return { play, stop }
}
