import { Analytics } from "@vercel/analytics/next"
import { useState, useEffect, useCallback, useRef } from 'react'

import { PRESETS } from './types'
import type { Phase } from './types'
import { useAudio, SoundMode } from './useAudio'

import CircularTimer from './components/circular-timer'
import SoundSelector from './components/ambience-selector'
import { MoonIcon, PauseIcon, PlayIcon, SunIcon } from './components/icons'

const App = () => {
  const [dark, setDark] = useState(false)
  const [presetIdx, setPresetIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('work')
  const [remaining, setRemaining] = useState(PRESETS[0].workMinutes * 60)
  const [total, setTotal] = useState(PRESETS[0].workMinutes * 60)
  const [running, setRunning] = useState(false)
  const [soundMode, setSoundMode] = useState<SoundMode>('rain')

  const { play, stop } = useAudio()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync dark class on html
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Timer tick
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          // Phase complete
          clearInterval(intervalRef.current!)
          setRunning(false)
          stop()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, stop])

  // Work → Rest phase transition
  useEffect(() => {
    if (remaining === 0 && phase === 'work') {
      const restSecs = PRESETS[presetIdx].restMinutes * 60
      setTimeout(() => {
        setPhase('rest')
        setTotal(restSecs)
        setRemaining(restSecs)
        setRunning(true)
        play(soundMode)
      }, 1000)
    }
  }, [remaining, phase, presetIdx, play, soundMode])

  const handlePresetChange = useCallback((idx: number) => {
    setPresetIdx(idx)
    setRunning(false)
    stop()
    setPhase('work')
    const secs = PRESETS[idx].workMinutes * 60
    setTotal(secs)
    setRemaining(secs)
  }, [stop])

  const handleToggle = useCallback(() => {
    if (running) {
      setRunning(false)
      stop()
    } else {
      setRunning(true)
      play(soundMode)
    }
  }, [running, play, stop, soundMode])

  // Change sound while running — swap track immediately
  const handleSoundChange = useCallback((mode: SoundMode) => {
    setSoundMode(mode)
    if (running) {
      play(mode) // swap track live, no restart needed
    }
  }, [running, play])

  const btnBase = `flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95`
  const primaryBtn = dark
    ? `${btnBase} bg-forest-600 hover:bg-forest-500 text-white shadow-lg shadow-forest-900/40`
    : `${btnBase} bg-forest-700 hover:bg-forest-600 text-white shadow-lg shadow-forest-700/30`

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${dark ? 'bg-forest-950' : 'bg-cream'}`}>
      {/* Vercel Analytics Tag */}
      <Analytics />

      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="flex items-center justify-end px-6 sm:px-10 py-5">
        <button
          onClick={() => setDark(d => !d)}
          className={`p-2 rounded-full transition-colors ${dark ? 'text-forest-400 hover:text-forest-200 hover:bg-forest-900' : 'text-forest-600 hover:text-forest-800 hover:bg-forest-100'}`}
          aria-label="Toggle theme"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-between px-4 sm:px-8 py-8 sm:py-12 gap-6 sm:gap-8 animate-fade-in">

        {/* Title */}
        <div className="text-center flex flex-col items-center gap-4 w-full max-w-md">
          <h1 className={`font-bold text-3xl sm:text-4xl md:text-5xl ${dark ? 'text-forest-200' : 'text-forest-800'}`}>
            Pomodoro
          </h1>
        </div>

        {/* Timer */}
        <div className="animate-slide-up">
          <CircularTimer
            totalSeconds={total}
            remainingSeconds={remaining}
            isRunning={running}
            phase={phase}
            dark={dark}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs sm:max-w-sm">
          {/* Preset selector */}
          {!running && (
            <div className="relative flex flex-col items-center gap-2">
              <h4 className={`text-xs tracking-widest uppercase font-medium ${dark ? 'text-forest-600' : 'text-forest-400'}`}>
                Pomodoro Preset
              </h4>
              <select
                value={presetIdx}
                onChange={e => handlePresetChange(Number(e.target.value))}
                className={`
                  text-sm font-normal py-2.5 pl-4 pr-10 rounded-full border cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-forest-500/40 transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${dark
                    ? 'bg-forest-900/80 border-forest-700 text-forest-200 hover:bg-forest-800'
                    : 'bg-white/80 border-forest-200 text-forest-700 hover:bg-white shadow-sm'}
                `}
              >
                {PRESETS.map((p, i) => (
                  <option key={i} value={i}>{p.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sound selector */}
          {!running && (
            <SoundSelector
              selected={soundMode}
              onChange={handleSoundChange}
              running={running}
              dark={dark}
            />
          )}

          <button onClick={handleToggle} className={`${primaryBtn} w-full`}>
            {running ? <PauseIcon /> : <PlayIcon />}
            {running ? 'Pause Focus' : 'Start Focus'}
          </button>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className={`py-6 text-center text-xs tracking-widest ${dark ? 'text-forest-700' : 'text-forest-400'}`}>
        <div>© {new Date().getFullYear()} Minimalist Pomodoro. All rights reserved.</div>
      </footer>
    </div>
  )
}

export default App;