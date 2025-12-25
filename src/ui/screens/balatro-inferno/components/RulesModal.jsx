/**
 * Файл: src/ui/screens/balatro-inferno/components/RulesModal.jsx
 * Слой: ui
 * Назначение: модальное окно с правилами игры.
 */

import { useEffect, useRef } from 'react'
import { X, Play } from 'lucide-react'
import { MiniCard } from './MiniCard'
import { formatMoneyFull } from '../moneyFormat'

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 * }} props
 */
export function RulesModal({ open, onClose }) {
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
        aria-labelledby="rules-title"
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <h2 id="rules-title" className="text-sm sm:text-base text-slate-200 font-bold tracking-widest uppercase">
            RULES
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {/* Section 1: How to Play */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide text-center">How to Play</h3>
            <div className="flex flex-col gap-2 items-center">
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
                Select your bet amount using the{' '}
                <button
                  disabled
                  className="inline-flex items-center justify-center w-8 h-8 bg-slate-700 border-b-[3px] border-slate-900 rounded-lg text-white active:border-b-0 active:translate-y-[3px] text-sm transition-all mx-0.5"
                >
                  +
                </button>
                {' '}and{' '}
                <button
                  disabled
                  className="inline-flex items-center justify-center w-8 h-8 bg-slate-700 border-b-[3px] border-slate-900 rounded-lg text-white active:border-b-0 active:translate-y-[3px] text-sm transition-all mx-0.5"
                >
                  -
                </button>
                {' '}buttons
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
                then press PLAY to deal 5 cards.
              </p>
              <div className="flex justify-center">
                <button
                  disabled
                  className={[
                    'relative overflow-hidden',
                    'bg-gradient-to-r from-orange-500 to-red-600',
                    'border-b-[6px] border-[#7f1d1d] rounded-lg',
                    'shadow-[0_5px_10px_rgba(220,38,38,0.3)]',
                    'flex items-center justify-center gap-1.5 px-4 py-2',
                    'cursor-default',
                  ].join(' ')}
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span className="text-sm text-white tracking-[0.2em] drop-shadow-md font-black">
                    PLAY
                  </span>
                </button>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
                The game automatically evaluates your hand and finds the best poker combination. If you have a winning hand, those cards
                disappear and are replaced by new cards from the deck, creating a cascade effect.
              </p>
              {/* Winning hand example - Three of a Kind */}
              <div className="flex items-center justify-center gap-1 mt-3 relative" style={{ overflow: 'visible' }}>
                <MiniCard card={{ suit: 'hearts', rank: 14 }} isWinning={true} />
                <MiniCard card={{ suit: 'spades', rank: 14 }} isWinning={true} />
                <MiniCard card={{ suit: 'diamonds', rank: 14 }} isWinning={true} />
                <MiniCard card={{ suit: 'clubs', rank: 9 }} />
                <MiniCard card={{ suit: 'hearts', rank: 5 }} />
              </div>
            </div>
          </div>

          {/* Section 2: Betting & Balance */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide text-center">Betting & Balance</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
              Your bet is deducted at the start of each deal. Winnings are paid out as a
              single payment at the end of the cascade. Available bet amounts range from 0.2 to 100.
            </p>
            {/* CHIPS and ANTE display */}
            <div className="flex items-center justify-between gap-2 mt-2">
              {/* CHIPS */}
              <div className="bg-[#1e293b] border-l-2 border-blue-500 pl-1.5 pr-2 py-1 rounded-r-lg shadow-md skew-x-[-10deg] flex-1 min-w-0">
                <div className="text-[6px] text-blue-300 uppercase tracking-[0.15em] skew-x-[10deg]">
                  CHIPS
                </div>
                <div className="text-[10px] text-white skew-x-[10deg] truncate">
                  $99.20
                </div>
              </div>
              {/* ANTE */}
              <div className="bg-[#1e293b] border-r-2 border-red-500 pr-1.5 pl-2 py-1 rounded-l-lg shadow-md skew-x-[-10deg] flex-1 min-w-0">
                <div className="text-[6px] text-red-300 uppercase tracking-[0.15em] skew-x-[10deg] text-right">
                  ANTE
                </div>
                <div className="text-[10px] text-white skew-x-[10deg] text-right truncate">
                  $1.00
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: CASCADE Mode */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide text-center">CASCADE Mode</h3>
            <div className="flex flex-col items-center gap-3">
              {/* Cards visualization */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex gap-1 justify-center">
                  <MiniCard card={{ suit: 'hearts', rank: 14 }} isWinning={true} />
                  <MiniCard card={{ suit: 'spades', rank: 14 }} isWinning={true} />
                  <MiniCard card={{ suit: 'diamonds', rank: 13 }} />
                  <MiniCard card={{ suit: 'clubs', rank: 9 }} />
                  <MiniCard card={{ suit: 'hearts', rank: 5 }} />
                </div>
                <div className="text-center text-slate-400 text-[8px]">↓</div>
                <div className="flex gap-1 justify-center">
                  <MiniCard card={{ suit: 'clubs', rank: 10 }} />
                  <MiniCard card={{ suit: 'diamonds', rank: 8 }} />
                  <MiniCard card={{ suit: 'diamonds', rank: 13 }} />
                  <MiniCard card={{ suit: 'clubs', rank: 9 }} />
                  <MiniCard card={{ suit: 'hearts', rank: 5 }} />
                </div>
              </div>
              <div className="flex flex-col gap-2 text-center">
                <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug">
                  <span className="font-bold text-white">CASCADE</span> is the main game mode. On each step, the best hand combination is evaluated. If you have a{' '}
                  <span className="text-emerald-300 font-semibold">winning hand</span>, those cards disappear and new cards are drawn from the deck to replace them.
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug">
                  The cascade continues until no winning hand remains. All winnings are summed and paid out as a{' '}
                  <span className="text-emerald-300 font-semibold">single payment</span> at the end of the cascade.
                </p>
              </div>
              {/* TOTAL WIN banner */}
              <div className="relative isolate w-full mt-2 flex justify-center">
                <div className="relative z-10 bg-[#0f0f15] border-[2px] border-white px-1.5 sm:px-2 py-1.5 sm:py-2 shadow-[5px_5px_0_rgba(0,0,0,0.8)] transform rotate-[-3deg] animate-bounce-subtle">
                  <div className="text-[10px] sm:text-xs md:text-[22px] uppercase text-white text-center leading-tight break-words">
                    TOTAL WIN
                  </div>
                  <div className="text-[8px] sm:text-[9px] md:text-base text-center mt-1 text-white break-words">
                    +{formatMoneyFull(500)}
                  </div>
                  <div className="text-[5px] sm:text-[6px] md:text-[7px] text-center mt-1 text-slate-300 uppercase tracking-[0.28em]">
                    CASCADES x7
                  </div>
                  <div className="text-[5px] sm:text-[6px] md:text-[7px] text-center mt-0.5 text-slate-300 uppercase tracking-[0.28em]">
                    MAX MULT x5
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Hand Combinations */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide text-center">Hand Combinations</h3>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <MiniCard card={{ suit: 'hearts', rank: 14 }} isWinning={true} />
              <MiniCard card={{ suit: 'spades', rank: 14 }} isWinning={true} />
              <MiniCard card={{ suit: 'diamonds', rank: 14 }} isWinning={true} />
              <MiniCard card={{ suit: 'clubs', rank: 13 }} isWinning={true} />
              <MiniCard card={{ suit: 'hearts', rank: 13 }} isWinning={true} />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
              The game uses standard poker hand combinations: Pair, Two Pair, Three of a Kind, Straight, Flush, Full
              House, Four of a Kind, Straight Flush, Royal Flush.
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
              See the <span className="text-blue-400 font-semibold">PAYTABLE</span> button in the header for the full list of combinations and payouts.
            </p>
          </div>

          {/* Section 5: Cascade Multipliers */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide text-center">Cascade Multipliers</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
              In CASCADE mode, each winning step increases the payout multiplier:
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="relative rounded-full px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase font-black select-none border border-white/30 text-white bg-gradient-to-r from-blue-500 to-indigo-600 pixel-grid-overlay">
                1×
              </div>
              <div className="relative rounded-full px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase font-black select-none border border-white/30 text-white bg-gradient-to-r from-purple-500 to-fuchsia-600 pixel-grid-overlay">
                2×
              </div>
              <div className="relative rounded-full px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase font-black select-none border border-white/30 text-white bg-gradient-to-r from-fuchsia-500 to-pink-600 pixel-grid-overlay">
                3×
              </div>
              <div className="relative rounded-full px-2.5 py-1 text-[10px] tracking-[0.18em] uppercase font-black select-none border border-white/30 text-white bg-gradient-to-r from-amber-400 to-red-600 pixel-grid-overlay">
                5×
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug mt-1 text-center">
              The multiplier applies only to hand combination payouts, not to the maximum win (Deck Clear).
            </p>
          </div>

          {/* Section 6: Jokers */}
          <div className="bg-slate-900/60 border border-purple-500/40 rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(168,85,247,0.14),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(139,92,246,0.10),transparent_60%)]" />
            <div className="relative flex flex-col items-center text-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-purple-300 uppercase tracking-wide">Jokers</h3>
              <div className="flex items-center justify-center gap-2">
                <MiniCard card={{ suit: 'joker', rank: 15 }} isJoker={true} isWinning={true} />
                <MiniCard card={{ suit: 'joker', rank: 15 }} isJoker={true} isWinning={true} />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug max-w-[44ch]">
                Jokers act as wildcards and can replace any card to form winning combinations. The deck contains{' '}
                <span className="text-purple-300 font-bold tracking-widest uppercase">2 JOKERS</span> (54 cards total: 52
                standard cards + 2 Jokers).
              </p>
            </div>
          </div>

          {/* Section 7: Deck Clear (выделен визуально) */}
          <div className="bg-slate-900/60 border border-amber-600/40 rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(250,204,21,0.14),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(255,215,0,0.10),transparent_60%)]" />
            <div className="relative flex flex-col items-center text-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-amber-200 uppercase tracking-wide">Deck Clear</h3>
              <div className="flex flex-col items-center gap-1">
                <div className="text-[clamp(18px,3.4vw,30px)] font-black text-gold-shimmer tracking-tighter leading-none transform -skew-x-12 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  150.000<span className="text-[0.5em] leading-none">x</span>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug max-w-[44ch]">
                If you clear the entire 54-card deck in a single cascade (no cards on the table, no cards left in the
                deck), you get <span className="text-amber-200 font-bold tracking-widest uppercase">MAX WIN</span> —
                150,000× your bet.
              </p>
            </div>
          </div>

          {/* Section 8: Auto Play */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide text-center">Auto Play</h3>
            <div className="flex flex-col gap-2">
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
                Press the <span className="font-bold text-white">AUTO</span> button to select the number of automatic spins (10, 25, 50, or 100).
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
                The game will automatically perform spins until the selected amount is completed, you run out of money, or you stop
                manually.
              </p>
            </div>
            {/* Mini AutoPlay Modal visualization */}
            <div className="mt-3 flex justify-center">
              <div className="w-full max-w-[280px] bg-[#1a1a2e] border-[2px] border-slate-500 shadow-[6px_6px_0_rgba(0,0,0,0.8)] p-0.5 transform rotate-[-2deg]">
                {/* Inner CRT container */}
                <div className="relative bg-[#050510] border border-slate-700 p-2 overflow-hidden">
                  {/* CRT Grid Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-40" />
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="inline-block relative">
                          <div className="absolute -inset-0.5 bg-red-500/20 blur-sm animate-pulse" />
                          <div className="relative border-l-2 border-orange-500 pl-1.5">
                            <div className="text-[5px] text-orange-400 font-bold uppercase tracking-[0.2em] mb-0.5">AUTO MODE</div>
                            <div className="text-xs text-white font-black tracking-widest uppercase leading-none drop-shadow-[1px_1px_0_rgba(255,0,0,0.5)]">
                              AUTOSPINS
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        disabled
                        className="w-5 h-5 bg-slate-800 border border-slate-600 text-slate-200 flex items-center justify-center shadow-[2px_2px_0_#000] cursor-default"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Preset buttons */}
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[10, 25, 50, 100, 500, 1000].map((n) => (
                        <button
                          key={n}
                          disabled
                          className={[
                            'h-6 border border-slate-600 font-black tracking-[0.1em] uppercase text-[7px] relative',
                            'bg-slate-800 text-slate-300 shadow-[2px_2px_0_#000]',
                            'cursor-default',
                          ].join(' ')}
                        >
                          {/* Scanline overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_2px] pointer-events-none opacity-50" />
                          <span className="relative z-10">{n}</span>
                        </button>
                      ))}
                    </div>

                    {/* START button */}
                    <button
                      disabled
                      className={[
                        'w-full h-8 font-black tracking-[0.15em] uppercase text-xs relative overflow-hidden group',
                        'bg-gradient-to-r from-orange-500 to-red-600',
                        'border-b-[4px] border-[#7f1d1d] rounded-lg',
                        'shadow-[0_4px_8px_rgba(220,38,38,0.3)]',
                        'cursor-default',
                      ].join(' ')}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" />
                      <span className="relative z-10 drop-shadow-md text-white">START</span>
                    </button>

                    {/* Hint */}
                    <div className="text-center bg-black/40 border border-white/10 p-1 mt-1">
                      <div className="text-[6px] text-orange-200 font-mono uppercase tracking-[0.1em]">
                        &gt; SELECT AMOUNT <span className="animate-blink">_</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 9: TURBO Mode */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide text-center">TURBO Mode</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug text-center">
              The{' '}
              <button
                disabled
                className="inline-flex items-center justify-center h-5 px-2 bg-slate-700 border-b-[3px] border-slate-900 rounded transition-all mx-0.5"
              >
                <span className="text-[8px] font-bold tracking-wider text-slate-400">
                  TURBO
                </span>
              </button>
              {' '}button speeds up all game animations by <span className="text-yellow-400 font-bold">2×</span>. It affects card dealing speed and all cascade
              animations. You can toggle it on and off at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

