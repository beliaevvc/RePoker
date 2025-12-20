/**
 * Файл: src/ui/screens/balatro-inferno/components/CascadeMultiplierIndicator.jsx
 * Слой: ui
 * Назначение: визуализация множителя каскада (замена streak-орбов в режиме CASCADE).
 */

const LEVELS = [
  { value: 1, label: '1×', accent: 'from-blue-500 to-indigo-600' },
  { value: 2, label: '2×', accent: 'from-purple-500 to-fuchsia-600' },
  { value: 3, label: '3×', accent: 'from-fuchsia-500 to-pink-600' },
  { value: 5, label: '5×', accent: 'from-amber-400 to-red-600' },
]

/**
 * @param {{ multiplier: number, winStepNumber: number }} props
 * @returns {JSX.Element}
 */
export function CascadeMultiplierIndicator({ multiplier, winStepNumber }) {
  const activeIdx = LEVELS.findIndex((l) => l.value === multiplier)
  const idx = activeIdx >= 0 ? activeIdx : 0
  const active = LEVELS[idx]

  return (
    <div className="flex flex-col items-center justify-center w-full relative z-20 h-12">
      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-300/90">
        CASCADE MULT <span className="text-white">x{multiplier}</span>
        <span className="text-slate-500"> · </span>
        <span className="text-slate-300">STEP {winStepNumber}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {LEVELS.map((l, i) => {
          const isOn = i <= idx
          const isActive = i === idx
          return (
            <div
              key={l.value}
              className={[
                'relative rounded-full px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase font-black select-none',
                'border',
                isOn ? 'border-white/30 text-white' : 'border-slate-700 text-slate-500',
                isActive ? `bg-gradient-to-r ${active.accent} cascade-mult-glow animate-cascade-mult-pop` : 'bg-slate-900/40',
              ].join(' ')}
            >
              {l.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}


