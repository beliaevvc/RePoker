import React, { useEffect, useState } from 'react'
import { Crown, Play, RotateCcw } from 'lucide-react'
import './balatroInferno.css'

// --- CONFIGURATION ---
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
const RANK_NAMES = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: 'JOKER' }

// Цветовые схемы
const TIER_COLORS = {
  0: { flame: 'from-slate-700 to-slate-900', text: 'text-white' },
  1: { flame: 'from-blue-500 via-indigo-500 to-purple-500', text: 'text-blue-200' },
  2: { flame: 'from-emerald-400 via-green-500 to-teal-600', text: 'text-emerald-200' },
  3: { flame: 'from-fuchsia-500 via-purple-600 to-indigo-600', text: 'text-fuchsia-200' },
  4: { flame: 'from-orange-500 via-red-500 to-yellow-500', text: 'text-amber-200' },
  5: { flame: 'from-rose-500 via-red-600 to-orange-600', text: 'text-rose-200' }, // 3 Jokers
  6: { flame: 'from-purple-600 via-pink-600 to-red-600', text: 'text-purple-100' }, // 4 Jokers
  7: { flame: 'from-yellow-400 via-orange-500 to-red-600', text: 'text-yellow-100' }, // 5 Jokers (MAX WIN)
}

const HAND_TIERS = {
  '5 Jokers': 7,
  '4 Jokers': 6,
  '3 Jokers': 5,
  'Royal Flush': 4,
  'Straight Flush': 4,
  'Five of a Kind': 4, // With Joker
  'Four of a Kind': 3,
  'Full House': 3,
  Flush: 2,
  Straight: 2,
  'Three of a Kind': 2,
  'Two Pair': 1,
  Pair: 1,
  'High Card': 0,
}

const HAND_MULTIPLIERS = {
  '5 Jokers': 150000,
  '4 Jokers': 10000,
  '3 Jokers': 5000,
  'Royal Flush': 1000,
  'Straight Flush': 200,
  'Five of a Kind': 150,
  'Four of a Kind': 60,
  'Full House': 30,
  Flush: 20,
  Straight: 15,
  'Three of a Kind': 8,
  'Two Pair': 4,
  Pair: 2,
  'High Card': 0,
}

// --- ASSETS ---
const PixelSuit = ({ type, className }) => {
  if (type === 'joker') return <Crown className={className} />

  const isRed = type === 'hearts' || type === 'diamonds'
  const fill = isRed ? '#ef4444' : '#334155'
  const paths = {
    // Сетка 11x11
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
      'M4 1 h3 v1 h-3 z ' + // Верхний круг (верх)
      'M3 2 h5 v1 h-5 z ' + // Верхний круг (середина)
      'M4 3 h3 v1 h-3 z ' + // Верхний круг (низ)
      'M1 4 h3 v1 h-3 z M7 4 h3 v1 h-3 z ' + // Боковые круги (верхушки)
      'M5 4 h1 v1 h-1 z ' + // Соединение в центре
      'M0 5 h5 v1 h-5 z M6 5 h5 v1 h-5 z ' + // Боковые круги (середина)
      'M5 5 h1 v1 h-1 z ' + // Центр
      'M1 6 h3 v1 h-3 z M7 6 h3 v1 h-3 z ' + // Боковые круги (низ)
      'M5 6 h1 v2 h-1 z ' + // Начало ножки (линия вниз 2 пикселя)
      'M4 8 h3 v1 h-3 z ' + // Расширение ножки
      'M3 9 h5 v1 h-5 z', // Основание
    spades:
      'M5 1 h1 v1 h-1 z ' + // Острие
      'M4 2 h3 v1 h-3 z ' +
      'M3 3 h5 v1 h-5 z ' +
      'M2 4 h7 v1 h-7 z ' +
      'M1 5 h9 v1 h-9 z ' + // Самая широкая часть
      'M1 6 h9 v1 h-9 z ' +
      'M2 7 h3 v1 h-3 z M6 7 h3 v1 h-3 z ' + // Закругление низа ("юбочка")
      'M5 7 h1 v2 h-1 z ' + // Ножка (тонкая часть)
      'M4 8 h3 v1 h-3 z ' + // Утолщение ножки
      'M3 9 h5 v1 h-5 z', // Основание
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

// --- LOGIC ---
const createDeck = () => {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: Math.random().toString(36).slice(2, 11) })
    }
  }

  // ADD ONE GOLDEN JOKER
  deck.push({ suit: 'joker', rank: 15, id: 'joker-card' })

  // RARE: Add extra jokers (Chaos Mode probability)
  // Chance to have a deck capable of 3+ jokers
  const chaosRoll = Math.random()
  if (chaosRoll < 0.001) {
    // 0.1% chance: Super Loaded Deck (up to 5 jokers)
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-2' })
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-3' })
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-4' })
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-5' })
  } else if (chaosRoll < 0.005) {
     // 0.4% chance: Loaded Deck (up to 3 jokers)
     deck.push({ suit: 'joker', rank: 15, id: 'joker-card-2' })
     deck.push({ suit: 'joker', rank: 15, id: 'joker-card-3' })
  }

  return deck.sort(() => Math.random() - 0.5)
}

const stableRotationDeg = (card, index) => {
  const s = `${card?.id ?? 'empty'}:${index}`
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0
  const unit = hash / 0xffffffff // 0..1
  return unit * 4 - 2 // -2..2
}

// --- EVALUATOR WITH WILDCARD SUPPORT ---
const getBestHand = (cards) => {
  // Простая оценка без джокеров
  const evaluateStandard = (testCards) => {
    // Важно: testCards содержат поле idx — индекс карты в исходной руке (0..4)
    const sorted = [...testCards].sort((a, b) => a.rank - b.rank)
    const ranks = sorted.map((c) => c.rank)
    const suits = sorted.map((c) => c.suit)
    const isFlush = new Set(suits).size === 1
    const isStraight =
      ranks.every((val, i) => i === 0 || val === ranks[i - 1] + 1) ||
      ranks.join(',') === '2,3,4,5,14'

    const rankToIdxs = new Map()
    for (const c of testCards) {
      const arr = rankToIdxs.get(c.rank) ?? []
      arr.push(c.idx)
      rankToIdxs.set(c.rank, arr)
    }
    const countsValues = [...rankToIdxs.values()].map((v) => v.length).sort((a, b) => b - a)

    const allIdx = testCards.map((c) => c.idx).sort((a, b) => a - b)
    const idxsOfRank = (r) => (rankToIdxs.get(r) ?? []).slice().sort((a, b) => a - b)
    const rankGroupsDesc = [...rankToIdxs.entries()]
      .map(([rank, idxs]) => ({ rank, idxs }))
      .sort((a, b) => b.idxs.length - a.idxs.length || b.rank - a.rank)

    if (isFlush && isStraight && ranks[4] === 14 && ranks[0] === 10)
      return {
        name: 'Royal Flush',
        multiplier: HAND_MULTIPLIERS['Royal Flush'],
        score: 1000,
        winningIndices: allIdx,
      }
    if (isFlush && isStraight)
      return {
        name: 'Straight Flush',
        multiplier: HAND_MULTIPLIERS['Straight Flush'],
        score: 900,
        winningIndices: allIdx,
      }
    if (countsValues[0] === 5)
      return {
        name: 'Five of a Kind',
        multiplier: HAND_MULTIPLIERS['Five of a Kind'],
        score: 850,
        winningIndices: allIdx,
      } // Possible with Joker
    if (countsValues[0] === 4)
      return {
        name: 'Four of a Kind',
        multiplier: HAND_MULTIPLIERS['Four of a Kind'],
        score: 800,
        winningIndices: rankGroupsDesc[0]?.idxs.slice().sort((a, b) => a - b) ?? [],
      }
    if (countsValues[0] === 3 && countsValues[1] === 2)
      return {
        name: 'Full House',
        multiplier: HAND_MULTIPLIERS['Full House'],
        score: 700,
        winningIndices: allIdx,
      }
    if (isFlush)
      return { name: 'Flush', multiplier: HAND_MULTIPLIERS.Flush, score: 600, winningIndices: allIdx }
    if (isStraight)
      return { name: 'Straight', multiplier: HAND_MULTIPLIERS.Straight, score: 500, winningIndices: allIdx }
    if (countsValues[0] === 3)
      return {
        name: 'Three of a Kind',
        multiplier: HAND_MULTIPLIERS['Three of a Kind'],
        score: 400,
        winningIndices: rankGroupsDesc[0]?.idxs.slice().sort((a, b) => a - b) ?? [],
      }
    if (countsValues[0] === 2 && countsValues[1] === 2)
      return {
        name: 'Two Pair',
        multiplier: HAND_MULTIPLIERS['Two Pair'],
        score: 300,
        winningIndices: [...(rankGroupsDesc[0]?.idxs ?? []), ...(rankGroupsDesc[1]?.idxs ?? [])].sort(
          (a, b) => a - b,
        ),
      }
    if (countsValues[0] === 2) {
      const pairRank = rankGroupsDesc[0]?.rank
      return {
        name: 'Pair',
        multiplier: HAND_MULTIPLIERS.Pair,
        score: 200,
        winningIndices: pairRank != null ? idxsOfRank(pairRank) : [],
      }
    }
    return { name: 'High Card', multiplier: 0, score: 0, winningIndices: [] }
  }

  // 1. Ищем джокеров
  const jokerIndices = cards
    .map((c, idx) => (c.suit === 'joker' ? idx : -1))
    .filter((idx) => idx !== -1)

  const jokerCount = jokerIndices.length

  // SPECIAL JOKER HANDS
  if (jokerCount === 5) {
    return {
      name: '5 Jokers',
      multiplier: HAND_MULTIPLIERS['5 Jokers'],
      score: 100000,
      winningIndices: [0, 1, 2, 3, 4],
    }
  }
  if (jokerCount === 4) {
    return {
      name: '4 Jokers',
      multiplier: HAND_MULTIPLIERS['4 Jokers'],
      score: 50000,
      winningIndices: jokerIndices,
    }
  }
  if (jokerCount === 3) {
    return {
      name: '3 Jokers',
      multiplier: HAND_MULTIPLIERS['3 Jokers'],
      score: 10000,
      winningIndices: jokerIndices,
    }
  }

  if (jokerCount === 0) {
    // Нет джокера - стандартная проверка
    return evaluateStandard(cards.map((c, idx) => ({ ...c, idx })))
  }

  // 2. Есть джокер(ы) (1 или 2): брутфорс
  // Если джокеров 2, мы перебираем комбинации для обоих.
  // Это 52*52 = 2704 итерации, что приемлемо.
  
  let bestResult = { name: 'High Card', multiplier: 0, score: -1, winningIndices: [] }
  
  // Карты без джокеров
  const fixedCards = cards.map((c, idx) => ({ ...c, idx })).filter(c => c.suit !== 'joker')
  
  // Рекурсивный брутфорс
  const tryJokerCombinations = (currentCards, jokersLeftToReplace) => {
    if (jokersLeftToReplace.length === 0) {
      const res = evaluateStandard(currentCards)
      if (res.score > bestResult.score) bestResult = res
      return
    }

    const currentJokerIdx = jokersLeftToReplace[0]
    const remainingJokers = jokersLeftToReplace.slice(1)

    for (const s of SUITS) {
      for (const r of RANKS) {
        // Оптимизация: для Royal/Straight Flush нам важны только определенные карты
        // Но полный перебор надежнее
        const newCard = { suit: s, rank: r, idx: currentJokerIdx }
        tryJokerCombinations([...currentCards, newCard], remainingJokers)
      }
    }
  }

  tryJokerCombinations(fixedCards, jokerIndices)

  // Если выигрышные индексы не включают джокеров (например High Card),
  // нужно убедиться, что джокеры не подсвечиваются как выигрышные, 
  // ИЛИ наоборот, если джокер помог собрать комбинацию, он должен быть подсвечен.
  // evaluateStandard возвращает winningIndices на основе idx.
  // idx джокера мы прокинули. Так что всё ок.

  return bestResult
}

// --- COMPONENTS ---
const ElectricBorder = () => (
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

const PixelFire = ({ tier }) => {
  const isMaxWin = tier === 7
  const colors = TIER_COLORS[tier]?.flame || TIER_COLORS[0].flame
  
  if (isMaxWin) {
     return (
       <div className="absolute -inset-4 z-[-1] rounded-xl opacity-100 blur-sm overflow-hidden">
         <div className="w-full h-full bg-gradient-to-t from-yellow-600 via-red-600 to-black animate-pulse-fast mix-blend-hard-light" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-80 animate-fire-rise bg-[length:30px_30px]" />
         <div className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-100/60 to-transparent animate-fire-wave" />
         <div className="absolute inset-0 bg-white/10 animate-pulse mix-blend-overlay" />
       </div>
     )
  }

  return (
    <div className="absolute -inset-4 z-[-1] rounded-xl opacity-90 blur-sm mix-blend-screen overflow-hidden">
      <div className={`w-full h-full bg-gradient-to-t ${colors} animate-pulse-fast`} />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30 animate-fire-rise bg-[length:20px_20px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-fire-wave" />
    </div>
  )
}

const Holofoil = () => (
  <div className="absolute inset-0 z-20 opacity-40 mix-blend-overlay pointer-events-none rounded-lg overflow-hidden">
    <div className="absolute inset-[-150%] bg-gradient-to-r from-transparent via-white/50 to-transparent rotate-[25deg] animate-holofoil-sweep" />
    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.1)_3px,rgba(255,255,255,0.1)_4px)]" />
  </div>
)

// --- ELECTRIC BALL ORBS (SVG) ---
const ElectricPlasmaOrbs = ({ streak }) => {
  const maxDots = 5
  const dots = Array.from({ length: maxDots }, (_, i) => i)

  const getOrbColor = (count) => {
    if (count >= 5) return '#f59e0b' // Gold
    if (count >= 3) return '#d946ef' // Purple
    return '#3b82f6' // Blue
  }

  const activeColor = getOrbColor(streak)

  return (
    <div className="flex gap-4 md:gap-6 justify-center w-full relative z-20 h-12 items-center">
      {dots.map((i) => {
        const isActive = i < streak

        return (
          <div
            key={i}
            className={[
              'relative transition-all duration-300 rounded-full flex items-center justify-center',
              isActive
                ? 'w-10 h-10 md:w-12 md:h-12 scale-110 z-10'
                : 'w-4 h-4 md:w-6 md:h-6 bg-[#0f172a] border border-[#1e293b] opacity-30',
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

// --- BIG LOGO ---
const MaxWinPoster = () => (
  <div className="absolute top-0 md:top-1 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center select-none z-0">
    <div className="text-xs md:text-sm font-black text-yellow-400 tracking-[0.2em] transform -skew-x-12 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
      MAX WIN
    </div>
    <div className="text-2xl md:text-4xl font-black text-gold-shimmer tracking-tighter transform -skew-x-12 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mt-[-2px] md:mt-[-4px]">
      150,000X
    </div>
  </div>
)

const ResimpleLogo = () => (
  <div className="relative group cursor-pointer w-full flex justify-center mt-2 mb-2">
    <div className="relative animate-logo-glitch whitespace-nowrap">
      <span className="text-2xl md:text-4xl font-black tracking-[0.1em] text-white/90 drop-shadow-[2px_2px_0_#000] select-none uppercase font-mono">
        RESIMPLE <span className="font-bold tracking-[0.3em] opacity-80">GAMES</span>
      </span>

      <span
        className="absolute top-0 left-[-2px] text-white/40 opacity-0 animate-glitch-text-1 mix-blend-overlay text-2xl md:text-4xl tracking-[0.1em] font-black uppercase font-mono w-full"
        aria-hidden="true"
      >
        RESIMPLE <span className="font-bold tracking-[0.3em]">GAMES</span>
      </span>
      <span
        className="absolute top-0 left-[2px] text-gray-400/40 opacity-0 animate-glitch-text-2 mix-blend-overlay text-2xl md:text-4xl tracking-[0.1em] font-black uppercase font-mono w-full"
        aria-hidden="true"
      >
        RESIMPLE <span className="font-bold tracking-[0.3em]">GAMES</span>
      </span>
    </div>
  </div>
)

const JokerVisual = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
    <div className="relative">
      <Crown
        size={64}
        className="text-yellow-100 fill-yellow-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse"
      />
      <div className="absolute top-0 left-0 w-full h-full animate-ping opacity-20 bg-yellow-400 rounded-full blur-xl" />
    </div>
    <span className="mt-2 text-2xl font-black text-yellow-100 tracking-widest drop-shadow-md animate-bounce-subtle">
      JOKER
    </span>
  </div>
)

const Card = ({ card, index, isVisible, isWinning, isGrayedOut, handTier }) => {
  const cardClass = 'w-[17vw] h-[24vw] max-w-[130px] max-h-[180px] xl:max-w-[200px] xl:max-h-[280px]'
  const isJoker = card?.suit === 'joker'
  const rot = stableRotationDeg(card, index)

  if (!isVisible || !card) {
    return (
      <div className={`${cardClass} relative bg-[#1e293b] rounded-lg border-[3px] border-[#0f172a] shadow-lg flex items-center justify-center transform transition-transform`}>
        <div className="w-full h-full opacity-20 bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-blue-900 animate-slow-spin-back" />
        <div className="absolute inset-2 border-2 border-dashed border-slate-600/30 rounded" />
      </div>
    )
  }

  const winningAnim = isWinning ? 'animate-card-float z-20' : ''
  const idleAnim = !isWinning && !isGrayedOut ? 'animate-card-idle' : ''
  const grayStyle = isGrayedOut ? 'opacity-40 grayscale brightness-50 scale-95 blur-[0.5px]' : ''

  // Joker Background Style
  const bgStyle = isJoker
    ? 'bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-700 shadow-[0_0_20px_#f59e0b]'
    : 'bg-[#e2e8f0]'

  return (
    <div
      className={`relative ${cardClass} transition-all duration-200 ease-out ${grayStyle} ${winningAnim} ${idleAnim}`}
      style={{
        '--rot': `${rot}deg`,
        transitionDelay: isWinning ? '0ms' : `${index * 40}ms`,
        transform: isWinning ? 'translateY(-25px) scale(1.15) rotate(0deg)' : `rotate(${rot}deg)`,
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

export default function BalatroInferno() {
  const [balance, setBalance] = useState(100)
  const [bet, setBet] = useState(10)
  const [streak, setStreak] = useState(0)
  const [hand, setHand] = useState([])
  const [gameState, setGameState] = useState('idle')
  const [result, setResult] = useState(null)
  const [deck, setDeck] = useState(() => createDeck())
  const [dealIndex, setDealIndex] = useState(0)

  useEffect(() => {
    if (gameState === 'dealing') {
      if (dealIndex < 5) {
        const timer = setTimeout(() => {
          setHand((prev) => [...prev, deck[dealIndex]])
          setDealIndex((prev) => prev + 1)
        }, 40)
        return () => clearTimeout(timer)
      }
      const timer = setTimeout(() => setGameState('suspense'), 0)
      return () => clearTimeout(timer)
    }

    if (gameState === 'suspense') {
      const timer = setTimeout(() => {
        const evalResult = getBestHand(hand)
        setResult(evalResult)

        if (evalResult.multiplier > 0) {
          setBalance((prev) => prev + bet * evalResult.multiplier)
          setStreak((s) => Math.min(s + 1, 5))
        } else {
          setStreak(0)
        }

        setGameState('result')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [gameState, dealIndex, deck, hand, bet])

  const handleDeal = () => {
    if (balance < bet) return
    setBalance((prev) => prev - bet)
    setHand([])
    setResult(null)
    setDealIndex(0)
    setDeck(createDeck())
    setGameState('dealing')
  }

  const adjustBet = (amount) => {
    if (gameState !== 'idle' && gameState !== 'result') return
    const newBet = Math.max(5, Math.min(balance, bet + amount))
    setBet(newBet)
  }

  // DEBUG: Force specific hands
  const forceHand = (jokerCount) => {
    if (gameState !== 'idle' && gameState !== 'result') return

    const forcedDeck = []
    // Add jokers
    for (let i = 0; i < jokerCount; i++) {
      forcedDeck.push({ suit: 'joker', rank: 15, id: `force-joker-${i}` })
    }
    // Fill rest with random cards
    const tempDeck = createDeck().filter(c => c.suit !== 'joker')
    
    let added = 0
    for (const card of tempDeck) {
      if (added >= (5 - jokerCount)) break
      forcedDeck.push(card)
      added++
    }

    setBalance((prev) => prev - bet)
    setHand([])
    setResult(null)
    setDeck(forcedDeck)
    setDealIndex(0) 
    setGameState('dealing')
  }

  const tier = gameState === 'result' && result ? HAND_TIERS[result.name] : 0
  const isWin = gameState === 'result' && (result?.multiplier ?? 0) > 0
  const isLose = gameState === 'result' && result?.multiplier === 0
  const shakeClass = isWin ? (tier >= 3 ? 'animate-shake-violent' : 'animate-shake-mid') : ''

  return (
    <div className="min-h-screen bg-[#020617] font-press-start overflow-hidden select-none relative flex flex-col">
      <div className="absolute inset-[-50%] animate-spin-slow origin-center z-0 pointer-events-none opacity-60">
        <div className="w-full h-full bg-[conic-gradient(from_0deg,#0f172a,#1e1b4b,#312e81,#0f172a)] blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 z-0" />
      <div className="fixed inset-0 z-[100] pointer-events-none crt-overlay" />

      <div className={`relative z-10 w-full flex-1 flex flex-col items-center justify-between py-6 md:py-8 ${shakeClass}`}>
        
        {/* MAX WIN CENTERED OVERLAY - MOVED TO TOP */}
        <div className={`absolute top-0 inset-x-0 z-[70] pointer-events-none flex flex-col items-center justify-center pt-8 md:pt-12 transition-all duration-300 ${tier === 7 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
             <div className="flex flex-col items-center animate-shake-violent">
                 <div className="text-5xl md:text-7xl xl:text-9xl font-black text-gold-shimmer drop-shadow-[0_0_20px_rgba(255,215,0,0.6)] tracking-tighter animate-pulse transform -skew-x-12">
                   MAX WIN
                 </div>
                 <div className="text-3xl md:text-5xl text-white font-bold mt-4 drop-shadow-[4px_4px_0_#000] tracking-widest">
                   150,000X
                 </div>
             </div>
        </div>

        <div className="w-full max-w-5xl px-4 flex justify-between items-start gap-4 relative">
          <div className={`bg-[#1e293b] border-l-4 border-blue-500 pl-4 pr-6 py-2 rounded-r-xl shadow-lg skew-x-[-10deg] z-10 transition-opacity duration-300 ${tier === 7 ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-[10px] text-blue-300 uppercase tracking-widest skew-x-[10deg]">CHIPS</div>
            <div className="text-2xl md:text-3xl text-white skew-x-[10deg]">${balance}</div>
          </div>
          
          {tier !== 7 && <MaxWinPoster />}

          <div className={`bg-[#1e293b] border-r-4 border-red-500 pr-4 pl-6 py-2 rounded-l-xl shadow-lg skew-x-[-10deg] z-10 transition-opacity duration-300 ${tier === 7 ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-[10px] text-red-300 uppercase tracking-widest skew-x-[10deg] text-right">ANTE</div>
            <div className="text-2xl md:text-3xl text-white skew-x-[10deg] text-right">${bet}</div>
          </div>
        </div>

        <div className="relative w-full flex flex-col items-center justify-center flex-1 gap-4 md:gap-8">
          {/* Reserve space for the top banner so cards never "jump" */}
          <div className="h-28 md:h-32" />

          <div className={`absolute top-0 z-50 transition-all duration-150 ${isWin && tier !== 7 ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'}`}>
            <div
              className={[
                'bg-[#0f0f15] border-[4px] border-white px-8 py-4 shadow-[10px_10px_0_rgba(0,0,0,0.8)] transform rotate-[-3deg]',
                tier >= 3 ? 'animate-glitch' : 'animate-bounce-subtle',
              ].join(' ')}
            >
              <div className={`text-2xl md:text-5xl uppercase text-white text-center leading-none ${TIER_COLORS[tier]?.text}`}>
                {result?.name}
              </div>
              <div className="text-lg md:text-2xl text-center mt-2 text-white">+${result ? bet * result.multiplier : 0}</div>
            </div>
            <div className="absolute inset-0 -z-10 animate-ping opacity-50 bg-white rounded-xl" />
          </div>

          <div className={`absolute top-4 z-50 transition-all duration-150 ${isLose ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'}`}>
            <div className="bg-[#18181b] border-[4px] border-slate-700 px-6 py-3 shadow-[8px_8px_0_rgba(0,0,0,0.8)] transform rotate-[2deg] animate-static-shake">
              <div className="text-xl md:text-3xl uppercase text-slate-500 text-center leading-none tracking-tight animate-flicker-text">
                HIGH CARD
              </div>
              <div className="text-xs md:text-sm text-center mt-1 text-red-900 uppercase tracking-widest font-bold">
                NO CHIPS
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 md:gap-8 w-full">
            <div className="flex items-center justify-center gap-2 md:gap-4 xl:gap-6 perspective-1000">
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

            <ElectricPlasmaOrbs streak={streak} />
          </div>
        </div>

        <div className="w-full max-w-2xl px-4 flex flex-col gap-2">
          <ResimpleLogo />

          <div className="flex gap-4 h-16 md:h-20 w-full">
            <div className="flex flex-col w-24 gap-2">
              <button
                onClick={() => adjustBet(10)}
                disabled={gameState !== 'idle' && gameState !== 'result'}
                className="flex-1 bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 rounded text-white active:border-b-0 active:translate-y-1 text-xl"
              >
                +
              </button>
              <button
                onClick={() => adjustBet(-10)}
                disabled={gameState !== 'idle' && gameState !== 'result'}
                className="flex-1 bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 rounded text-white active:border-b-0 active:translate-y-1 text-xl"
              >
                -
              </button>
            </div>

            <button
              onClick={handleDeal}
              disabled={gameState === 'dealing' || gameState === 'suspense'}
              className={[
                'flex-1 relative group overflow-hidden',
                'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500',
                'border-b-[8px] border-[#7f1d1d] rounded-xl',
                'shadow-[0_10px_20px_rgba(220,38,38,0.3)]',
                'active:border-b-0 active:translate-y-2 active:shadow-none',
                'disabled:filter disabled:grayscale disabled:cursor-not-allowed',
                'transition-all flex items-center justify-center gap-4',
              ].join(' ')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />

              {gameState === 'dealing' || gameState === 'suspense' ? (
                <RotateCcw className="w-8 h-8 md:w-12 md:h-12 animate-spin text-white" />
              ) : (
                <Play className="w-8 h-8 md:w-12 md:h-12 fill-white text-white" />
              )}
              <span className="text-2xl md:text-4xl text-white tracking-widest drop-shadow-md font-black">
                {gameState === 'suspense' ? '...' : 'PLAY'}
              </span>
            </button>

            {/* DEBUG BUTTONS */}
            <div className="flex flex-col gap-1 w-8 opacity-10 hover:opacity-100 transition-opacity justify-center">
               <button onClick={() => forceHand(3)} className="h-6 bg-rose-900 border border-rose-500 text-[8px] text-white font-mono flex items-center justify-center hover:bg-rose-700" title="3 Jokers">3J</button>
               <button onClick={() => forceHand(4)} className="h-6 bg-purple-900 border border-purple-500 text-[8px] text-white font-mono flex items-center justify-center hover:bg-purple-700" title="4 Jokers">4J</button>
               <button onClick={() => forceHand(5)} className="h-6 bg-yellow-900 border border-yellow-500 text-[8px] text-white font-mono flex items-center justify-center hover:bg-yellow-700" title="5 Jokers">5J</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


