/**
 * Файл: src/ui/screens/balatro-inferno/components/Card.jsx
 * Слой: ui
 * Назначение: рендер одной карты + выигрышные эффекты.
 *
 * Инварианты:
 * - Поведение/визуал 1:1 со старым компонентом `Card` из монолита `src/BalatroInferno.jsx`.
 */

import { Crown } from 'lucide-react'
import { RANK_NAMES } from '../../../../domain/cards/constants'
import { TIER_COLORS } from '../constants'
import { useEffect, useRef, useState } from 'react'

/**
 * Пиксельные иконки мастей/джокера.
 *
 * @param {{ type: 'hearts'|'diamonds'|'clubs'|'spades'|'joker', className?: string }} props
 * @returns {JSX.Element}
 */
function PixelSuit({ type, className }) {
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
 * Детерминированное “случайное” вращение для карты.
 *
 * @param {{ id?: string } | null | undefined} card
 * @param {number} index
 * @returns {number}
 */
function stableRotationDeg(card, index) {
  const s = `${card?.id ?? 'empty'}:${index}`
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  const unit = hash / 0xffffffff
  return unit * 4 - 2
}

function ElectricBorder() {
  return (
    <div className="absolute -inset-[6px] z-30 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
        <rect
          x="2"
          y="2"
          width="96"
          height="136"
          rx="8"
          fill="none"
          stroke="white"
          strokeWidth="3"
          className="animate-electric-dash opacity-90 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
        />
      </svg>
    </div>
  )
}

function Holofoil() {
  return (
    <div className="absolute inset-0 z-20 opacity-40 mix-blend-overlay pointer-events-none rounded-lg overflow-hidden">
      <div className="absolute inset-[-150%] bg-gradient-to-r from-transparent via-white/50 to-transparent rotate-[25deg] animate-holofoil-sweep" />
      <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.1)_3px,rgba(255,255,255,0.1)_4px)]" />
    </div>
  )
}

function JokerVisual() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
      <div className="relative">
        <Crown
          className="text-yellow-100 fill-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse"
          style={{ width: 'clamp(28px, 7.5vw, 64px)', height: 'clamp(28px, 7.5vw, 64px)' }}
        />
        <div className="absolute top-0 left-0 w-full h-full animate-ping opacity-20 bg-yellow-400 rounded-full blur-xl" />
      </div>
      <div className="mt-1 w-full flex justify-center">
        <span
          className="block max-w-[88%] whitespace-nowrap text-center font-black text-yellow-100 drop-shadow-md animate-bounce-subtle"
          style={{
            fontSize: 'clamp(9px, 2.2vw, 18px)',
            letterSpacing: 'clamp(0.02em, 0.35vw, 0.12em)',
          }}
        >
          JOKER
        </span>
      </div>
    </div>
  )
}

/**
 * Декоративный “огонь” вокруг выигрышной карты.
 *
 * @param {{ tier: number }} props
 * @returns {JSX.Element}
 */
function PixelFire({ tier }) {
  const colors = TIER_COLORS[tier]?.flame || TIER_COLORS[0].flame

  return (
    <div className="absolute -inset-4 z-[-1] rounded-xl opacity-90 blur-sm mix-blend-screen overflow-hidden">
      <div className={`w-full h-full bg-gradient-to-t ${colors} animate-pulse-fast`} />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 animate-fire-rise bg-[length:20px_20px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-fire-wave" />
    </div>
  )
}

/**
 * Рендер одной карты (включая выигрышные эффекты и “пустое место” под карту).
 *
 * @param {{
 *   card: {suit: string, rank: number, id?: string} | undefined,
 *   index: number,
 *   isVisible: boolean,
 *   isWinning: boolean,
 *   isGrayedOut: boolean,
 *   handTier: number,
 *   isInteractable?: boolean
 * }} props
 * @returns {JSX.Element}
 */
export function Card({
  card,
  index,
  isVisible,
  isWinning,
  isGrayedOut,
  isVanishing = false,
  isAppearing = false,
  handTier,
  isInteractable = false,
}) {
  const cardClass = 'aspect-[100/140] w-[clamp(78px,24vw,124px)] sm:w-[clamp(56px,16vw,200px)]'
  const isJoker = card?.suit === 'joker'
  const rot = stableRotationDeg(card, index)

  const [clickCount, setClickCount] = useState(0)
  const [animState, setAnimState] = useState('idle')
  const clickTimerRef = useRef(null)
  const lastPointerDownAtRef = useRef(0)

  useEffect(() => {
    if (!isInteractable) {
      setClickCount(0)
      setAnimState('idle')
    }
  }, [isInteractable, card])

  const handleInteract = (e) => {
    // pointerdown работает и для мыши, и для тача — на мобильных это надёжнее, чем onClick
    e.stopPropagation()

    // Если браузер вызывает и pointerdown и click — защищаемся от двойного инкремента.
    if (e.type === 'click') {
      if (Date.now() - lastPointerDownAtRef.current < 350) return
    } else if (e.type === 'pointerdown') {
      lastPointerDownAtRef.current = Date.now()
    }

    if (!isInteractable || isWinning || isGrayedOut || isVanishing || isAppearing) return
    // Блокируем клики во время длинной анимации
    if (animState.startsWith('hide-peek')) return

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)

    const nextCount = clickCount + 1
    // Reset after 2s of inactivity
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0)
      setAnimState('idle') // Also reset animation to idle
    }, 2000)

    // Update count immediately
    setClickCount(nextCount)

    if (nextCount === 1) {
      setAnimState('shake-weak')
      setTimeout(() => {
        // Only reset if we haven't clicked again (this logic is simplified, 
        // real-world might need a ref to track "latest animation")
      setAnimState((prev) => (prev === 'shake-weak' ? 'idle' : prev))
      }, 400)
    } else if (nextCount === 2) {
      setAnimState('shake-strong')
      setTimeout(() => {
        setAnimState((prev) => (prev === 'shake-strong' ? 'idle' : prev))
      }, 500)
    } else if (nextCount >= 3) {
      // 0 -> hide right (index + 1)
      // 4 -> hide left (index - 1)
      // 1,2,3 -> random left or right
      let direction = 'right'
      if (index === 4) direction = 'left'
      else if (index > 0 && index < 4) direction = Math.random() > 0.5 ? 'right' : 'left'

      const animName = `hide-peek-${direction}`
      setAnimState(animName)
      setClickCount(0) // Reset sequence
      
      // Auto-reset after animation completes (2s)
      setTimeout(() => setAnimState('idle'), 2000)
    }
  }

  if (!isVisible || !card) {
    return (
      <div
        className={`${cardClass} relative bg-[#1e293b] rounded-lg border-[3px] border-[#0f172a] shadow-lg flex items-center justify-center transform transition-transform`}
      >
        <div className="w-full h-full opacity-20 bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-blue-900 animate-slow-spin-back" />
        <div className="absolute inset-2 border-2 border-dashed border-slate-600/30 rounded" />
      </div>
    )
  }

  const winningAnim = isWinning ? 'animate-card-float z-20' : ''
  
  let idleAnim = ''
  if (!isWinning && !isGrayedOut) {
    if (animState === 'shake-weak') idleAnim = 'animate-shake-weak'
    else if (animState === 'shake-strong') idleAnim = 'animate-shake-strong'
    else if (animState === 'hide-peek-right') idleAnim = 'animate-hide-peek-right'
    else if (animState === 'hide-peek-left') idleAnim = 'animate-hide-peek-left'
    else idleAnim = 'animate-card-idle'
  }

  const grayStyle = isGrayedOut ? 'opacity-40 grayscale brightness-50 scale-95 blur-[0.5px]' : ''
  const vanishAnim = isVanishing ? 'animate-cascade-vanish' : ''
  const appearAnim = isAppearing ? 'animate-cascade-appear' : ''

  const bgStyle = isJoker
    ? 'bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-700 shadow-[0_0_20px_#f59e0b]'
    : 'bg-[#e2e8f0]'

  const interactionStyle = isInteractable 
    ? 'cursor-pointer hover:-translate-y-2 hover:z-10 active:scale-95 transition-transform' 
    : ''

  // Упрощаем логику transform для надежности
  // Если есть анимация (кроме idle) или vanish/appear - убираем inline transform
  const shouldUseInlineTransform = 
    !isVanishing && 
    !isAppearing && 
    animState === 'idle' && 
    (isWinning || isGrayedOut || !isInteractable); // Если idle-анимация (isInteractable), то transform рулится CSS

  const hideBehindClass = animState.startsWith('hide-peek') ? 'repoker-hide-behind' : ''

  // Если isInteractable=true и animState=idle, то работает CSS animate-card-idle.
  // CSS: .animate-card-idle:hover { animation-play-state: paused; transform: translateY(-10px) ... }
  // Inline style transform: undefined.
  // Значит CSS должен работать.

  return (
    <div
      onPointerDown={handleInteract}
      // fallback (редко нужен, но пусть будет)
      onClick={handleInteract}
      className={`relative ${cardClass} ${hideBehindClass} transition-all duration-200 ease-out ${grayStyle} ${winningAnim} ${idleAnim} ${vanishAnim} ${appearAnim} ${interactionStyle}`}
      style={{
        '--rot': `${rot}deg`,
        transitionDuration: animState !== 'idle' ? '0ms' : 'calc(200ms * var(--repoker-time-factor, 1))',
        transitionDelay: isWinning ? '0ms' : `calc(${index * 40}ms * var(--repoker-time-factor, 1))`,
        transform: shouldUseInlineTransform
          ? (isWinning ? 'translateY(-25px) scale(1.15) rotate(0deg)' : `rotate(${rot}deg)`)
          : undefined
      }}
    >
      {isWinning && <PixelFire tier={handTier} />}

      <div
        className={[
          'relative w-full h-full rounded-lg overflow-hidden flex flex-col justify-between p-2',
          'border-[4px] border-[#0f172a] shadow-[5px_5px_0px_rgba(0,0,0,0.6)]',
          bgStyle,
        ].join(' ')}
      >
        {isJoker ? (
          <>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 animate-fire-rise" />
            <JokerVisual />
            <Holofoil />
          </>
        ) : (
          <>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/noise.png')]" />
            <div className="flex flex-col items-center absolute top-1 left-1 leading-none z-10">
              <span
                className={[
                  'text-xl md:text-3xl xl:text-4xl font-black font-press-start tracking-tighter',
                  card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-slate-800',
                ].join(' ')}
              >
                {RANK_NAMES[card.rank] || card.rank}
              </span>
              <PixelSuit type={card.suit} className="w-4 h-4 md:w-6 md:h-6 xl:w-8 xl:h-8 mt-1" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <PixelSuit
                type={card.suit}
                className={[
                  'w-14 h-14 md:w-24 md:h-24 xl:w-32 xl:h-32 opacity-80 drop-shadow-md',
                  card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-slate-800',
                ].join(' ')}
              />
            </div>
            <div className="flex flex-col items-center absolute bottom-1 right-1 leading-none transform rotate-180 z-10">
              <span
                className={[
                  'text-xl md:text-3xl xl:text-4xl font-black font-press-start tracking-tighter',
                  card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-slate-800',
                ].join(' ')}
              >
                {RANK_NAMES[card.rank] || card.rank}
              </span>
              <PixelSuit type={card.suit} className="w-4 h-4 md:w-6 md:h-6 xl:w-8 xl:h-8 mt-1" />
            </div>
            {isWinning && <Holofoil />}
          </>
        )}
      </div>

      {isWinning && <ElectricBorder />}
    </div>
  )
}

