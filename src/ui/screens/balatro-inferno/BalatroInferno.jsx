/**
 * Файл: src/ui/screens/balatro-inferno/BalatroInferno.jsx
 * Слой: ui
 * Назначение: экран игры (композиция UI-компонентов) + подключение контроллера состояния.
 *
 * Инварианты:
 * - Поведение 1:1 с предыдущей реализацией (пока мы не дошли до этапов улучшения UX/мобилок).
 */

import { Play, RotateCcw } from 'lucide-react'
import '../../../balatroInferno.css'

import { TIER_COLORS } from './constants'
import { useBalatroInfernoController } from './useBalatroInfernoController'
import { Card } from './components/Card'
import { ElectricPlasmaOrbs } from './components/ElectricPlasmaOrbs'

function MaxWinPoster() {
  return (
    <div className="absolute top-0 md:top-1 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center select-none z-0">
      <div className="text-[clamp(10px,1.4vw,14px)] font-black text-yellow-400 tracking-[clamp(0.16em,0.35vw,0.22em)] transform -skew-x-12 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
        MAX WIN
      </div>
      <div className="text-[clamp(18px,3.2vw,40px)] font-black text-gold-shimmer tracking-tighter transform -skew-x-12 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mt-[clamp(-4px,-0.6vw,-2px)]">
        150,000X
      </div>
    </div>
  )
}

function ResimpleLogo() {
  return (
    <div className="relative group cursor-pointer w-full flex justify-center mt-2 mb-2">
      <div className="relative animate-logo-glitch max-w-full text-center">
        <span className="text-[clamp(18px,6vw,36px)] font-black tracking-[0.08em] sm:tracking-[0.1em] text-white/90 drop-shadow-[2px_2px_0_#000] select-none uppercase font-mono break-words">
          RESIMPLE <span className="font-bold tracking-[0.3em] opacity-80">GAMES</span>
        </span>

        <span
          className="absolute top-0 left-[-2px] text-white/40 opacity-0 animate-glitch-text-1 mix-blend-overlay text-[clamp(18px,6vw,36px)] tracking-[0.08em] sm:tracking-[0.1em] font-black uppercase font-mono w-full"
          aria-hidden="true"
        >
          RESIMPLE <span className="font-bold tracking-[0.3em]">GAMES</span>
        </span>
        <span
          className="absolute top-0 left-[2px] text-gray-400/40 opacity-0 animate-glitch-text-2 mix-blend-overlay text-[clamp(18px,6vw,36px)] tracking-[0.08em] sm:tracking-[0.1em] font-black uppercase font-mono w-full"
          aria-hidden="true"
        >
          RESIMPLE <span className="font-bold tracking-[0.3em]">GAMES</span>
        </span>
      </div>
    </div>
  )
}

/**
 * Экран BalatroInferno (UI-композиция).
 *
 * @returns {JSX.Element}
 */
export default function BalatroInferno() {
  const { balance, bet, streak, hand, gameState, result, tier, isWin, isLose, shakeClass, handleDeal, adjustBet, forceHand } =
    useBalatroInfernoController()

  return (
    <div className="h-[100svh] min-h-screen bg-[#020617] font-press-start overflow-x-hidden select-none relative flex flex-col pb-safe">
      <div className="absolute inset-[-50%] animate-spin-slow origin-center z-0 pointer-events-none opacity-60">
        <div className="w-full h-full bg-[conic-gradient(from_0deg,#0f172a,#1e1b4b,#312e81,#0f172a)] blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 z-0" />
      <div className="fixed inset-0 z-[100] pointer-events-none crt-overlay" />

      <div className={`relative z-10 w-full flex-1 min-h-0 flex flex-col items-center py-4 sm:py-6 md:py-8 ${shakeClass}`}>
        <div
          className={`absolute top-0 inset-x-0 z-[70] pointer-events-none flex flex-col items-center justify-center pt-8 md:pt-12 transition-all duration-300 ${
            tier === 7 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
        >
          <div className="flex flex-col items-center animate-shake-violent">
            <div className="text-5xl md:text-7xl xl:text-9xl font-black text-gold-shimmer drop-shadow-[0_0_20px_rgba(255,215,0,0.6)] tracking-tighter animate-pulse transform -skew-x-12">
              MAX WIN
            </div>
            <div className="text-3xl md:text-5xl text-white font-bold mt-4 drop-shadow-[4px_4px_0_#000] tracking-widest">
              150,000X
            </div>
          </div>
        </div>

        <div className="w-full max-w-5xl px-3 sm:px-4 grid grid-cols-3 items-start gap-2 sm:gap-4 relative">
          <div
            className={`bg-[#1e293b] border-l-4 border-blue-500 pl-3 sm:pl-4 pr-4 sm:pr-6 py-2 rounded-r-xl shadow-lg skew-x-[-10deg] z-10 transition-opacity duration-300 ${
              tier === 7 ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="text-[10px] text-blue-300 uppercase tracking-[0.2em] sm:tracking-widest skew-x-[10deg]">
              CHIPS
            </div>
            <div className="text-[clamp(18px,3.2vw,32px)] text-white skew-x-[10deg]">${balance}</div>
          </div>

          <div className="relative flex justify-center">
            {tier !== 7 && <MaxWinPoster />}
          </div>

          <div
            className={`bg-[#1e293b] border-r-4 border-red-500 pr-3 sm:pr-4 pl-4 sm:pl-6 py-2 rounded-l-xl shadow-lg skew-x-[-10deg] z-10 transition-opacity duration-300 ${
              tier === 7 ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="text-[10px] text-red-300 uppercase tracking-[0.2em] sm:tracking-widest skew-x-[10deg] text-right">
              ANTE
            </div>
            <div className="text-[clamp(18px,3.2vw,32px)] text-white skew-x-[10deg] text-right">${bet}</div>
          </div>
        </div>

        {/* Центр (карты/эффекты): при нехватке высоты прокручиваем, чтобы контролы всегда оставались видимыми */}
        <div className="relative w-full flex flex-col items-center justify-center flex-1 min-h-0 overflow-y-auto overscroll-contain gap-4 md:gap-8">
          <div className="h-[clamp(8px,6vh,48px)]" />

          <div
            className={`fixed left-1/2 -translate-x-1/2 top-[clamp(168px,24vh,300px)] sm:top-28 z-[220] transition-all duration-150 ${
              isWin && tier !== 7 ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'
            }`}
          >
            <div className="relative isolate">
              <div
                className={[
                  'relative z-10 bg-[#0f0f15] border-[4px] border-white px-4 sm:px-8 py-3 sm:py-4 shadow-[10px_10px_0_rgba(0,0,0,0.8)] transform rotate-[-3deg] max-w-[92vw]',
                  tier >= 3 ? 'animate-glitch' : 'animate-bounce-subtle',
                ].join(' ')}
              >
                <div
                  className={`text-xl sm:text-2xl md:text-5xl uppercase text-white text-center leading-tight break-words ${TIER_COLORS[tier]?.text}`}
                >
                  {result?.name}
                </div>
                <div className="text-base sm:text-lg md:text-2xl text-center mt-2 text-white break-words">
                  +${result ? bet * result.multiplier : 0}
                </div>
              </div>
              <div className="absolute inset-0 z-0 animate-ping opacity-50 bg-white rounded-xl" />
            </div>
          </div>

          <div
            className={`fixed left-1/2 -translate-x-1/2 top-[clamp(188px,26vh,320px)] sm:top-32 z-[220] transition-all duration-150 ${
              isLose ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'
            }`}
          >
            <div className="bg-[#18181b] border-[4px] border-slate-700 px-6 py-3 shadow-[8px_8px_0_rgba(0,0,0,0.8)] transform rotate-[2deg] animate-static-shake">
              <div className="text-xl md:text-3xl uppercase text-slate-500 text-center leading-none tracking-tight animate-flicker-text">
                HIGH CARD
              </div>
              <div className="text-xs md:text-sm text-center mt-1 text-red-900 uppercase tracking-widest font-bold">NO CHIPS</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-8 w-full mt-[clamp(24px,8vh,120px)]">
            <div className="w-full max-w-5xl px-2 sm:px-4">
              <div className="grid grid-cols-5 justify-items-center gap-[clamp(4px,1.5vw,24px)] perspective-1000">
              {[0, 1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  index={i}
                  card={hand[i]}
                  isVisible={i < hand.length}
                  isWinning={gameState === 'result' && result?.winningIndices?.includes(i)}
                  isGrayedOut={gameState === 'result' && result?.name !== 'High Card' && !result?.winningIndices?.includes(i)}
                  handTier={tier}
                />
              ))}
              </div>
            </div>

            <ElectricPlasmaOrbs streak={streak} />
          </div>
        </div>

        {/* Низ (логотип + контролы): всегда видим, не сжимается */}
        <div className="w-full max-w-2xl px-4 flex flex-col gap-2 shrink-0">
          <ResimpleLogo />

          {/* Контролы: узкая колонка +/- слева, широкий PLAY по центру, debug справа (не раздувает PLAY) */}
          <div className="grid grid-cols-[clamp(90px,14vw,140px)_minmax(0,1fr)_auto] grid-rows-2 gap-2 sm:gap-3 w-full items-stretch">
            <button
              onClick={() => adjustBet(10)}
              disabled={gameState !== 'idle' && gameState !== 'result'}
              className="w-full h-[clamp(44px,6vh,56px)] bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 rounded text-white active:border-b-0 active:translate-y-1 text-[clamp(18px,5vw,28px)]"
            >
              +
            </button>
            <button
              onClick={handleDeal}
              disabled={gameState === 'dealing' || gameState === 'suspense'}
              className={[
                'w-full row-span-2 relative group overflow-hidden',
                'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500',
                'border-b-[8px] border-[#7f1d1d] rounded-xl',
                'shadow-[0_10px_20px_rgba(220,38,38,0.3)]',
                'active:border-b-0 active:translate-y-2 active:shadow-none',
                'disabled:filter disabled:grayscale disabled:cursor-not-allowed',
                'transition-all flex items-center justify-center gap-2 sm:gap-4',
              ].join(' ')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />

              {gameState === 'dealing' || gameState === 'suspense' ? (
                <RotateCcw className="w-[clamp(28px,6vw,48px)] h-[clamp(28px,6vw,48px)] animate-spin text-white" />
              ) : (
                <Play className="w-[clamp(28px,6vw,48px)] h-[clamp(28px,6vw,48px)] fill-white text-white" />
              )}
              <span className="text-xl sm:text-2xl md:text-4xl text-white tracking-[0.2em] sm:tracking-widest drop-shadow-md font-black">
                {gameState === 'suspense' ? '...' : 'PLAY'}
              </span>
            </button>
            <div className="row-span-2 flex flex-col gap-1 justify-between opacity-10 hover:opacity-100 transition-opacity">
              <button
                onClick={() => forceHand(3)}
                className="h-8 w-10 bg-rose-900 border border-rose-500 text-[10px] text-white font-mono flex items-center justify-center hover:bg-rose-700"
                title="3 Jokers"
              >
                3J
              </button>
              <button
                onClick={() => forceHand(4)}
                className="h-8 w-10 bg-purple-900 border border-purple-500 text-[10px] text-white font-mono flex items-center justify-center hover:bg-purple-700"
                title="4 Jokers"
              >
                4J
              </button>
              <button
                onClick={() => forceHand(5)}
                className="h-8 w-10 bg-yellow-900 border border-yellow-500 text-[10px] text-white font-mono flex items-center justify-center hover:bg-yellow-700"
                title="5 Jokers"
              >
                5J
              </button>
            </div>
            <button
              onClick={() => adjustBet(-10)}
              disabled={gameState !== 'idle' && gameState !== 'result'}
              className="w-full h-[clamp(44px,6vh,56px)] bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 rounded text-white active:border-b-0 active:translate-y-1 text-[clamp(18px,5vw,28px)]"
            >
              -
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


