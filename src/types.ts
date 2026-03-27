export type Phase = 'work' | 'rest'

export interface Preset {
  label: string
  workMinutes: number
  restMinutes: number
}

export const PRESETS: Preset[] = [
  { label: 'The Classic (25m work + 5m rest)',  workMinutes: 25, restMinutes: 5  },
  { label: 'The Dash (15m work + 5m rest)', workMinutes: 15, restMinutes: 5 },
  { label: 'The Remix (45m work + 15m rest)', workMinutes: 45, restMinutes: 15 },
  { label: 'The Deep Dive (50m work + 10m rest)',   workMinutes: 50, restMinutes: 10 },
]
