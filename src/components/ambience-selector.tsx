import { SOUND_OPTIONS, SoundMode } from "../useAudio"

interface SoundSelectorProps {
  selected: SoundMode
  onChange: (mode: SoundMode) => void
  running: boolean
  dark: boolean
}

const SoundSelector = ({ selected, onChange, running, dark }: SoundSelectorProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <h4 className={`text-xs tracking-widest uppercase font-medium ${dark ? 'text-forest-600' : 'text-forest-400'}`}>
        Ambience
      </h4>
      <div className="flex gap-2">
        {SOUND_OPTIONS.map(opt => {
          const isActive = selected === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              title={`${opt.label} — ${opt.description}`}
              className={`
                flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium
                transition-all duration-200 active:scale-95 border
                ${isActive
                  ? dark
                    ? 'bg-forest-700 border-forest-500 text-forest-100 shadow-md shadow-forest-950/50'
                    : 'bg-forest-600 border-forest-500 text-white shadow-md shadow-forest-700/25'
                  : dark
                    ? 'bg-transparent border-forest-800 text-forest-500 hover:border-forest-600 hover:text-forest-300'
                    : 'bg-transparent border-forest-200 text-forest-500 hover:border-forest-400 hover:text-forest-700'
                }
                ${running && !isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              disabled={running && !isActive}
            >
              <span className="text-sm leading-none">{opt.emoji}</span>
              <span>{opt.label}</span>
              {/* Subtle animated dot when this track is active & running */}
              {isActive && running && (
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse-soft ${dark ? 'bg-forest-300' : 'bg-white'}`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SoundSelector