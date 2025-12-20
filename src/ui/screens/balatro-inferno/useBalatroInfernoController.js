/**
 * Файл: src/ui/screens/balatro-inferno/useBalatroInfernoController.js
 * Слой: ui
 * Назначение: контроллер-хук экрана BalatroInferno: хранит состояние, запускает таймеры, вызывает use-cases.
 *
 * Инварианты:
 * - Поведение 1:1 со старым монолитом `src/BalatroInferno.jsx`.
 * - UI остаётся “тонким”: вся оркестрация состояния и таймеров живёт здесь.
 */

import { useEffect, useMemo, useState } from 'react'
import { HAND_TIERS } from '../../../domain/hand-evaluator/constants'
import { getBestHand } from '../../../domain/hand-evaluator/getBestHand'
import { createDeck } from '../../../domain/deck/createDeck'

import { adjustBetUseCase } from '../../../application/game/usecases/adjustBet'
import { startDealUseCase } from '../../../application/game/usecases/startDeal'
import { resolveResultUseCase } from '../../../application/game/usecases/resolveResult'
import { forceHandUseCase } from '../../../application/game/usecases/forceHand'

import { nativeRng } from '../../../infrastructure/rng/nativeRng'
import { browserClock } from '../../../infrastructure/clock/browserClock'

/**
 * Контроллер состояния экрана.
 *
 * @returns {{
 *   balance: number,
 *   bet: number,
 *   streak: number,
 *   hand: any[],
 *   deck: any[],
 *   dealIndex: number,
 *   gameState: string,
 *   result: any,
 *   tier: number,
 *   isWin: boolean,
 *   isLose: boolean,
 *   shakeClass: string,
 *   handleDeal: () => void,
 *   adjustBet: (amount: number) => void,
 *   forceHand: (jokerCount: number) => void,
 * }}
 */
export function useBalatroInfernoController() {
  const [balance, setBalance] = useState(100)
  const [bet, setBet] = useState(10)
  const [streak, setStreak] = useState(0)
  const [hand, setHand] = useState([])
  const [gameState, setGameState] = useState('idle')
  const [result, setResult] = useState(null)
  const [deck, setDeck] = useState(() => createDeck(nativeRng))
  const [dealIndex, setDealIndex] = useState(0)

  useEffect(() => {
    if (gameState === 'dealing') {
      if (dealIndex < 5) {
        const timer = browserClock.setTimeout(() => {
          setHand((prev) => [...prev, deck[dealIndex]])
          setDealIndex((prev) => prev + 1)
        }, 40)
        return () => browserClock.clearTimeout(timer)
      }
      const timer = browserClock.setTimeout(() => setGameState('suspense'), 0)
      return () => browserClock.clearTimeout(timer)
    }

    if (gameState === 'suspense') {
      const timer = browserClock.setTimeout(() => {
        const evalResult = getBestHand(hand)
        const resolved = resolveResultUseCase({ balance, bet, streak, evalResult })
        setResult(resolved.result)
        setBalance(resolved.balance)
        setStreak(resolved.streak)
        setGameState(resolved.gameState)
      }, 300)
      return () => browserClock.clearTimeout(timer)
    }
  }, [gameState, dealIndex, deck, hand, bet, balance, streak])

  const handleDeal = () => {
    const next = startDealUseCase({ balance, bet }, { rng: nativeRng })
    if (!next) return
    setBalance(next.balance)
    setHand(next.hand)
    setResult(next.result)
    setDealIndex(next.dealIndex)
    setDeck(next.deck)
    setGameState(next.gameState)
  }

  const adjustBet = (amount) => {
    const newBet = adjustBetUseCase({ bet, balance, delta: amount, gameState })
    setBet(newBet)
  }

  const forceHand = (jokerCount) => {
    if (gameState !== 'idle' && gameState !== 'result') return
    const next = forceHandUseCase({ balance, bet }, { rng: nativeRng }, jokerCount)
    if (!next) return
    setBalance(next.balance)
    setHand(next.hand)
    setResult(next.result)
    setDeck(next.deck)
    setDealIndex(next.dealIndex)
    setGameState(next.gameState)
  }

  const tier = useMemo(() => (gameState === 'result' && result ? HAND_TIERS[result.name] : 0), [gameState, result])
  const isWin = useMemo(() => gameState === 'result' && (result?.multiplier ?? 0) > 0, [gameState, result])
  const isLose = useMemo(() => gameState === 'result' && result?.multiplier === 0, [gameState, result])
  const shakeClass = useMemo(
    () => (isWin ? (tier >= 3 ? 'animate-shake-violent' : 'animate-shake-mid') : ''),
    [isWin, tier],
  )

  return {
    balance,
    bet,
    streak,
    hand,
    deck,
    dealIndex,
    gameState,
    result,
    tier,
    isWin,
    isLose,
    shakeClass,
    handleDeal,
    adjustBet,
    forceHand,
  }
}


