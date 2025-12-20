/**
 * Файл: src/application/game/usecases/applyCascadeStep.ts
 * Слой: application
 * Назначение: один шаг каскада (оценка руки → замена winningIndices → возвращаем следующий state).
 *
 * Важно:
 * - Это “чистая” логика, без UI/таймеров.
 * - Если multiplier === 0 — шаг невыигрышный, колода/индекс/рука не меняются.
 * - Если deck закончился — вызываем `refillDeck()` и продолжаем добор.
 */

import type { Card } from '../../../domain/cards/types'
import { getBestHand } from '../../../domain/hand-evaluator/getBestHand'
import type { HandResult } from '../../../domain/hand-evaluator/getBestHand'

export type ApplyCascadeStepInput = {
  hand: Card[]
  bet: number
  deck: Card[]
  dealIndex: number
}

export type ApplyCascadeStepDeps = {
  refillDeck: () => Card[]
}

export type ApplyCascadeStepOutput = {
  didWin: boolean
  evalResult: HandResult
  winAmount: number
  winningIndices: number[]
  handBefore: Card[]
  handAfter: Card[]
  deckAfter: Card[]
  dealIndexAfter: number
}

function assertHandLength5(hand: Card[]) {
  if (hand.length !== 5) {
    throw new Error(`applyCascadeStepUseCase ожидает руку из 5 карт, получено: ${hand.length}`)
  }
}

export function applyCascadeStepUseCase(input: ApplyCascadeStepInput, deps: ApplyCascadeStepDeps): ApplyCascadeStepOutput {
  const { hand, bet } = input
  assertHandLength5(hand)

  const evalResult = getBestHand(hand)
  const winningIndices = evalResult.winningIndices ?? []

  // Lose: ничего не меняем
  if (evalResult.multiplier <= 0) {
    return {
      didWin: false,
      evalResult,
      winAmount: 0,
      winningIndices,
      handBefore: hand.slice(),
      handAfter: hand.slice(),
      deckAfter: input.deck.slice(),
      dealIndexAfter: input.dealIndex,
    }
  }

  let deck = input.deck.slice()
  let dealIndex = input.dealIndex

  const draw = (): Card => {
    if (dealIndex >= deck.length) {
      deck = deps.refillDeck()
      dealIndex = 0
    }
    const card = deck[dealIndex]
    if (!card) throw new Error('refillDeck() вернул пустую колоду или dealIndex вышел за границы')
    dealIndex += 1
    return card
  }

  const handBefore = hand.slice()
  const handAfter = hand.slice()
  for (const idx of winningIndices) {
    handAfter[idx] = draw()
  }

  const winAmount = bet * evalResult.multiplier

  return {
    didWin: true,
    evalResult,
    winAmount,
    winningIndices,
    handBefore,
    handAfter: handAfter.slice(),
    deckAfter: deck.slice(),
    dealIndexAfter: dealIndex,
  }
}


