/**
 * Файл: src/ui/screens/balatro-inferno/components/MiniCard.jsx
 * Слой: ui
 * Назначение: компактное отображение карты для истории каскада.
 */

import { Crown } from 'lucide-react'
import { RANK_NAMES } from '../../../../domain/cards/constants'

/**
 * Пиксельные иконки мастей/джокера (копия из Card.jsx, чтобы не экспортировать и не связывать сильно).
 * Можно было бы вынести в shared, но пока держим collocated.
 */
function PixelSuitIcon({ type, className }) {
  if (type === 'joker') return <Crown className={className} />

  const isRed = type === 'hearts' || type === 'diamonds'
  const fill = isRed ? '#ef4444' : '#334155'
  const paths = {
    hearts:
      'M3 2 h2 v1 h-2 z M6 2 h2 v1 h-2 z ' +
      'M2 3 h7 v1 h-7 z ' +
      'M1 4 h9 v1 h-9 z ' +
      'M1 5 h9 v1 h-9 z ' +
      'M2 6 h7 v1 h-7 z ' +
      'M3 7 h5 v1 h-5 z ' +
      'M4 8 h3 v1 h-3 z ' +
      'M5 9 h1 v1 h-1 z',
    diamonds:
      'M5 1 h1 v1 h-1 z ' +
      'M4 2 h3 v1 h-3 z ' +
      'M3 3 h5 v1 h-5 z ' +
      'M2 4 h7 v1 h-7 z ' +
      'M1 5 h9 v1 h-9 z ' +
      'M2 6 h7 v1 h-7 z ' +
      'M3 7 h5 v1 h-5 z ' +
      'M4 8 h3 v1 h-3 z ' +
      'M5 9 h1 v1 h-1 z',
    clubs:
      'M4 1 h3 v1 h-3 z ' +
      'M3 2 h5 v1 h-5 z ' +
      'M4 3 h3 v1 h-3 z ' +
      'M1 4 h3 v1 h-3 z M7 4 h3 v1 h-3 z ' +
      'M5 4 h1 v1 h-1 z ' +
      'M0 5 h5 v1 h-5 z M6 5 h5 v1 h-5 z ' +
      'M5 5 h1 v1 h-1 z ' +
      'M1 6 h3 v1 h-3 z M7 6 h3 v1 h-3 z ' +
      'M5 6 h1 v2 h-1 z ' +
      'M4 8 h3 v1 h-3 z ' +
      'M3 9 h5 v1 h-5 z',
    spades:
      'M5 1 h1 v1 h-1 z ' +
      'M4 2 h3 v1 h-3 z ' +
      'M3 3 h5 v1 h-5 z ' +
      'M2 4 h7 v1 h-7 z ' +
      'M1 5 h9 v1 h-9 z ' +
      'M1 6 h9 v1 h-9 z ' +
      'M2 7 h3 v1 h-3 z M6 7 h3 v1 h-3 z ' +
      'M5 7 h1 v2 h-1 z ' +
      'M4 8 h3 v1 h-3 z ' +
      'M3 9 h5 v1 h-5 z',
  }

  return (
    <svg
      viewBox="0 0 11 11"
      className={className}
      style={{ fill }}
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="crispEdges"
    >
      <path d={paths[type]} />
    </svg>
  )
}

/**
 * @param {{
 *   card: {suit: string, rank: number} | null,
 *   isWinning?: boolean,
 *   isJoker?: boolean,
 * }} props
 */
export function MiniCard({ card, isWinning = false, isJoker = false }) {
  if (!card) {
    // Empty slot
    return (
      <div className="w-[32px] h-[44px] bg-[#1e293b] rounded border border-slate-700/50 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-slate-800/50" />
      </div>
    )
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  const textColor = isRed ? 'text-red-500' : 'text-slate-800'
  const bgColor = isJoker
    ? 'bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-700'
    : isWinning
      ? 'bg-white'
      : 'bg-[#e2e8f0] opacity-50 grayscale'

  const borderColor = isWinning ? (isJoker ? 'border-amber-300' : 'border-white') : 'border-slate-600'
  const shadow = isWinning ? 'shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''

  return (
    <div
      className={[
        'w-[32px] h-[44px] rounded border relative select-none flex flex-col items-center justify-between py-1',
        bgColor,
        borderColor,
        shadow,
      ].join(' ')}
      style={isWinning ? { overflow: 'visible' } : { overflow: 'hidden' }}
      title={isJoker ? 'Joker' : `${RANK_NAMES[card.rank]} of ${card.suit}`}
    >
      {/* Green glow effect for winning cards */}
      {isWinning && (
        <>
          <div className="absolute -inset-[4px] z-0 rounded-lg opacity-50 blur-sm mix-blend-screen pointer-events-none">
            <div className="w-full h-full bg-gradient-to-t from-emerald-400 via-green-500 to-teal-600 animate-pulse-fast" />
          </div>
          {/* Electric border effect */}
          <div className="absolute -inset-[3px] z-40 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 32 44" preserveAspectRatio="none">
              <rect
                x="2"
                y="2"
                width="28"
                height="40"
                rx="4"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                className="animate-electric-dash opacity-80"
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.6))',
                }}
              />
            </svg>
          </div>
        </>
      )}
      {/* Rank (Top-Left для читаемости) */}
      {!isJoker && (
        <span className={`text-[10px] font-black leading-none font-press-start ${textColor}`}>
          {RANK_NAMES[card.rank]}
        </span>
      )}

      {/* Center Icon */}
      <div className="flex-1 flex items-center justify-center w-full">
        {isJoker ? (
          <Crown className="w-4 h-4 text-yellow-100 fill-yellow-200 animate-pulse" />
        ) : (
          <PixelSuitIcon type={card.suit} className="w-4 h-4" />
        )}
      </div>
    </div>
  )
}

