/**
 * Файл: src/ui/screens/balatro-inferno/useBalatroInfernoController.js
 * Слой: ui
 * Назначение: контроллер-хук экрана BalatroInferno: хранит состояние, запускает таймеры, вызывает use-cases.
 *
 * Инварианты:
 * - Поведение 1:1 со старым монолитом `src/BalatroInferno.jsx`.
 * - UI остаётся “тонким”: вся оркестрация состояния и таймеров живёт здесь.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HAND_TIERS } from '../../../domain/hand-evaluator/constants'
import { getBestHand } from '../../../domain/hand-evaluator/getBestHand'
import { createDeck } from '../../../domain/deck/createDeck'

import { adjustBetUseCase } from '../../../application/game/usecases/adjustBet'
import { startDealUseCase } from '../../../application/game/usecases/startDeal'
import { resolveResultUseCase } from '../../../application/game/usecases/resolveResult'
import { forceHandUseCase } from '../../../application/game/usecases/forceHand'
import { applyCascadeStepUseCase } from '../../../application/game/usecases/applyCascadeStep'

import { nativeRng } from '../../../infrastructure/rng/nativeRng'
import { browserClock } from '../../../infrastructure/clock/browserClock'

const GAME_MODE_STORAGE_KEY = 'repoker.gameMode'

function readStoredGameMode() {
  try {
    const v = window.localStorage.getItem(GAME_MODE_STORAGE_KEY)
    return v === 'cascade' ? 'cascade' : 'normal'
  } catch {
    return 'normal'
  }
}

function writeStoredGameMode(mode) {
  try {
    window.localStorage.setItem(GAME_MODE_STORAGE_KEY, mode)
  } catch {
    // ignore (private mode / blocked storage)
  }
}

/**
 * Контроллер состояния экрана.
 *
 * @returns {{
 *   balance: number,
 *   bet: number,
 *   streak: number,
 *   mode: 'normal'|'cascade',
 *   hand: any[],
 *   deck: any[],
 *   dealIndex: number,
 *   gameState: string,
 *   result: any,
 *   tier: number,
 *   isWin: boolean,
 *   isLose: boolean,
 *   shakeClass: string,
 *   cascadeHighlightIndices: number[],
 *   setMode: (mode: 'normal'|'cascade') => void,
 *   handleDeal: () => void,
 *   adjustBet: (amount: number) => void,
 *   forceHand: (jokerCount: number) => void,
 * }}
 */
export function useBalatroInfernoController() {
  const [balance, setBalance] = useState(100)
  const [bet, setBet] = useState(10)
  const [streak, setStreak] = useState(0)
  const [mode, setMode] = useState(() => readStoredGameMode())
  const [hand, setHand] = useState([])
  const [gameState, setGameState] = useState('idle')
  const [result, setResult] = useState(null)
  const [deck, setDeck] = useState(() => createDeck(nativeRng))
  const [dealIndex, setDealIndex] = useState(0)

  const [cascadeStepIndex, setCascadeStepIndex] = useState(0)
  const [cascadeRunningTotalWin, setCascadeRunningTotalWin] = useState(0)
  const [lastCascadeTotalWin, setLastCascadeTotalWin] = useState(0)
  const [lastCascadeStepsCount, setLastCascadeStepsCount] = useState(0)
  const [cascadeVanishingIndices, setCascadeVanishingIndices] = useState([])
  const [cascadeAppearingIndices, setCascadeAppearingIndices] = useState([])
  const [cascadeHighlightIndices, setCascadeHighlightIndices] = useState([])
  const [cascadeRefillFlash, setCascadeRefillFlash] = useState(false)
  const [showWinBanner, setShowWinBanner] = useState(false)
  const [winBannerAmount, setWinBannerAmount] = useState(0)
  const [debugEnabled, setDebugEnabled] = useState(false)
  const [debugSnapshot, setDebugSnapshot] = useState(null)
  const [debugLastWinSnapshot, setDebugLastWinSnapshot] = useState(null)

  // Защита от “гонок” таймеров каскада: любой callback из старого шага игнорируется.
  const cascadeAnimTokenRef = useRef(0)
  // Логическое состояние каскада держим в refs (чтобы mid-step обновления не перезапускали useEffect)
  const cascadeLogicalHandRef = useRef(null)
  const cascadeTotalWinRef = useRef(0)
  const cascadeLastWinResultRef = useRef(null)
  // refs для значений, которые меняются во время шага каскада (чтобы не перезапускать эффект)
  const betRef = useRef(bet)
  const deckRef = useRef(deck)
  const dealIndexRef = useRef(dealIndex)

  useEffect(() => {
    betRef.current = bet
  }, [bet])
  useEffect(() => {
    deckRef.current = deck
  }, [deck])
  useEffect(() => {
    dealIndexRef.current = dealIndex
  }, [dealIndex])

  useEffect(() => {
    writeStoredGameMode(mode)
  }, [mode])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key?.toLowerCase?.() === 'd') setDebugEnabled((v) => !v)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const clearCascadeActive = useCallback(() => {
    setCascadeStepIndex(0)
    setCascadeRunningTotalWin(0)
    setCascadeVanishingIndices([])
    setCascadeAppearingIndices([])
    setCascadeHighlightIndices([])
    setCascadeRefillFlash(false)
    setShowWinBanner(false)
    setWinBannerAmount(0)
    // Не очищаем debugSnapshot здесь: нужно видеть состояние на финальном экране `result`.

    cascadeLogicalHandRef.current = null
    cascadeTotalWinRef.current = 0
    cascadeLastWinResultRef.current = null
  }, [])

  const resetCascade = useCallback(() => {
    clearCascadeActive()
    setLastCascadeTotalWin(0)
    setLastCascadeStepsCount(0)
    setDebugSnapshot(null)
    setDebugLastWinSnapshot(null)
  }, [clearCascadeActive])

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
        if (mode === 'normal') {
          const evalResult = getBestHand(hand)
          const resolved = resolveResultUseCase({ balance, bet, streak, evalResult })
          setResult(resolved.result)
          setBalance(resolved.balance)
          setStreak(resolved.streak)
          setGameState(resolved.gameState)
          return
        }

        // CASCADE mode
        resetCascade()
        // на старте каскада убираем любые “хвосты” отображения результата
        setResult(null)
        setShowWinBanner(false)
        setCascadeHighlightIndices([])
        cascadeLogicalHandRef.current = hand
        cascadeTotalWinRef.current = 0
        cascadeLastWinResultRef.current = null
        setCascadeRunningTotalWin(0)
        setLastCascadeTotalWin(0)
        setLastCascadeStepsCount(0)

        // переводим в каскадный таймлайн
        setCascadeStepIndex(0)
        setGameState('cascading')
      }, 300)
      return () => browserClock.clearTimeout(timer)
    }
  }, [gameState, dealIndex, deck, hand, bet, balance, streak, mode, resetCascade])

  useEffect(() => {
    if (gameState !== 'cascading') return

    const token = ++cascadeAnimTokenRef.current
    const logicalHand = cascadeLogicalHandRef.current
    if (!logicalHand) return

    const timers = []
    const schedule = (fn, ms) => {
      const t = browserClock.setTimeout(() => {
        if (cascadeAnimTokenRef.current !== token) return
        fn()
      }, ms)
      timers.push(t)
      return t
    }

    // Один шаг каскада считается от “логической” руки, а не от UI-анимаций.
    const step = applyCascadeStepUseCase(
      { hand: logicalHand, bet: betRef.current, deck: deckRef.current, dealIndex: dealIndexRef.current },
      { refillDeck: () => createDeck(nativeRng) },
    )
    const computed = {
      token,
      stepIndex: cascadeStepIndex,
      logicalHand: logicalHand.slice(),
      evalResult: step.evalResult,
      winningIndices: step.winningIndices,
      didWin: step.didWin,
      winAmount: step.winAmount,
      dealIndexBefore: dealIndexRef.current,
      deckLenBefore: deckRef.current.length,
    }
    schedule(() => setDebugSnapshot(computed), 0)

    // Каскад завершён (нет выигрыша) — начисляем totalWin одним платежом и показываем итог.
    if (!step.didWin) {
      const totalWin = cascadeTotalWinRef.current
      const lastWinResult = cascadeLastWinResultRef.current

      const finishTimer = browserClock.setTimeout(() => {
        if (cascadeAnimTokenRef.current !== token) return
        if (totalWin > 0) {
          setBalance((prev) => prev + totalWin)
          setStreak((prev) => Math.min(prev + 1, 5))
        } else {
          setStreak(0)
        }

        setLastCascadeTotalWin(totalWin)
        setLastCascadeStepsCount(cascadeStepIndex)

        // ВАЖНО (UX): на финале каскада рука уже финальная (после добора) и может быть проигрышной.
        // Поэтому в `result` кладём фактический финальный eval (обычно High Card), а totalWin показываем отдельным баннером.
        schedule(
          () =>
            setDebugSnapshot({
              ...computed,
              phase: 'finish',
              totalWin,
              lastWinResultName: lastWinResult?.name ?? null,
            }),
          0,
        )

        setResult(step.evalResult)
        setGameState('result')
        clearCascadeActive()
      }, 0)

      return () => {
        browserClock.clearTimeout(finishTimer)
        timers.forEach((t) => browserClock.clearTimeout(t))
      }
    }

    const winningIdx = step.winningIndices ?? []

    // 1) Reveal (двухфазно): сначала обновляем руку, затем показываем баннер/подсветку.
    schedule(() => {
      setHand(step.handBefore)
      setCascadeVanishingIndices([])
      setCascadeAppearingIndices([])
    }, 0)

    schedule(() => {
      setResult(step.evalResult)
      setShowWinBanner(true)
      setWinBannerAmount(step.winAmount)
      setCascadeHighlightIndices(winningIdx)
    }, 60)

    // 2) Hide banner
    schedule(() => setShowWinBanner(false), 520)

    // 3) Start vanish animation on winning cards
    schedule(() => setCascadeVanishingIndices(winningIdx), 700)

    // 3.5) Снять затемнение со “всех остальных” перед заменой (до появления новых карт)
    schedule(() => {
      setResult(null)
      setCascadeHighlightIndices([])
    }, 760)

    // 4) Remove cards (empty slots)
    schedule(() => {
      const emptied = step.handBefore.map((c, idx) => (winningIdx.includes(idx) ? null : c))
      setHand(emptied)
      setCascadeVanishingIndices([])
    }, 960)

    // 5) Drop-in new cards (one-by-one)
    const appearStart = 1080
    const appearDelay = 120
    const appearHold = 260
    const sortedIdx = [...winningIdx].slice().sort((a, b) => a - b)
    for (let k = 0; k < sortedIdx.length; k += 1) {
      const idx = sortedIdx[k]
      schedule(() => {
        setHand((prev) => {
          const next = prev.slice()
          next[idx] = step.handAfter[idx]
          return next
        })
        setCascadeAppearingIndices((prev) => (prev.includes(idx) ? prev : [...prev, idx]))
      }, appearStart + k * appearDelay)

      schedule(() => {
        setCascadeAppearingIndices((prev) => prev.filter((x) => x !== idx))
      }, appearStart + k * appearDelay + appearHold)
    }

    // 6) Commit deck/dealIndex and running total (визуально после refill)
    schedule(() => {
      // важно: обновляем refs сразу, чтобы следующий шаг считался по актуальным данным
      deckRef.current = step.deckAfter
      dealIndexRef.current = step.dealIndexAfter
      cascadeTotalWinRef.current = cascadeTotalWinRef.current + step.winAmount
      cascadeLastWinResultRef.current = step.evalResult
      cascadeLogicalHandRef.current = step.handAfter

      setDebugLastWinSnapshot({
        token,
        stepIndex: cascadeStepIndex,
        eval: step.evalResult?.name ?? null,
        winIdx: step.winningIndices ?? [],
        winAmount: step.winAmount,
        totalWinAfter: cascadeTotalWinRef.current,
        handAfter: step.handAfter.map((c) => `${c?.rank ?? '?'}:${c?.suit ?? '?'}`),
      })

      setDeck(step.deckAfter)
      setDealIndex(step.dealIndexAfter)
      setCascadeRunningTotalWin(cascadeTotalWinRef.current)
    }, appearStart + sortedIdx.length * appearDelay + 40)

    // 6.5) Яркий “refill flash” (все карты без затемнения, но с заметным акцентом появления)
    schedule(() => setCascadeRefillFlash(true), appearStart + sortedIdx.length * appearDelay + 80)
    schedule(() => setCascadeRefillFlash(false), appearStart + sortedIdx.length * appearDelay + 260)

    // 7) Next step
    schedule(() => setCascadeStepIndex((prev) => prev + 1), appearStart + sortedIdx.length * appearDelay + 520)

    return () => timers.forEach((t) => browserClock.clearTimeout(t))
  }, [
    gameState,
    cascadeStepIndex,
    clearCascadeActive,
  ])

  const handleDeal = () => {
    const next = startDealUseCase({ balance, bet }, { rng: nativeRng })
    if (!next) return
    resetCascade()
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
    resetCascade()
    setBalance(next.balance)
    setHand(next.hand)
    setResult(next.result)
    setDeck(next.deck)
    setDealIndex(next.dealIndex)
    setGameState(next.gameState)
  }

  const showResult = gameState === 'result' || gameState === 'cascading'
  const tier = useMemo(() => (showResult && result ? HAND_TIERS[result.name] : 0), [showResult, result])
  const isWin = useMemo(() => showResult && (result?.multiplier ?? 0) > 0, [showResult, result])
  const isLose = useMemo(() => showResult && result?.multiplier === 0, [showResult, result])
  const shakeClass = useMemo(
    () => (isWin ? (tier >= 3 ? 'animate-shake-violent' : 'animate-shake-mid') : ''),
    [isWin, tier],
  )

  return {
    balance,
    bet,
    streak,
    mode,
    hand,
    deck,
    dealIndex,
    gameState,
    result,
    tier,
    isWin,
    isLose,
    shakeClass,
    cascadeStepIndex,
    cascadeStepsCount: 0,
    cascadeRunningTotalWin,
    cascadeFinalTotalWin: 0,
    lastCascadeTotalWin,
    lastCascadeStepsCount,
    cascadeVanishingIndices,
    cascadeAppearingIndices,
    cascadeHighlightIndices,
    cascadeRefillFlash,
    showWinBanner,
    winBannerAmount,
    debugEnabled,
    debugSnapshot,
    debugLastWinSnapshot,
    setMode,
    handleDeal,
    adjustBet,
    forceHand,
  }
}


