export type Phase = 'work' | 'rest'

export interface Preset {
  label: string
  workMinutes: number
  restMinutes: number
}

export const PRESETS: Preset[] = [
  { label: 'Short Task (30m work + 5m rest)',  workMinutes: 30, restMinutes: 5  },
  { label: 'Medium Task (45m work + 10m rest)', workMinutes: 45, restMinutes: 10 },
  { label: 'Hard Task (60m work + 10m rest)',   workMinutes: 60, restMinutes: 10 },
]
