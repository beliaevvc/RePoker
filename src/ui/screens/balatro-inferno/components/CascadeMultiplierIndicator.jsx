/**
 * Файл: src/ui/screens/balatro-inferno/components/CascadeMultiplierIndicator.jsx
 * Слой: ui
 * Назначение: визуализация множителя каскада (замена streak-орбов в режиме CASCADE).
 */

import { memo, useEffect, useRef, useState } from 'react'

const WIN_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const LEVELS = [
  { value: 1, label: '1×', accent: 'from-blue-500 to-indigo-600' },
  { value: 2, label: '2×', accent: 'from-purple-500 to-fuchsia-600' },
  { value: 3, label: '3×', accent: 'from-fuchsia-500 to-pink-600' },
  { value: 5, label: '5×', accent: 'from-amber-400 to-red-600' },
]

/**
 * @param {{
 *   multiplier: number,
 *   winStepNumber: number,
 *   armed?: boolean,
 *   runningWin?: number,
 *   showRunningWin?: boolean,
 *   timeFactor?: number,
 *   onOpenHistory?: () => void,
 *   winsCount?: number,
 *   historyEnabled?: boolean,
 * }} props
 * @returns {JSX.Element}
 */
export const CascadeMultiplierIndicator = memo(function CascadeMultiplierIndicator({
  multiplier,
  winStepNumber,
  armed = true,
  runningWin = 0,
  showRunningWin = false,
  timeFactor = 1,
  onOpenHistory,
  winsCount = 0,
  historyEnabled = false,
}) {
  const activeIdx = armed ? LEVELS.findIndex((l) => l.value === multiplier) : -1
  const idx = activeIdx >= 0 ? activeIdx : -1
  const active = idx >= 0 ? LEVELS[idx] : null

  const [displayWin, setDisplayWin] = useState(() => Number(runningWin ?? 0))
  const [winPopNonce, setWinPopNonce] = useState(0)
  const rafRef = useRef(0)

  useEffect(() => {
    // Если строка WIN скрыта — синхронизируем значение без анимации (чтобы следующий показ стартовал корректно).
    if (!showRunningWin) {
      setDisplayWin(Number(runningWin ?? 0))
      return
    }

    const reducedMotion = (() => {
      try {
        return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      } catch {
        return false
      }
    })()

    const target = Number(runningWin ?? 0)
    if (!Number.isFinite(target)) return

    if (reducedMotion) {
      setDisplayWin(target)
      setWinPopNonce((n) => n + 1)
      return
    }

    // count-up: от текущего displayWin к target
    const from = Number(displayWin ?? 0)
    if (!Number.isFinite(from)) {
      setDisplayWin(target)
      setWinPopNonce((n) => n + 1)
      return
    }

    if (target === from) return

    const durationMs = Math.max(80, Math.round(240 * Math.max(0.25, Number(timeFactor ?? 1))))
    const start = performance.now()

    // гарантируем, что CSS-анимация pop перезапустится
    setWinPopNonce((n) => n + 1)

    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs)
      // easeOutQuad
      const eased = t * (2 - t)
      const v = from + (target - from) * eased
      setDisplayWin(v)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else setDisplayWin(target)
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- displayWin is the animation "from" value; we intentionally re-run only on target/visibility changes.
  }, [runningWin, showRunningWin, timeFactor])

  return (
    <div className="flex flex-col items-center justify-start w-full relative z-20 h-[76px] pt-1">
      <div className="text-[10px] uppercase tracking-[0.22em] text-slate-300/90 transform-gpu will-change-transform">
        CASCADE MULT {armed ? <span className="text-white">x{multiplier}</span> : <span className="text-slate-600">x—</span>}
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
                isActive && active ? `bg-gradient-to-r ${active.accent} cascade-mult-glow animate-cascade-mult-pop` : 'bg-slate-900/40',
              ].join(' ')}
            >
              {l.label}
            </div>
          )
        })}
      </div>

      {/* ВАЖНО: место под WIN всегда зарезервировано, чтобы при появлении ничего не “подпрыгивало”. */}
      <div
        className={[
          'mt-3 h-5 text-[11px] uppercase tracking-[0.24em] text-slate-300/90 leading-none flex items-center gap-4',
          showRunningWin ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <span>
          <span className="text-slate-400">WIN </span>
          <span key={winPopNonce} className="text-white cascade-win-glow animate-cascade-win-pop text-[12px]">
            {Number.isFinite(displayWin) ? WIN_FORMATTER.format(displayWin) : '0.00'}
          </span>
        </span>

        {winsCount > 0 && onOpenHistory && (
          <button
            onClick={historyEnabled ? onOpenHistory : undefined}
            disabled={!historyEnabled}
            className={[
              'text-[10px] transition-all duration-300',
              historyEnabled
                ? 'text-slate-300 hover:text-white border-b border-slate-500 hover:border-white cursor-pointer animate-pulse-slow-glow'
                : 'text-slate-600 border-b border-transparent cursor-not-allowed',
              'pb-[1px]',
            ].join(' ')}
            title={historyEnabled ? 'Показать историю выигрышей' : 'История доступна после завершения каскада'}
          >
            WINS ({winsCount})
          </button>
        )}
      </div>
    </div>
  )
})


