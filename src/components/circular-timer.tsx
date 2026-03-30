import { useMemo } from 'react'
import type { Phase } from '../types'

interface Props {
  totalSeconds: number
  remainingSeconds: number
  isRunning: boolean
  phase: Phase
  dark: boolean
  completedCount: number
}

export default function CircularTimer({ totalSeconds, remainingSeconds, isRunning, phase, dark, completedCount }: Props) {
  const SIZE = 300
  const STROKE = 6
  const R = (SIZE - STROKE * 2) / 2
  const CIRC = 2 * Math.PI * R

  // Tree rings geometry
  const RING_WIDTH = 2
  const RING_SPACING = RING_WIDTH   // center-to-center = width → rings are flush, no gap
  const RING_GAP = 4       // gap from outer edge of progress arc to first ring center
  const progressOuterR = R + (STROKE + 1) / 2  // outer edge of progress stroke from center
  const ringStartR = progressOuterR + RING_GAP + RING_WIDTH / 2
  const lastRingOuterR = completedCount > 0
    ? ringStartR + (completedCount - 1) * RING_SPACING + RING_WIDTH / 2
    : 0
  const extraPad = completedCount > 0 ? Math.ceil(lastRingOuterR - SIZE / 2) + 3 : 0
  const totalSize = SIZE + extraPad * 2
  const cx = totalSize / 2
  const cy = totalSize / 2

  // Palette of alternating forest-green shades for rings
  const ringPalette = dark
    ? ['#5a9a5a', '#3a7a3a', '#6aaa6a', '#2a6a2a', '#7aba7a', '#1a5a1a', '#8aca8a', '#4a8a4a']
    : ['#4a7c4a', '#2a5c2a', '#5a8c5a', '#1a4c1a', '#6a9c6a', '#3a6c3a', '#7aac7a', '#0a3c0a']

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
        width={totalSize}
        height={totalSize}
        viewBox={`0 0 ${totalSize} ${totalSize}`}
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

        {/* Tree rings — one full circle per completed work session */}
        {Array.from({ length: completedCount }).map((_, i) => (
          <circle
            key={i}
            cx={cx} cy={cy}
            r={ringStartR + i * RING_SPACING}
            fill="none"
            stroke={ringPalette[i % ringPalette.length]}
            strokeWidth={RING_WIDTH}
            opacity={0.7 - i * 0.04}
            style={{ transition: 'opacity 0.4s ease' }}
          />
        ))}

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
