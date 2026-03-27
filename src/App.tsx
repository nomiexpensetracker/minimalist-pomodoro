import { useState, useEffect, useCallback, useRef } from 'react'
import CircularTimer from './components/CircularTimer'
import InfoCard from './components/InfoCard'
import { PRESETS } from './types'
import type { Phase } from './types'
import { useAudio } from './useAudio'

// ── Icons ────────────────────────────────────────────────────────────────────

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  )
}

function HexIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="2" y1="8.5" x2="22" y2="8.5"/>
      <line x1="2" y1="15.5" x2="22" y2="15.5"/>
    </svg>
  )
}

function DropIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    </svg>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [dark, setDark] = useState(true)
  const [presetIdx, setPresetIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('work')
  const [remaining, setRemaining] = useState(PRESETS[0].workMinutes * 60)
  const [total, setTotal] = useState(PRESETS[0].workMinutes * 60)
  const [running, setRunning] = useState(false)
  const [streak] = useState(5)
  const [focusHours] = useState(4)

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

  // Phase transition when remaining hits 0
  useEffect(() => {
    if (remaining === 0 && phase === 'work') {
      const restSecs = PRESETS[presetIdx].restMinutes * 60
      setTimeout(() => {
        setPhase('rest')
        setTotal(restSecs)
        setRemaining(restSecs)
        setRunning(true)
        play()
      }, 1000)
    }
  }, [remaining, phase, presetIdx, play])

  const preset = PRESETS[presetIdx]

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
      play()
    }
  }, [running, play, stop])

  const handleReset = useCallback(() => {
    setRunning(false)
    stop()
    setPhase('work')
    const secs = preset.workMinutes * 60
    setTotal(secs)
    setRemaining(secs)
  }, [preset, stop])

  const btnBase = `flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95`
  const primaryBtn = dark
    ? `${btnBase} bg-forest-600 hover:bg-forest-500 text-white shadow-lg shadow-forest-900/40`
    : `${btnBase} bg-forest-700 hover:bg-forest-600 text-white shadow-lg shadow-forest-700/30`

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${dark ? 'bg-forest-950' : 'bg-cream'}`}>

      {/* ── Navbar ─────────────────────────────────────── */}
      <header className={`flex items-center justify-between px-6 sm:px-10 py-5 ${dark ? 'border-b border-forest-900' : 'border-b border-forest-100'}`}>
        <span className={`font-bold text-lg tracking-tight ${dark ? 'text-forest-300' : 'text-forest-700'}`}>
          Minimalist Pomodoro
        </span>
        <button
          onClick={() => setDark(d => !d)}
          className={`p-2 rounded-full transition-colors ${dark ? 'text-forest-400 hover:text-forest-200 hover:bg-forest-900' : 'text-forest-600 hover:text-forest-800 hover:bg-forest-100'}`}
          aria-label="Toggle theme"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-8 py-8 sm:py-12 gap-6 sm:gap-8 animate-fade-in">

        {/* Title */}
        <div className="text-center">
          <h1 className={`font-bold text-3xl sm:text-4xl md:text-5xl ${dark ? 'text-forest-200' : 'text-forest-800'}`}>
            Current Focus
          </h1>
        </div>

        {/* Preset selector */}
        <div className="relative">
          <select
            value={presetIdx}
            onChange={e => handlePresetChange(Number(e.target.value))}
            disabled={running}
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

        {/* Phase indicator pills */}
        <div className="flex gap-2">
          {(['work', 'rest'] as Phase[]).map(p => (
            <span
              key={p}
              className={`text-xs px-3 py-1 rounded-full font-medium tracking-widest uppercase transition-all ${
                phase === p
                  ? dark ? 'bg-forest-700 text-forest-100' : 'bg-forest-600 text-white'
                  : dark ? 'bg-forest-900 text-forest-600' : 'bg-forest-100 text-forest-400'
              }`}
            >
              {p === 'work' ? 'Work' : 'Rest'}
            </span>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs sm:max-w-sm">
          <button onClick={handleToggle} className={`${primaryBtn} w-full`}>
            {running ? <PauseIcon /> : <PlayIcon />}
            {running ? 'Pause Focus' : 'Start Focus'}
          </button>

          <button
            onClick={handleReset}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-colors ${
              dark ? 'text-forest-500 hover:text-forest-300' : 'text-forest-500 hover:text-forest-700'
            }`}
          >
            <ResetIcon />
            Reset Session
          </button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-4 animate-slide-up">
          <InfoCard
            dark={dark}
            icon={<LeafIcon />}
            title="Daily Growth"
            description={`You've cultivated ${focusHours} hours of deep focus today. Almost at your goal.`}
          />
          <InfoCard
            dark={dark}
            icon={<HexIcon />}
            title="Current Streak"
            description={`${streak} days of consistent focus. Your digital garden is thriving.`}
          />
          <InfoCard
            dark={dark}
            icon={<DropIcon />}
            title="Forest Audio"
            description={running
              ? 'Ambient rain & lo-fi is playing to drown out noise.'
              : 'Ambient rain & lo-fi will play when you start focusing.'}
          />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className={`py-6 text-center text-xs tracking-widest ${dark ? 'text-forest-700' : 'text-forest-400'}`}>
        <div className="flex justify-center gap-6 mb-2">
          <a href="#" className={`hover:underline transition-colors ${dark ? 'hover:text-forest-400' : 'hover:text-forest-600'}`}>PRIVACY</a>
          <a href="#" className={`hover:underline transition-colors ${dark ? 'hover:text-forest-400' : 'hover:text-forest-600'}`}>TERMS</a>
        </div>
        <div>© 2024 EVERGROW. CULTIVATE YOUR FOCUS.</div>
      </footer>
    </div>
  )
}
