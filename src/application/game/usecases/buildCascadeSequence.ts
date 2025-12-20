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
 * - Если deck закончился — НЕ пополняем: недостающие карты становятся `null`,
 *   и каскад заканчивается сразу после этого win-шага.
 * - Выигрыш totalWin = сумма bet * multiplier по всем win-шагам (без множителей каскада).
 */

import type { Card } from '../../../domain/cards/types'
import { getBestHand } from '../../../domain/hand-evaluator/getBestHand'
import type { HandResult } from '../../../domain/hand-evaluator/getBestHand'

export type TableCard = Card | null

export type CascadeStep = {
  handBefore: Card[]
  evalResult: HandResult
  winAmount: number
  didDeckShortage: boolean
  handAfter: TableCard[]
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

export type BuildCascadeSequenceOutput = {
  steps: CascadeStep[]
  totalWin: number
  finalHand: TableCard[]
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
): BuildCascadeSequenceOutput {
  const { hand, bet, maxSteps = 100 } = input
  assertHandLength5(hand)
  if (maxSteps <= 0) {
    throw new Error(`maxSteps должен быть > 0, получено: ${maxSteps}`)
  }

  const cleanMoney = (n: number) => Math.round(n * 1e10) / 1e10

  let deck = input.deck.slice()
  let dealIndex = input.dealIndex
  let currentHand: Card[] = hand.slice()

  const steps: CascadeStep[] = []
  let totalWin = 0

  const draw = (ctx: { didDeckShortage: boolean }): Card | null => {
    if (dealIndex >= deck.length) {
      ctx.didDeckShortage = true
      return null
    }
    const card = deck[dealIndex]
    if (!card) {
      ctx.didDeckShortage = true
      return null
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
    const handAfter: TableCard[] = currentHand.slice()
    const ctx = { didDeckShortage: false }

    for (const idx of evalResult.winningIndices) {
      handAfter[idx] = draw(ctx)
    }

    const winAmount = cleanMoney(bet * evalResult.multiplier)
    totalWin = cleanMoney(totalWin + winAmount)

    steps.push({
      handBefore,
      evalResult,
      winAmount,
      didDeckShortage: ctx.didDeckShortage,
      handAfter: handAfter.slice(),
      deckAfter: deck.slice(),
      dealIndexAfter: dealIndex,
    })

    // Если deck не хватило — по ТЗ каскад заканчивается сразу после win-шага.
    if (ctx.didDeckShortage) {
      currentHand = handAfter.filter(Boolean) as Card[] // безопасно: дальше мы не будем оценивать
      break
    }

    currentHand = handAfter as Card[]
  }

  return {
    steps,
    totalWin,
    finalHand: steps.length > 0 ? steps[steps.length - 1].handAfter.slice() : currentHand.slice(),
    finalDeck: deck.slice(),
    finalDealIndex: dealIndex,
    finalResult,
    hadAnyWin: steps.length > 0,
  }
}


