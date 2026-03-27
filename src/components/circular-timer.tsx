import { useMemo } from 'react'
import type { Phase } from '../types'

interface Props {
  totalSeconds: number
  remainingSeconds: number
  isRunning: boolean
  phase: Phase
  dark: boolean
}

export default function CircularTimer({ totalSeconds, remainingSeconds, isRunning, phase, dark }: Props) {
  const SIZE = 300
  const STROKE = 6
  const R = (SIZE - STROKE * 2) / 2
  const CIRC = 2 * Math.PI * R
  const cx = SIZE / 2
  const cy = SIZE / 2

  const progress = useMemo(() => {
    if (totalSeconds === 0) return 0
    return (totalSeconds - remainingSeconds) / totalSeconds
  }, [totalSeconds, remainingSeconds])

  const dashOffset = CIRC * (1 - progress)

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Dash pattern for the dashed track (like in light mode design)
  const dashArray = `${CIRC * 0.018} ${CIRC * 0.012}`

  const workColor   = dark ? '#5a9a5a' : '#4a7c4a'
  const restColor   = dark ? '#8ab88a' : '#5a9a5a'
  const trackColor  = phase === 'work' ? workColor : restColor
  const trackBg     = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Outer glow ring when active */}
      {isRunning && (
        <div
          className="absolute rounded-full timer-active pointer-events-none"
          style={{ width: SIZE + 24, height: SIZE + 24 }}
        />
      )}

      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="drop-shadow-lg"
        style={{ filter: dark ? 'drop-shadow(0 0 20px rgba(90,154,90,0.2))' : 'drop-shadow(0 8px 24px rgba(0,0,0,0.1))' }}
      >
        {/* Inner circle background */}
        <circle
          cx={cx} cy={cy} r={R}
          fill={dark ? '#0e1f0e' : '#e8e3d8'}
          stroke="none"
        />

        {/* Leaf watermark SVG text */}
        <text
          x={cx} y={cy + 8}
          textAnchor="middle"
          fontSize="72"
          opacity={dark ? 0.07 : 0.12}
          style={{ userSelect: 'none' }}
        >
          🌿
        </text>

        {/* Dashed background track */}
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={trackBg}
          strokeWidth={STROKE}
          strokeDasharray={dashArray}
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={trackColor}
          strokeWidth={STROKE + 1}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="progress-ring__track"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />

        {/* Time display */}
        <text
          x={cx} y={cy - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="56"
          fontWeight="300"
          fontFamily="'JetBrains Mono', monospace"
          fill={dark ? '#e8f5e8' : '#1a3a1a'}
          letterSpacing="-2"
        >
          {timeStr}
        </text>

        {/* Phase label */}
        <text
          x={cx} y={cy + 36}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="500"
          fontFamily="'DM Sans', sans-serif"
          fill={dark ? '#5a9a5a' : '#4a7c4a'}
          letterSpacing="4"
        >
          {phase === 'work' ? 'DEEP WORK' : 'REST TIME'}
        </text>
      </svg>
    </div>
  )
}
