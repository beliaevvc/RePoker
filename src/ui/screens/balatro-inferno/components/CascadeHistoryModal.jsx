/**
 * Файл: src/ui/screens/balatro-inferno/components/CascadeHistoryModal.jsx
 * Слой: ui
 * Назначение: модальное окно с историей выигрышей каскада.
 */

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { formatMoneyFull } from '../moneyFormat'
import { MiniCard } from './MiniCard'

/**
 * @param {{
 *   open: boolean,
 *   history: Array<{
 *     stepIndex: number,
 *     winStepNumber: number,
 *     comboName: string,
 *     comboSignature: string,
 *     winningIndices: number[],
 *     hand: any[],
 *     baseWinAmount: number,
 *     cascadeMultiplier: number,
 *     winAmount: number,
 *     jackpotAmount: number
 *   }>,
 *   totalWin: number,
 *   onClose: () => void,
 * }} props
 */
export function CascadeHistoryModal({ open, history, totalWin, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (open) {
      // Блокировка скролла body
      document.body.style.overflow = 'hidden'
      // Фокус на диалог для a11y
      dialogRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Закрытие по ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (open && e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal Content */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-[#0f172a] border-2 border-slate-600 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in outline-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <h2 id="history-title" className="text-sm sm:text-base text-slate-200 font-bold tracking-widest uppercase">
            CASCADE HISTORY
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs uppercase tracking-widest">
              История пуста
            </div>
          ) : (
            history.map((entry, idx) => (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-3"
              >
                {/* Entry Header */}
                <div className="flex items-start justify-between text-xs sm:text-sm leading-tight">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                      STEP {entry.winStepNumber}
                    </span>
                    <span className="text-white font-bold tracking-wide uppercase">
                      {entry.comboName || 'WIN'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-emerald-400 font-bold tracking-wider">
                      +{formatMoneyFull(entry.winAmount)}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-700/50">
                      x{entry.cascadeMultiplier}
                    </span>
                  </div>
                </div>

                {/* Hand (MiniCards) */}
                <div className="flex gap-1.5">
                  {entry.hand.map((card, cIdx) => (
                    <MiniCard
                      key={cIdx}
                      card={card}
                      isWinning={entry.winningIndices.includes(cIdx)}
                      isJoker={card?.suit === 'joker' || card?.rank === 15}
                    />
                  ))}
                </div>

                {/* Jackpot Badge (if any) */}
                {entry.jackpotAmount > 0 && (
                  <div className="mt-1 pt-2 border-t border-slate-700/50 flex justify-between items-center animate-pulse">
                    <span className="text-[10px] font-black text-yellow-500 tracking-widest uppercase">
                      JACKPOT
                    </span>
                    <span className="text-xs font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                      +{formatMoneyFull(entry.jackpotAmount)}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer (Total) */}
        <div className="shrink-0 px-4 py-3 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Total Win</span>
          <span className="text-lg sm:text-xl font-black text-white tracking-wide text-gold-shimmer">
            {formatMoneyFull(totalWin)}
          </span>
        </div>
      </div>
    </div>
  )
}

