/**
 * Файл: src/application/game/usecases/applyCascadeStep.ts
 * Слой: application
 * Назначение: один шаг каскада (оценка руки → замена winningIndices → возвращаем следующий state).
 *
 * Важно:
 * - Это “чистая” логика, без UI/таймеров.
 * - Если multiplier === 0 — шаг невыигрышный, колода/индекс/рука не меняются.
 * - Если deck закончился — **НЕ пополняем**: недостающие карты становятся `null`,
 *   а вызывающая сторона должна завершить каскад после этого шага.
 */

import type { Card } from '../../../domain/cards/types'
import { getBestHand } from '../../../domain/hand-evaluator/getBestHand'
import type { HandResult } from '../../../domain/hand-evaluator/getBestHand'
import { getCascadeMultiplierForWinStep } from '../cascadeMultiplier'

export type TableCard = Card | null

export type ApplyCascadeStepInput = {
  hand: Card[]
  bet: number
  deck: Card[]
  dealIndex: number
  /**
   * Номер выигрышного шага каскада (1..N).
   * Важно: счётчик увеличивается только после win-шагов.
   */
  winStepNumber: number
}

export type ApplyCascadeStepOutput = {
  didWin: boolean
  evalResult: HandResult
  cascadeMultiplier: number
  baseWinAmount: number
  winAmount: number
  didDeckShortage: boolean
  didJackpot: boolean
  jackpotAmount: number
  winningIndices: number[]
  handBefore: Card[]
  handAfter: TableCard[]
  deckAfter: Card[]
  dealIndexAfter: number
}

function assertHandLength5(hand: Card[]) {
  if (hand.length !== 5) {
    throw new Error(`applyCascadeStepUseCase ожидает руку из 5 карт, получено: ${hand.length}`)
  }
}

const JACKPOT_MULTIPLIER = 150_000

export function applyCascadeStepUseCase(input: ApplyCascadeStepInput): ApplyCascadeStepOutput {
  const { hand, bet } = input
  assertHandLength5(hand)

  const cleanMoney = (n: number) => Math.round(n * 1e10) / 1e10

  const evalResult = getBestHand(hand)
  const winningIndices = evalResult.winningIndices ?? []

  // Lose: ничего не меняем
  if (evalResult.multiplier <= 0) {
    return {
      didWin: false,
      evalResult,
      cascadeMultiplier: 1,
      baseWinAmount: 0,
      winAmount: 0,
      didDeckShortage: false,
      didJackpot: false,
      jackpotAmount: 0,
      winningIndices,
      handBefore: hand.slice(),
      handAfter: hand.slice(),
      deckAfter: input.deck.slice(),
      dealIndexAfter: input.dealIndex,
    }
  }

  const cascadeMultiplier = getCascadeMultiplierForWinStep(input.winStepNumber)

  let deck = input.deck.slice()
  let dealIndex = input.dealIndex
  let didDeckShortage = false

  const draw = (): Card | null => {
    if (dealIndex >= deck.length) {
      didDeckShortage = true
      return null
    }
    const card = deck[dealIndex]
    if (!card) {
      didDeckShortage = true
      return null
    }
    dealIndex += 1
    return card
  }

  const handBefore = hand.slice()
  const handAfter: TableCard[] = hand.slice()
  for (const idx of winningIndices) {
    handAfter[idx] = draw()
  }

  const baseWinAmount = cleanMoney(bet * evalResult.multiplier)
  const winAmount = cleanMoney(baseWinAmount * cascadeMultiplier)
  const didJackpot = didDeckShortage && handAfter.every((c) => c === null) && dealIndex >= deck.length
  const jackpotAmount = didJackpot ? cleanMoney(bet * JACKPOT_MULTIPLIER) : 0

  return {
    didWin: true,
    evalResult,
    cascadeMultiplier,
    baseWinAmount,
    winAmount,
    didDeckShortage,
    didJackpot,
    jackpotAmount,
    winningIndices,
    handBefore,
    handAfter: handAfter.slice(),
    deckAfter: deck.slice(),
    dealIndexAfter: dealIndex,
  }
}


