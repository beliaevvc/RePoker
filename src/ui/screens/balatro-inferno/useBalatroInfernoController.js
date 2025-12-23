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
import { RANK_NAMES } from '../../../domain/cards/constants'

import { adjustBetUseCase } from '../../../application/game/usecases/adjustBet'
import { startDealUseCase } from '../../../application/game/usecases/startDeal'
import { resolveResultUseCase } from '../../../application/game/usecases/resolveResult'
import { applyCascadeStepUseCase } from '../../../application/game/usecases/applyCascadeStep'
import { buildJackpotSimulationScenario } from '../../../application/game/debug/jackpotSimulation'
import { DEFAULT_ANTE } from '../../../application/game/constants/ante'

import { nativeRng } from '../../../infrastructure/rng/nativeRng'
import { browserClock } from '../../../infrastructure/clock/browserClock'

const GAME_MODE_STORAGE_KEY = 'repoker.gameMode'
const DEVTOOLS_STORAGE_KEY = 'repoker.devTools'

/**
 * Feature flags (UI/режимы)
 *
 * Сейчас мы временно “отключаем” normal-режим: UI выбора режима убираем,
 * а по умолчанию всегда работаем в CASCADE.
 *
 * Чтобы вернуть normal (и/или переключалку) — достаточно выставить `true`.
 */
const NORMAL_MODE_ENABLED = false

function readDevToolsFlagFromStorage() {
  try {
    const v = window.localStorage.getItem(DEVTOOLS_STORAGE_KEY)
    return v === '1' || v === 'true' || v === 'on'
  } catch {
    return false
  }
}

function readDevToolsFlagFromQuery() {
  try {
    const params = new URLSearchParams(window.location.search)
    return params.get('dev') === '1' || params.get('devtools') === '1'
  } catch {
    return false
  }
}

function isDevToolsAllowed() {
  // dev build always allowed; prod allowed only when explicitly enabled
  const explicit = readDevToolsFlagFromStorage() || readDevToolsFlagFromQuery()
  return Boolean(import.meta?.env?.DEV) || explicit
}

function isDevToolsExplicitlyEnabled() {
  return readDevToolsFlagFromStorage() || readDevToolsFlagFromQuery()
}

function cardRankLabelForLog(card) {
  if (!card) return '?'
  // Joker: показываем как J* (чтобы не путать с J=валет)
  if (card.suit === 'joker' || card.rank === 15) return 'J*'
  return RANK_NAMES[card.rank] ?? String(card.rank)
}

function formatComboSignature(evalResult, hand) {
  if (!evalResult || !Array.isArray(hand) || hand.length !== 5) return null
  const name = evalResult.name ?? ''
  const idxs = Array.isArray(evalResult.winningIndices) ? evalResult.winningIndices : []
  if (idxs.length === 0) return null

  const cards = idxs.map((i) => hand[i]).filter(Boolean)
  if (cards.length === 0) return null

  const nonJokers = cards.filter((c) => c && c.suit !== 'joker' && c.rank !== 15)
  const jokerCount = cards.length - nonJokers.length

  // Для “групповых” комбинаций (pair/two pair/…/full house) хотим порядок: группы по частоте, потом по рангу.
  const groupy = new Set(['Pair', 'Two Pair', 'Three of a Kind', 'Four of a Kind', 'Full House'])
  const isGroupy = groupy.has(name)

  if (isGroupy) {
    const counts = new Map()
    for (const c of nonJokers) counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1)
    const groups = [...counts.entries()].sort((a, b) => (b[1] - a[1]) || (b[0] - a[0]))
    const parts = []
    for (const [rank, count] of groups) {
      const label = RANK_NAMES[rank] ?? String(rank)
      for (let i = 0; i < count; i += 1) parts.push(label)
    }
    for (let i = 0; i < jokerCount; i += 1) parts.push('J*')
    return parts.join('')
  }

  // Для “линейных” (стрит/флэш) — по убыванию ранга, джокеры в конце.
  const sorted = [...nonJokers].sort((a, b) => b.rank - a.rank)
  const parts = sorted.map(cardRankLabelForLog)
  for (let i = 0; i < jokerCount; i += 1) parts.push('J*')
  return parts.join('')
}

function readStoredGameMode() {
  try {
    const v = window.localStorage.getItem(GAME_MODE_STORAGE_KEY)
    if (!NORMAL_MODE_ENABLED) return 'cascade'
    return v === 'cascade' ? 'cascade' : 'normal'
  } catch {
    return NORMAL_MODE_ENABLED ? 'normal' : 'cascade'
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
 *   cascadeWinStepNumber: number,
 *   cascadeMultiplier: number,
 *   turboEnabled: boolean,
 *   setMode: (mode: 'normal'|'cascade') => void,
 *   toggleTurbo: () => void,
 *   handleDeal: () => void,
 *   adjustBet: (amount: number) => void,
 *   forceHand: (jokerCount: number) => void,
 * }}
 */
export function useBalatroInfernoController() {
  const [balance, setBalance] = useState(100)
  const [bet, setBet] = useState(DEFAULT_ANTE)
  const [streak, setStreak] = useState(0)
  const [mode, _setMode] = useState(() => readStoredGameMode())
  const [turboEnabled, setTurboEnabled] = useState(false)
  const [hand, setHand] = useState([])
  const [gameState, setGameState] = useState('idle')
  const [result, setResult] = useState(null)
  const [deck, setDeck] = useState(() => createDeck(nativeRng))
  const [dealIndex, setDealIndex] = useState(0)

  // AutoPlay (AUTO)
  const [autoModalOpen, setAutoModalOpen] = useState(false)
  const [autoSelectedCount, setAutoSelectedCount] = useState(25)
  const [autoRunning, setAutoRunning] = useState(false)
  const [autoRemaining, setAutoRemaining] = useState(0)
  const [autoSpinInProgress, setAutoSpinInProgress] = useState(false)
  const [autoLastStopReason, setAutoLastStopReason] = useState(null)

  const [cascadeStepIndex, setCascadeStepIndex] = useState(0)
  const [cascadeRunningTotalWin, setCascadeRunningTotalWin] = useState(0)
  const [cascadeWinStepNumber, setCascadeWinStepNumber] = useState(0)
  const [cascadeMultiplier, setCascadeMultiplier] = useState(1)
  const [lastCascadeTotalWin, setLastCascadeTotalWin] = useState(0)
  const [lastCascadeStepsCount, setLastCascadeStepsCount] = useState(0)
  const [lastWasJackpot, setLastWasJackpot] = useState(false)
  const [lastJackpotAmount, setLastJackpotAmount] = useState(0)
  const [cascadeWinHistory, setCascadeWinHistory] = useState([])
  const [lastCascadeWinHistory, setLastCascadeWinHistory] = useState([])
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [paytableModalOpen, setPaytableModalOpen] = useState(false)
  const cascadeWinHistoryRef = useRef([]) // актуальная история для таймеров (чтобы не перезапускать эффекты)
  const [cascadeVanishingIndices, setCascadeVanishingIndices] = useState([])
  const [cascadeAppearingIndices, setCascadeAppearingIndices] = useState([])
  const [cascadeHighlightIndices, setCascadeHighlightIndices] = useState([])
  const [cascadeRefillFlash, setCascadeRefillFlash] = useState(false)
  const [showWinBanner, setShowWinBanner] = useState(false)
  const [winBannerAmount, setWinBannerAmount] = useState(0)
  const [debugEnabled, setDebugEnabled] = useState(false)
  const [debugSnapshot, setDebugSnapshot] = useState(null)
  const [debugLastWinSnapshot, setDebugLastWinSnapshot] = useState(null)

  // Dev Tools
  const devToolsAllowed = useMemo(() => isDevToolsAllowed(), [])
  const devToolsExplicit = useMemo(() => isDevToolsExplicitlyEnabled(), [])
  const [devToolsOpen, setDevToolsOpen] = useState(false)
  const DEV_LOG_CAP = 400
  const [devLogPaused, setDevLogPaused] = useState(false)
  const [devLogEntries, setDevLogEntries] = useState([])
  const devLogPausedRef = useRef(devLogPaused)
  useEffect(() => {
    devLogPausedRef.current = devLogPaused
  }, [devLogPaused])

  const pushDevLog = useCallback(
    (type, payload = null) => {
      if (!devToolsAllowed) return
      if (devLogPausedRef.current) return
      const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ts: Date.now(),
        type,
        payload,
      }
      setDevLogEntries((prev) => {
        const next = [...prev, entry]
        return next.length > DEV_LOG_CAP ? next.slice(next.length - DEV_LOG_CAP) : next
      })
    },
    [devToolsAllowed],
  )

  const clearDevLog = useCallback(() => setDevLogEntries([]), [])
  const toggleDevLogPaused = useCallback(() => setDevLogPaused((v) => !v), [])
  const enableDevToolsExplicit = useCallback(() => {
    try {
      window.localStorage.setItem(DEVTOOLS_STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    // Для простоты: после включения перезагружаем страницу, чтобы gating стал активен везде (включая hotkeys).
    window.location.reload()
  }, [])

  // Защита от “гонок” таймеров каскада: любой callback из старого шага игнорируется.
  const cascadeAnimTokenRef = useRef(0)
  // Логическое состояние каскада держим в refs (чтобы mid-step обновления не перезапускали useEffect)
  const cascadeLogicalHandRef = useRef(null)
  const cascadeTotalWinRef = useRef(0)
  const cascadeLastWinResultRef = useRef(null)
  const cascadeDidJackpotRef = useRef(false)
  const cascadeJackpotAmountRef = useRef(0)
  // refs для значений, которые меняются во время шага каскада (чтобы не перезапускать эффект)
  const betRef = useRef(bet)
  const balanceRef = useRef(balance)
  const deckRef = useRef(deck)
  const dealIndexRef = useRef(dealIndex)

  useEffect(() => {
    betRef.current = bet
  }, [bet])
  useEffect(() => {
    balanceRef.current = balance
  }, [balance])
  useEffect(() => {
    deckRef.current = deck
  }, [deck])
  useEffect(() => {
    dealIndexRef.current = dealIndex
  }, [dealIndex])

  useEffect(() => {
    writeStoredGameMode(mode)
  }, [mode])

  const toggleTurbo = useCallback(() => {
    setTurboEnabled((v) => {
      const next = !v
      pushDevLog('TURBO_TOGGLE', { enabled: next })
      return next
    })
  }, [pushDevLog])

  const cleanMoney = useCallback((n) => Math.round(Number(n ?? 0) * 1e10) / 1e10, [])

  const setMode = useCallback(
    (nextMode) => {
      _setMode((prev) => {
        if (prev !== nextMode) pushDevLog('MODE_CHANGE', { from: prev, to: nextMode })
        return nextMode
      })
    },
    [pushDevLog],
  )

  const addMoney = useCallback(
    (amount) => {
      if (!devToolsAllowed) return
      const amt = Number(amount)
      if (!Number.isFinite(amt) || amt <= 0) return

      // Делаем инкремент “синхронно” через ref, чтобы быстрые клики не терялись при batching.
      const before = Number(balanceRef.current ?? 0)
      const after = cleanMoney(before + amt)
      balanceRef.current = after

      setBalance(after)
      pushDevLog('BALANCE_ADD', { amount: amt, balanceBefore: before, balanceAfter: after })
    },
    [devToolsAllowed, cleanMoney, pushDevLog],
  )

  const toggleDebugOverlay = useCallback((via = 'toggle') => {
    setDebugEnabled((v) => {
      const next = !v
      pushDevLog('DEBUG_TOGGLE', { enabled: next, via })
      return next
    })
  }, [pushDevLog])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!devToolsAllowed) return
      if (e.key?.toLowerCase?.() === 'd') {
        toggleDebugOverlay('hotkey(D)')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [devToolsAllowed, toggleDebugOverlay])

  const clearCascadeActive = useCallback(() => {
    setCascadeStepIndex(0)
    setCascadeWinStepNumber(0)
    setCascadeMultiplier(1)
    setCascadeVanishingIndices([])
    setCascadeAppearingIndices([])
    setCascadeHighlightIndices([])
    setCascadeRefillFlash(false)
    setShowWinBanner(false)
    setWinBannerAmount(0)
    // Очищаем debugSnapshot здесь: нужно видеть состояние на финальном экране `result`.
    // Но cascadeWinHistory очищаем (перенесли в lastCascadeWinHistory)
    setCascadeWinHistory([])
    cascadeWinHistoryRef.current = []

    cascadeLogicalHandRef.current = null
    cascadeTotalWinRef.current = 0
    cascadeLastWinResultRef.current = null
    cascadeDidJackpotRef.current = false
    cascadeJackpotAmountRef.current = 0
  }, [])

  const resetCascade = useCallback(() => {
    clearCascadeActive()
    // UX: перед новой раздачей/новым каскадом всегда скрываем накопительный WIN
    setCascadeRunningTotalWin(0)
    setLastCascadeTotalWin(0)
    setLastCascadeStepsCount(0)
    setLastWasJackpot(false)
    setLastJackpotAmount(0)
    setCascadeWinHistory([])
    setLastCascadeWinHistory([])
    cascadeWinHistoryRef.current = []
    setDebugSnapshot(null)
    setDebugLastWinSnapshot(null)
  }, [clearCascadeActive])

  const deckRemaining = useMemo(() => Math.max(0, (deck?.length ?? 0) - (dealIndex ?? 0)), [deck, dealIndex])

  const isBusy = useMemo(
    () => gameState === 'dealing' || gameState === 'suspense' || gameState === 'cascading',
    [gameState],
  )
  const isReadyForNextDeal = useMemo(() => gameState === 'idle' || gameState === 'result', [gameState])

  const stopAuto = useCallback(
    (reason = null) => {
      setAutoRunning(false)
      setAutoSpinInProgress(false)
      setAutoRemaining(0)
      setAutoLastStopReason(reason)
      pushDevLog('AUTO_STOP', { reason })
    },
    [pushDevLog],
  )

  const selectAutoPreset = useCallback((preset) => {
    const n = Number(preset)
    if (!Number.isFinite(n) || n <= 0) return
    setAutoSelectedCount(n)
  }, [])

  const startAuto = useCallback(() => {
    // По спецификации: если busy или не хватает денег — авто не стартует (и считается остановленным).
    if (isBusy) return stopAuto('busy')
    if (balance < bet) return stopAuto('no-money')

    setAutoLastStopReason(null)
    setAutoRunning(true)
    setAutoSpinInProgress(false)
    setAutoRemaining(autoSelectedCount)
    pushDevLog('AUTO_START', {
      count: autoSelectedCount,
      bet,
      balanceBefore: balance,
    })
  }, [isBusy, balance, bet, autoSelectedCount, stopAuto, pushDevLog])

  const startDealNow = useCallback(
    (via = 'manual') => {
      const next = startDealUseCase({ balance, bet }, { rng: nativeRng })
      if (!next) return false
      pushDevLog('DEAL_START', { via, mode, bet, balanceBefore: balance })
      resetCascade()
      setBalance(next.balance)
      setHand(next.hand)
      setResult(next.result)
      setDealIndex(next.dealIndex)
      setDeck(next.deck)
      setGameState(next.gameState)
      pushDevLog('DEAL_STARTED', {
        via,
        gameState: next.gameState,
        dealIndex: next.dealIndex,
        deckLen: next.deck?.length ?? null,
      })
      return true
    },
    [balance, bet, mode, resetCascade, pushDevLog],
  )

  // AutoPlay: оркестрация “следующий спин после завершения предыдущего”.
  /* eslint-disable react-hooks/set-state-in-effect -- AutoPlay orchestrator is intentionally effect-driven. */
  useEffect(() => {
    if (!autoRunning) return

    // Finite: закончились спины
    if (autoRemaining <= 0) {
      stopAuto('done')
      return
    }

    // Ждём “готового” состояния
    if (!isReadyForNextDeal) return

    // На готовом экране проверяем деньги — иначе стоп (по требованию)
    if (balance < bet) {
      stopAuto('no-money')
      return
    }

    // Если предыдущий спин был запущен авто — на готовом экране коммитим “минус 1”.
    if (autoSpinInProgress) {
      setAutoRemaining((prev) => Math.max(0, prev - 1))
      setAutoSpinInProgress(false)
      return
    }

    // Стартуем следующий спин
    const ok = startDealNow('auto')
    if (!ok) {
      stopAuto('cannot-start')
      return
    }
    setAutoSpinInProgress(true)
  }, [
    autoRunning,
    autoRemaining,
    autoSpinInProgress,
    isReadyForNextDeal,
    balance,
    bet,
    startDealNow,
    stopAuto,
  ])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (gameState === 'dealing') {
      if (dealIndex < 5) {
        const timer = browserClock.setTimeout(() => {
          setHand((prev) => [...prev, deck[dealIndex]])
          setDealIndex((prev) => prev + 1)
        }, turboEnabled ? 20 : 40)
        return () => browserClock.clearTimeout(timer)
      }
      const timer = browserClock.setTimeout(() => setGameState('suspense'), 0)
      return () => browserClock.clearTimeout(timer)
    }

    if (gameState === 'suspense') {
      const timer = browserClock.setTimeout(() => {
        if (mode === 'normal') {
          const evalResult = getBestHand(hand)
          const combo = formatComboSignature(evalResult, hand)
          const resolved = resolveResultUseCase({ balance, bet, streak, evalResult })
          setResult(resolved.result)
          setBalance(resolved.balance)
          setStreak(resolved.streak)
          setGameState(resolved.gameState)
          pushDevLog('RESULT_RESOLVED', {
            mode: 'normal',
            name: resolved.result?.name ?? null,
            combo,
            multiplier: resolved.result?.multiplier ?? null,
            winAmount: (resolved.result?.multiplier ?? 0) * bet,
            balanceAfter: resolved.balance,
            streakAfter: resolved.streak,
          })
          return
        }

        // CASCADE mode
        pushDevLog('CASCADE_START', { bet, balanceBefore: balance })
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
      }, turboEnabled ? 150 : 300)
      return () => browserClock.clearTimeout(timer)
    }
  }, [gameState, dealIndex, deck, hand, bet, balance, streak, mode, resetCascade, turboEnabled, pushDevLog])

  useEffect(() => {
    if (gameState !== 'cascading') return

    // Добавляем cascadeWinHistory в зависимости, чтобы замыкание имело актуальное значение при завершении каскада
    const token = ++cascadeAnimTokenRef.current
    const logicalHand = cascadeLogicalHandRef.current
    if (!logicalHand) return

    const timers = []
    const timeFactor = turboEnabled ? 0.5 : 1
    const scaleMs = (ms) => (ms <= 0 ? 0 : Math.max(0, Math.round(ms * timeFactor)))
    const schedule = (fn, ms) => {
      const t = browserClock.setTimeout(() => {
        if (cascadeAnimTokenRef.current !== token) return
        fn()
      }, scaleMs(ms))
      timers.push(t)
      return t
    }

    // Один шаг каскада считается от “логической” руки, а не от UI-анимаций.
    const winStepNumber = cascadeStepIndex + 1
    const step = applyCascadeStepUseCase({
      hand: logicalHand,
      bet: betRef.current,
      deck: deckRef.current,
      dealIndex: dealIndexRef.current,
      winStepNumber,
    })
    const jackpotAmount = step.jackpotAmount ?? 0
    const stepTotalGain = step.winAmount + jackpotAmount

    // Логический totalWin увеличиваем сразу при вычислении выигрышного шага (а не после refill-анимаций),
    // чтобы UI мог показать “накопительный WIN” уже во время баннера шага.
    if (step.didWin) {
      const newEntry = {
        stepIndex: cascadeStepIndex,
        winStepNumber,
        comboName: step.evalResult?.name ?? '',
        comboSignature: formatComboSignature(step.evalResult, logicalHand),
        winningIndices: step.winningIndices ?? [],
        hand: logicalHand.slice(),
        baseWinAmount: step.baseWinAmount,
        cascadeMultiplier: step.cascadeMultiplier,
        winAmount: step.winAmount,
        jackpotAmount,
      }
      setCascadeWinHistory((prev) => [...prev, newEntry])
      cascadeWinHistoryRef.current = [...cascadeWinHistoryRef.current, newEntry]

      cascadeTotalWinRef.current = cascadeTotalWinRef.current + stepTotalGain
      if (jackpotAmount > 0) {
        cascadeDidJackpotRef.current = true
        cascadeJackpotAmountRef.current = cascadeJackpotAmountRef.current + jackpotAmount
      }
      cascadeLastWinResultRef.current = step.evalResult
    }

    const stepLogPayload = {
      stepIndex: cascadeStepIndex,
      winStepNumber,
      name: step.evalResult?.name ?? null,
      combo: formatComboSignature(step.evalResult, logicalHand),
      didWin: step.didWin,
      winAmount: step.winAmount,
      baseWinAmount: step.baseWinAmount,
      cascadeMultiplier: step.cascadeMultiplier,
      didDeckShortage: step.didDeckShortage,
      didJackpot: step.didJackpot,
      jackpotAmount,
      deckLenBefore: deckRef.current.length,
      dealIndexBefore: dealIndexRef.current,
    }
    const computed = {
      token,
      stepIndex: cascadeStepIndex,
      winStepNumber,
      logicalHand: logicalHand.slice(),
      evalResult: step.evalResult,
      winningIndices: step.winningIndices,
      didWin: step.didWin,
      winAmount: step.winAmount,
      baseWinAmount: step.baseWinAmount,
      cascadeMultiplier: step.cascadeMultiplier,
      didDeckShortage: step.didDeckShortage,
      didJackpot: step.didJackpot,
      jackpotAmount,
      dealIndexBefore: dealIndexRef.current,
      deckLenBefore: deckRef.current.length,
    }
    schedule(() => setDebugSnapshot(computed), 0)
    schedule(() => pushDevLog('CASCADE_STEP', stepLogPayload), 0)

    // Каскад завершён (нет выигрыша) — начисляем totalWin одним платежом и показываем итог.
    if (!step.didWin) {
      const totalWin = cascadeTotalWinRef.current
      const lastWinResult = cascadeLastWinResultRef.current
      const wasJackpot = cascadeDidJackpotRef.current
      const jackpotAmount = cascadeJackpotAmountRef.current

      const finishTimer = browserClock.setTimeout(() => {
        if (cascadeAnimTokenRef.current !== token) return
        if (totalWin > 0) setBalance((prev) => prev + totalWin)

        setLastCascadeTotalWin(totalWin)
        setLastCascadeStepsCount(cascadeStepIndex)
        setLastWasJackpot(wasJackpot)
        setLastJackpotAmount(jackpotAmount)
        // ВАЖНО: фиксируем историю для финального экрана.
        // Берем актуальную историю из ref (так как внутри таймера стейт может быть из замыкания)
        setLastCascadeWinHistory(cascadeWinHistoryRef.current)

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
        pushDevLog('CASCADE_FINISH', {
          reason: 'no-win',
          totalWin,
          lastWinResultName: lastWinResult?.name ?? null,
          wasJackpot,
          jackpotAmount,
        })
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
      setCascadeWinStepNumber(winStepNumber)
      setCascadeMultiplier(step.cascadeMultiplier)
      setCascadeHighlightIndices(winningIdx)
      // UX: обновляем накопительный WIN в момент показа win-баннера шага (анимацию делает UI-компонент).
      // Требование: показывать только после первого win → значение остаётся 0 до первого выигрыша.
      setCascadeRunningTotalWin(cascadeTotalWinRef.current)
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
      cascadeLogicalHandRef.current = step.handAfter

      setDebugLastWinSnapshot({
        token,
        stepIndex: cascadeStepIndex,
        eval: step.evalResult?.name ?? null,
        winIdx: step.winningIndices ?? [],
        winAmount: step.winAmount,
        jackpotAmount,
        totalWinAfter: cascadeTotalWinRef.current,
        handAfter: step.handAfter.map((c) => `${c?.rank ?? '?'}:${c?.suit ?? '?'}`),
      })

      setDeck(step.deckAfter)
      setDealIndex(step.dealIndexAfter)
    }, appearStart + sortedIdx.length * appearDelay + 40)

    // 6.5) Яркий “refill flash” (все карты без затемнения, но с заметным акцентом появления)
    schedule(() => setCascadeRefillFlash(true), appearStart + sortedIdx.length * appearDelay + 80)
    schedule(() => setCascadeRefillFlash(false), appearStart + sortedIdx.length * appearDelay + 260)

    // 7) Next step (или завершение каскада при нехватке карт в колоде)
    if (step.didDeckShortage) {
      schedule(() => {
        const totalWin = cascadeTotalWinRef.current
        const lastWinResult = cascadeLastWinResultRef.current
        const wasJackpot = cascadeDidJackpotRef.current
        const jackpotAmount = cascadeJackpotAmountRef.current

        if (totalWin > 0) setBalance((prev) => prev + totalWin)

        setLastCascadeTotalWin(totalWin)
        setLastCascadeStepsCount(cascadeStepIndex + 1)
        setLastWasJackpot(wasJackpot)
        setLastJackpotAmount(jackpotAmount)
        setLastCascadeWinHistory(cascadeWinHistoryRef.current)

        setDebugSnapshot({
          ...computed,
          phase: 'finish(deck-shortage)',
          totalWin,
          lastWinResultName: lastWinResult?.name ?? null,
        })

        setResult(step.evalResult)
        setGameState('result')
        clearCascadeActive()
        pushDevLog('CASCADE_FINISH', {
          reason: 'deck-shortage',
          totalWin,
          lastWinResultName: lastWinResult?.name ?? null,
          wasJackpot,
          jackpotAmount,
        })
      }, appearStart + sortedIdx.length * appearDelay + 520)
    } else {
      schedule(() => setCascadeStepIndex((prev) => prev + 1), appearStart + sortedIdx.length * appearDelay + 520)
    }

    return () => timers.forEach((t) => browserClock.clearTimeout(t))
  }, [
    gameState,
    cascadeStepIndex,
    clearCascadeActive,
    turboEnabled,
    pushDevLog,
    // cascadeWinHistory - УБРАНО из зависимостей, т.к. обновление стейта внутри эффекта перезапускает эффект
    // и ломает таймеры (сбрасывается token). Для доступа к актуальной истории в таймерах используем ref.
  ])

  const handleDeal = () => {
    startDealNow('manual')
  }

  const runJackpotSimulation = () => {
    if (mode !== 'cascade') return
    if (gameState !== 'idle' && gameState !== 'result') return
    if (balance < bet) return

    pushDevLog('JACKPOT_SIM_START', { bet, balanceBefore: balance })
    resetCascade()
    setResult(null)
    setShowWinBanner(false)
    setCascadeHighlightIndices([])

    // “как PLAY”: списываем ставку
    setBalance((prev) => prev - bet)

    const scenarioIdx = Math.floor(nativeRng.randomFloat() * 5)
    const scenario = buildJackpotSimulationScenario(scenarioIdx)
    pushDevLog('JACKPOT_SIM_SCENARIO', { scenarioIdx })

    // Пропускаем стадию dealing (мгновенно “раздали” 5 карт) и идём в suspense → cascading.
    setDeck(scenario.deck)
    setDealIndex(scenario.dealIndex)
    setHand(scenario.hand)
    setGameState('suspense')
  }

  const dismissJackpotCinematic = () => {
    // “Клик в любом месте” во время MAX WIN синематики возвращает на главный экран
    if (gameState !== 'result') return
    if (!lastWasJackpot) return

    // очищаем финальные баннеры/флаги, возвращаемся в idle
    setLastWasJackpot(false)
    setLastJackpotAmount(0)
    setLastCascadeTotalWin(0)
    setLastCascadeStepsCount(0)
    setCascadeRunningTotalWin(0)
    setShowWinBanner(false)
    setWinBannerAmount(0)
    setCascadeWinHistory(() => []) // явный сброс
    cascadeWinHistoryRef.current = []
    setResult(null)
    setHand([])
    setGameState('idle')
  }

  const adjustBet = (amount) => {
    const newBet = adjustBetUseCase({ bet, balance, delta: amount, gameState })
    if (newBet !== bet) pushDevLog('BET_CHANGE', { from: bet, to: newBet, delta: amount })
    setBet(newBet)
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
    turboEnabled,
    hand,
    deck,
    deckRemaining,
    dealIndex,
    gameState,
    isBusy,
    result,
    tier,
    isWin,
    isLose,
    shakeClass,
    cascadeStepIndex,
    cascadeStepsCount: 0,
    cascadeRunningTotalWin,
    cascadeWinStepNumber,
    cascadeMultiplier,
    cascadeFinalTotalWin: 0,
    lastCascadeTotalWin,
    lastCascadeStepsCount,
    lastWasJackpot,
    lastJackpotAmount,
    cascadeVanishingIndices,
    cascadeAppearingIndices,
    cascadeHighlightIndices,
    cascadeRefillFlash,
    showWinBanner,
    winBannerAmount,
    debugEnabled,
    debugSnapshot,
    debugLastWinSnapshot,
    devLogEntries,
    devLogPaused,
    clearDevLog,
    toggleDevLogPaused,
    toggleDebugOverlay,
    devToolsAllowed,
    devToolsExplicit,
    devToolsOpen,
    addMoney,
    setMode,
    toggleTurbo,
    handleDeal,
    adjustBet,
    runJackpotSimulation,
    dismissJackpotCinematic,
    setDevToolsOpen,
    enableDevToolsExplicit,

    // AutoPlay (AUTO)
    autoModalOpen,
    setAutoModalOpen,
    autoSelectedCount,
    selectAutoPreset,
    autoRunning,
    autoRemaining,
    autoLastStopReason,
    startAuto,
    stopAuto,

    // Cascade History
    cascadeWinHistory,
    lastCascadeWinHistory,
    historyModalOpen,
    setHistoryModalOpen,
    paytableModalOpen,
    setPaytableModalOpen,
  }
}


