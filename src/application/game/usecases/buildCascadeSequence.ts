/**
 * Файл: src/application/game/usecases/buildCascadeSequence.ts
 * Слой: application
 * Назначение: “чистая” логика каскада — строит последовательность win-шагов.
 *
 * Правила (по текущему ТЗ):
 * - На каждом шаге берём лучшую комбинацию `getBestHand`.
 * - Если multiplier === 0 — каскад заканчивается.
 * - Исчезают ТОЛЬКО карты из winningIndices; остальные остаются.
 * - На исчезнувшие позиции добираем карты из deck (dealIndex двигается).
 * - Если deck закончился — вызываем `refillDeck()` и продолжаем.
 * - Выигрыш totalWin = сумма bet * multiplier по всем win-шагам (без множителей каскада).
 */

import type { Card } from '../../../domain/cards/types'
import { getBestHand } from '../../../domain/hand-evaluator/getBestHand'
import type { HandResult } from '../../../domain/hand-evaluator/getBestHand'

export type CascadeStep = {
  handBefore: Card[]
  evalResult: HandResult
  winAmount: number
  handAfter: Card[]
  deckAfter: Card[]
  dealIndexAfter: number
}

export type BuildCascadeSequenceInput = {
  hand: Card[]
  bet: number
  deck: Card[]
  dealIndex: number
  maxSteps?: number
}

export type BuildCascadeSequenceDeps = {
  refillDeck: () => Card[]
}

export type BuildCascadeSequenceOutput = {
  steps: CascadeStep[]
  totalWin: number
  finalHand: Card[]
  finalDeck: Card[]
  finalDealIndex: number
  finalResult: HandResult
  hadAnyWin: boolean
}

function assertHandLength5(hand: Card[]) {
  if (hand.length !== 5) {
    throw new Error(`buildCascadeSequenceUseCase ожидает руку из 5 карт, получено: ${hand.length}`)
  }
}

export function buildCascadeSequenceUseCase(
  input: BuildCascadeSequenceInput,
  deps: BuildCascadeSequenceDeps,
): BuildCascadeSequenceOutput {
  const { hand, bet, maxSteps = 100 } = input
  assertHandLength5(hand)
  if (maxSteps <= 0) {
    throw new Error(`maxSteps должен быть > 0, получено: ${maxSteps}`)
  }

  let deck = input.deck.slice()
  let dealIndex = input.dealIndex
  let currentHand = hand.slice()

  const steps: CascadeStep[] = []
  let totalWin = 0

  const draw = (): Card => {
    if (dealIndex >= deck.length) {
      deck = deps.refillDeck()
      dealIndex = 0
    }
    const card = deck[dealIndex]
    if (!card) {
      throw new Error('refillDeck() вернул пустую колоду или dealIndex вышел за границы')
    }
    dealIndex += 1
    return card
  }

  let finalResult: HandResult = getBestHand(currentHand)

  for (let stepIndex = 0; stepIndex < maxSteps; stepIndex += 1) {
    const evalResult = getBestHand(currentHand)
    finalResult = evalResult

    if (evalResult.multiplier <= 0) break

    const handBefore = currentHand.slice()
    const handAfter = currentHand.slice()

    for (const idx of evalResult.winningIndices) {
      handAfter[idx] = draw()
    }

    const winAmount = bet * evalResult.multiplier
    totalWin += winAmount

    steps.push({
      handBefore,
      evalResult,
      winAmount,
      handAfter: handAfter.slice(),
      deckAfter: deck.slice(),
      dealIndexAfter: dealIndex,
    })

    currentHand = handAfter
  }

  return {
    steps,
    totalWin,
    finalHand: currentHand.slice(),
    finalDeck: deck.slice(),
    finalDealIndex: dealIndex,
    finalResult,
    hadAnyWin: steps.length > 0,
  }
}


