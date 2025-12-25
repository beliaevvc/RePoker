/**
 * Файл: src/ui/components/LoadingScreen.jsx
 * Слой: ui
 * Назначение: экран загрузки с Royal Flush, анимацией в стиле игры и прогресс-баром.
 */

import '../../balatroInferno.css'
import { Card } from '../screens/balatro-inferno/components/Card'
import { useEffect, useRef, useState } from 'react'

/**
 * @param {{
 *  resourceProgress?: number,
 *  resourcesReady?: boolean,
 *  onAnimationDone?: () => void
 * }} props
 */
export function LoadingScreen({ resourceProgress = 0, resourcesReady = false, onAnimationDone }) {
  const loadingCards = [
    { suit: 'hearts', rank: 10, id: 'loading-10' },
    { suit: 'hearts', rank: 11, id: 'loading-J' },
    { suit: 'joker', rank: 15, id: 'loading-joker' },
    { suit: 'hearts', rank: 13, id: 'loading-K' },
    { suit: 'hearts', rank: 14, id: 'loading-A' },
  ]

  // Тайминги (мс) - быстрые
  const DEAL_DELAY = 80
  const AFTER_DEAL = 150
  const FLIP_DURATION = 200
  const FLIP_GAP = 40
  const AFTER_FLIP = 150
  const WIN_INTRO = 200
  const FINAL_HOLD = 800

  const DEAL_END = DEAL_DELAY * 5
  const FLIP_START = DEAL_END + AFTER_DEAL
  const PER_FLIP = FLIP_DURATION + FLIP_GAP
  const FLIP_END = FLIP_START + 5 * PER_FLIP - FLIP_GAP
  const WIN_START = FLIP_END + AFTER_FLIP
  const WIN_END = WIN_START + WIN_INTRO
  const ANIM_END = WIN_END + FINAL_HOLD

  const [tMs, setTMs] = useState(0)
  const startRef = useRef(0)
  const rafRef = useRef(0)
  const doneFiredRef = useRef(false)

  const [visibleCount, setVisibleCount] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)
  const [isWinning, setIsWinning] = useState(false)
  const [progress, setProgress] = useState(0)

  // Анимация времени
  useEffect(() => {
    startRef.current = performance.now()
    const tick = () => {
      const elapsed = Math.max(0, performance.now() - startRef.current)
      setTMs(elapsed)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Обновление состояний карт
  useEffect(() => {
    // Появление рубашек по одной
    if (tMs < 1) {
      setVisibleCount(0)
    } else {
      const count = Math.min(5, Math.floor((tMs - 1) / DEAL_DELAY) + 1)
      setVisibleCount(count)
    }

    // Открытие строго по одной
    let rev = 0
    for (let i = 0; i < 5; i++) {
      const flipStartTime = FLIP_START + i * PER_FLIP
      if (tMs >= flipStartTime + FLIP_DURATION) {
        rev = i + 1
      }
    }
    setRevealedCount(Math.min(5, rev))

    setIsWinning(tMs >= WIN_START)
  }, [tMs])

  // Прогресс-бар
  useEffect(() => {
    if (tMs < ANIM_END) {
      const animPart = (tMs / ANIM_END) * 95
      setProgress(animPart)
      return
    }

    if (resourcesReady) {
      setProgress(100)
      return
    }

    const res = Math.max(0, Math.min(100, resourceProgress))
    const tail = 95 + (res / 100) * 4.5
    setProgress(Math.min(99.5, tail))
  }, [tMs, ANIM_END, resourcesReady, resourceProgress])

  // Сигнал завершения анимации
  useEffect(() => {
    if (doneFiredRef.current) return
    if (tMs < ANIM_END) return
    doneFiredRef.current = true
    onAnimationDone?.()
  }, [tMs, ANIM_END, onAnimationDone])

  const centerIndex = 2

  return (
    <div
      className="fixed inset-0 bg-gradient-to-b from-[#020617] via-[#0a1628] to-[#020617] flex flex-col items-center justify-center z-[9999]"
      style={{
        backgroundColor: '#020617',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
      }}
    >
      {/* Контейнер карт - центрирован */}
      <div
        className="relative mb-16"
        style={{
          width: '100%',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loadingCards.map((card, index) => {
          const distanceFromCenter = index - centerIndex
          const offsetX = distanceFromCenter * 100
          const rotation = distanceFromCenter * 8
          const offsetY = Math.abs(distanceFromCenter) * 8
          const zIndex = card.suit === 'joker' ? 15 : 10 - Math.abs(distanceFromCenter)

          const slotVisible = index < visibleCount

          // Прогресс flip для этой карты
          const flipStartTime = FLIP_START + index * PER_FLIP
          const flipProgress = Math.max(0, Math.min(1, (tMs - flipStartTime) / FLIP_DURATION))
          const flipped = index < revealedCount
          const isFlipping = flipProgress > 0 && flipProgress < 1
          const flipAngle = flipped ? 180 : flipProgress * 180

          const isWinningCard = isWinning && flipped

          return (
            <div
              key={card.id}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translateX(${offsetX}px) translateY(${-offsetY}px) rotate(${rotation}deg)`,
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
                zIndex,
                opacity: slotVisible ? 1 : 0,
                transition: 'opacity 0.15s ease-out',
              }}
            >
              <div
                className="repoker-loading-flip"
                style={{
                  transform: `rotateY(${flipAngle}deg)`,
                  transition: isFlipping ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                }}
              >
                <div className="repoker-loading-face repoker-loading-face-back">
                  <Card
                    card={undefined}
                    index={index}
                    isVisible={true}
                    isWinning={false}
                    isGrayedOut={false}
                    isVanishing={false}
                    isAppearing={false}
                    handTier={4}
                    isInteractable={false}
                  />
                </div>

                <div className="repoker-loading-face repoker-loading-face-front">
                  <Card
                    card={card}
                    index={index}
                    isVisible={true}
                    isWinning={isWinningCard}
                    isGrayedOut={false}
                    isVanishing={false}
                    isAppearing={false}
                    handTier={4}
                    isInteractable={false}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Прогресс-бар */}
      <div className="w-full max-w-md px-4">
        <div className="relative">
          <div className="mb-2 text-center">
            <div className="text-[clamp(20px,4vw,32px)] text-white font-press-start drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
              {Math.round(progress)}%
            </div>
          </div>

          <div className="relative h-4 bg-[#0f172a] border-2 border-slate-600 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                transformOrigin: 'left center',
                transform: `scaleX(${Math.max(0, Math.min(1, progress / 100))})`,
                willChange: 'transform',
                transition: 'transform 0.05s linear',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            <div className="absolute inset-0 bg-[url('/textures/noise.svg')] opacity-10 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
