import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  description: string
  dark: boolean
}

export default function InfoCard({ icon, title, description, dark }: Props) {
  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 flex flex-col gap-3 transition-all duration-300 ${
        dark
          ? 'bg-forest-900/60 border border-forest-800/40 hover:border-forest-700/60'
          : 'bg-forest-100/70 border border-forest-200/60 hover:border-forest-300'
      } hover:translate-y-[-2px]`}
    >
      <div className={`w-8 h-8 ${dark ? 'text-forest-400' : 'text-forest-600'}`}>
        {icon}
      </div>
      <div>
        <h3 className={`font-semibold text-sm mb-1 ${dark ? 'text-forest-200' : 'text-forest-800'}`}>
          {title}
        </h3>
        <p className={`text-xs leading-relaxed ${dark ? 'text-forest-400' : 'text-forest-600'}`}>
          {description}
        </p>
      </div>
    </div>
  )
}
