/**
 * Файл: src/ui/screens/balatro-inferno/components/ElectricPlasmaOrbs.jsx
 * Слой: ui
 * Назначение: визуализация streak в виде “электрических орбов”.
 */

/**
 * Визуализация серии побед (streak) в виде “электрических орбов”.
 *
 * @param {{ streak: number }} props
 * @returns {JSX.Element}
 */
export function ElectricPlasmaOrbs({ streak }) {
  const maxDots = 5
  const dots = Array.from({ length: maxDots }, (_, i) => i)

  const getOrbColor = (count) => {
    if (count >= 5) return '#f59e0b' // Gold
    if (count >= 3) return '#d946ef' // Purple
    return '#3b82f6' // Blue
  }

  const activeColor = getOrbColor(streak)

  return (
    <div className="flex gap-[clamp(10px,3vw,24px)] justify-center w-full relative z-20 h-12 items-center">
      {dots.map((i) => {
        const isActive = i < streak

        return (
          <div
            key={i}
            className={[
              'relative transition-all duration-300 rounded-full flex items-center justify-center',
              isActive
                ? 'w-[clamp(40px,10vw,48px)] h-[clamp(40px,10vw,48px)] scale-110 z-10'
                : 'w-[clamp(16px,4vw,24px)] h-[clamp(16px,4vw,24px)] bg-[#0f172a] border border-[#1e293b] opacity-30',
            ].join(' ')}
          >
            {isActive && (
              <svg viewBox="0 0 100 100" className="w-full h-full absolute overflow-visible animate-pulse-fast">
                <defs>
                  <filter id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="50" cy="50" r="15" fill="white" className="opacity-80" filter={`url(#glow-${i})`} />
                <circle
                  cx="50"
                  cy="50"
                  r="28"
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="2"
                  strokeDasharray="10 30 5 40"
                  strokeLinecap="round"
                  className="animate-spin-electric-1 origin-center"
                  filter={`url(#glow-${i})`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="1.5"
                  strokeDasharray="40 20 10 50"
                  strokeLinecap="round"
                  className="animate-spin-electric-2 origin-center opacity-80"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="1"
                  strokeDasharray="2 10 2 20"
                  strokeLinecap="round"
                  className="animate-spin-electric-3 origin-center opacity-60"
                />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}


