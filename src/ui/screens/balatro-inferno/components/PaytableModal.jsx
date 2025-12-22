/**
 * Файл: src/ui/screens/balatro-inferno/components/PaytableModal.jsx
 * Слой: ui
 * Назначение: модальное окно с таблицей выплат.
 */

import { useEffect, useRef } from 'react'
import { X, Minus, Plus } from 'lucide-react'
import { formatMoneyFull } from '../moneyFormat'
import { HAND_MULTIPLIERS } from '../../../../domain/hand-evaluator/constants'
import { MiniCard } from './MiniCard'

const DECK_CLEAR_MULTIPLIER = 150000

// Порядок отображения комбинаций (от старшей к младшей)
const ORDERED_COMBOS = [
  'Royal Flush',
  'Straight Flush',
  'Four of a Kind',
  'Full House',
  'Flush',
  'Straight',
  'Three of a Kind',
  'Two Pair',
  'Pair',
]

// Примеры рук для визуализации с указанием выигрышных карт (остальные будут затемнены)
const EXAMPLE_HANDS = {
  'Royal Flush': {
    cards: [
      { rank: 10, suit: 'hearts' },
      { rank: 11, suit: 'hearts' },
      { rank: 12, suit: 'hearts' },
      { rank: 13, suit: 'hearts' },
      { rank: 14, suit: 'hearts' },
    ],
    winningIndices: [0, 1, 2, 3, 4],
  },
  'Straight Flush': {
    cards: [
      { rank: 9, suit: 'spades' },
      { rank: 8, suit: 'spades' },
      { rank: 7, suit: 'spades' },
      { rank: 6, suit: 'spades' },
      { rank: 5, suit: 'spades' },
    ],
    winningIndices: [0, 1, 2, 3, 4],
  },
  'Four of a Kind': {
    cards: [
      { rank: 5, suit: 'clubs' },
      { rank: 5, suit: 'diamonds' },
      { rank: 5, suit: 'hearts' },
      { rank: 5, suit: 'spades' },
      { rank: 13, suit: 'clubs' }, // Kicker
    ],
    winningIndices: [0, 1, 2, 3],
  },
  'Full House': {
    cards: [
      { rank: 10, suit: 'diamonds' },
      { rank: 10, suit: 'clubs' },
      { rank: 10, suit: 'hearts' },
      { rank: 9, suit: 'spades' },
      { rank: 9, suit: 'hearts' },
    ],
    winningIndices: [0, 1, 2, 3, 4],
  },
  Flush: {
    cards: [
      { rank: 13, suit: 'diamonds' },
      { rank: 10, suit: 'diamonds' },
      { rank: 7, suit: 'diamonds' },
      { rank: 5, suit: 'diamonds' },
      { rank: 2, suit: 'diamonds' },
    ],
    winningIndices: [0, 1, 2, 3, 4],
  },
  Straight: {
    cards: [
      { rank: 9, suit: 'clubs' },
      { rank: 8, suit: 'diamonds' },
      { rank: 7, suit: 'hearts' },
      { rank: 6, suit: 'spades' },
      { rank: 5, suit: 'clubs' },
    ],
    winningIndices: [0, 1, 2, 3, 4],
  },
  'Three of a Kind': {
    cards: [
      { rank: 12, suit: 'hearts' },
      { rank: 12, suit: 'clubs' },
      { rank: 12, suit: 'diamonds' },
      { rank: 8, suit: 'spades' }, // Kicker
      { rank: 4, suit: 'hearts' }, // Kicker
    ],
    winningIndices: [0, 1, 2],
  },
  'Two Pair': {
    cards: [
      { rank: 11, suit: 'spades' },
      { rank: 11, suit: 'hearts' },
      { rank: 8, suit: 'diamonds' },
      { rank: 8, suit: 'clubs' },
      { rank: 14, suit: 'spades' }, // Kicker
    ],
    winningIndices: [0, 1, 2, 3],
  },
  Pair: {
    cards: [
      { rank: 14, suit: 'hearts' },
      { rank: 14, suit: 'clubs' },
      { rank: 13, suit: 'spades' }, // Kicker
      { rank: 9, suit: 'diamonds' }, // Kicker
      { rank: 4, suit: 'hearts' }, // Kicker
    ],
    winningIndices: [0, 1],
  },
}

/**
 * @param {{
 *   open: boolean,
 *   bet: number,
 *   onAdjustBet?: (direction: number) => void,
 *   onClose: () => void,
 * }} props
 */
export function PaytableModal({ open, bet, onAdjustBet, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      dialogRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (open && e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const deckClearPayout = bet * DECK_CLEAR_MULTIPLIER

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
        aria-labelledby="paytable-title"
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <h2 id="paytable-title" className="text-sm sm:text-base text-slate-200 font-bold tracking-widest uppercase">
            PAYTABLE
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
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {/* Special payout (do NOT call it jackpot) */}
          <div className="bg-slate-900/60 border border-amber-600/40 rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,0.14),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(255,215,0,0.10),transparent_60%)]" />

            <div className="relative flex flex-col items-center text-center gap-2">
              <div className="text-xs sm:text-sm font-extrabold text-amber-200 uppercase tracking-wide">
                DECK CLEAR
              </div>

              <div className="flex flex-col items-center gap-1">
                <div
                  className="text-[clamp(18px,3.4vw,30px)] font-black text-gold-shimmer tracking-tighter leading-none transform -skew-x-12 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]"
                  aria-label="150.000x"
                >
                  150.000<span className="text-[0.5em] leading-none">x</span>
                </div>
                <div className="text-xs sm:text-sm text-emerald-400 font-bold tracking-wider">
                  {formatMoneyFull(deckClearPayout)}
                </div>
              </div>

              <div className="mt-1 text-[10px] sm:text-[11px] text-slate-300 leading-snug max-w-[44ch]">
                If you clear the entire 54-card deck in a single cascade (no cards on the table, no cards left in the deck), you
                get <span className="text-amber-200 font-bold tracking-widest uppercase">MAX WIN</span>.
              </div>
            </div>
          </div>

          {ORDERED_COMBOS.map((comboName) => {
            const multiplier = HAND_MULTIPLIERS[comboName] ?? 0
            const payout = bet * multiplier
            const exampleData = EXAMPLE_HANDS[comboName]
            const cards = exampleData?.cards || []
            const winningIndices = exampleData?.winningIndices || []

            return (
              <div
                key={comboName}
                className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide">
                    {comboName}
                  </span>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-700/50">
                      x{multiplier}
                    </span>
                    <span className="text-xs sm:text-sm text-emerald-400 font-bold tracking-wider">
                      {formatMoneyFull(payout)}
                    </span>
                  </div>
                </div>

                {/* Example Hand Visualization */}
                {cards.length > 0 && (
                  <div className="flex gap-1.5 opacity-90 justify-start overflow-x-auto pb-1 no-scrollbar">
                    {cards.map((card, i) => (
                      <MiniCard
                        key={i}
                        card={card}
                        isWinning={winningIndices.includes(i)}
                        isJoker={card.suit === 'joker'}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer (Controls) */}
        <div className="shrink-0 px-4 py-3 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">
            CHANGE BET
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdjustBet && onAdjustBet(-1)}
              className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-slate-200 border border-slate-600 hover:border-slate-500 active:translate-y-0.5 transition-all"
              aria-label="Decrease Bet"
            >
              <Minus size={16} />
            </button>
            <span className="text-sm font-bold text-white tracking-wide w-[80px] text-center font-mono">
              {formatMoneyFull(bet)}
            </span>
            <button
              onClick={() => onAdjustBet && onAdjustBet(1)}
              className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-slate-200 border border-slate-600 hover:border-slate-500 active:translate-y-0.5 transition-all"
              aria-label="Increase Bet"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
