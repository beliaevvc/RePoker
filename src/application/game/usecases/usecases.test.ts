/**
 * Файл: src/application/game/usecases/usecases.test.ts
 * Слой: application (tests)
 * Назначение: минимальные тесты сценарной логики (use-cases), чтобы фиксировать поведение 1:1.
 */

import { describe, expect, it } from 'vitest'
import { adjustBetUseCase } from './adjustBet'
import { resolveResultUseCase } from './resolveResult'
import { buildCascadeSequenceUseCase } from './buildCascadeSequence'
import { applyCascadeStepUseCase } from './applyCascadeStep'

describe('adjustBetUseCase', () => {
  it('не меняет ставку если gameState не idle/result', () => {
    const bet = adjustBetUseCase({ bet: 10, balance: 100, delta: 10, gameState: 'dealing' })
    expect(bet).toBe(10)
  })

  it('применяет ограничения: min=5, max=balance', () => {
    expect(adjustBetUseCase({ bet: 10, balance: 12, delta: 999, gameState: 'idle' })).toBe(12)
    expect(adjustBetUseCase({ bet: 10, balance: 100, delta: -999, gameState: 'idle' })).toBe(5)
  })
})

describe('resolveResultUseCase', () => {
  it('на win начисляет bet*multiplier и увеличивает streak до 5', () => {
    const out = resolveResultUseCase({
      balance: 100,
      bet: 10,
      streak: 4,
      evalResult: { name: 'Pair', multiplier: 2, score: 200, winningIndices: [0, 1] },
    })
    expect(out.balance).toBe(120)
    expect(out.streak).toBe(5)
    expect(out.gameState).toBe('result')
    expect(out.result?.name).toBe('Pair')
  })

  it('на lose streak сбрасывается в 0, balance не меняется', () => {
    const out = resolveResultUseCase({
      balance: 100,
      bet: 10,
      streak: 3,
      evalResult: { name: 'High Card', multiplier: 0, score: 0, winningIndices: [] },
    })
    expect(out.balance).toBe(100)
    expect(out.streak).toBe(0)
    expect(out.gameState).toBe('result')
  })
})

function c(suit, rank, id) {
  return { suit, rank, id }
}

describe('buildCascadeSequenceUseCase', () => {
  it('0 шагов: если сразу High Card, totalWin=0', () => {
    const out = buildCascadeSequenceUseCase(
      {
        bet: 10,
        hand: [c('hearts', 2, 'a'), c('spades', 5, 'b'), c('clubs', 7, 'c'), c('diamonds', 9, 'd'), c('hearts', 13, 'e')],
        deck: [c('clubs', 3, 'x')],
        dealIndex: 0,
      },
      { refillDeck: () => [c('clubs', 3, 'x')] },
    )

    expect(out.steps.length).toBe(0)
    expect(out.totalWin).toBe(0)
    expect(out.hadAnyWin).toBe(false)
    expect(out.finalResult.multiplier).toBe(0)
  })

  it('1 шаг: заменяются только winningIndices, остальные карты остаются', () => {
    const initialHand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [c('clubs', 3, 'c3'), c('spades', 11, 'sJ')]

    const out = buildCascadeSequenceUseCase(
      { bet: 10, hand: initialHand, deck, dealIndex: 0, maxSteps: 10 },
      { refillDeck: () => [c('clubs', 4, 'fallback')] },
    )

    expect(out.steps.length).toBe(1)
    expect(out.totalWin).toBe(20) // Pair multiplier = 2
    expect(out.steps[0].evalResult.name).toBe('Pair')
    expect(out.steps[0].evalResult.winningIndices).toEqual([0, 1])

    // индексы 2..4 не должны поменяться
    expect(out.steps[0].handAfter[2]).toEqual(initialHand[2])
    expect(out.steps[0].handAfter[3]).toEqual(initialHand[3])
    expect(out.steps[0].handAfter[4]).toEqual(initialHand[4])
  })

  it('2 шага: суммируется totalWin и корректно двигается dealIndex', () => {
    const initialHand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [
      c('diamonds', 9, 'd9'), // шаг 1: idx 0
      c('clubs', 13, 'cK'), // шаг 1: idx 1
      c('spades', 3, 's3'), // шаг 2: idx 0
      c('hearts', 11, 'hJ'), // шаг 2: idx 2
    ]

    const out = buildCascadeSequenceUseCase({ bet: 10, hand: initialHand, deck, dealIndex: 0 }, { refillDeck: () => deck })

    expect(out.steps.length).toBe(2)
    expect(out.totalWin).toBe(40) // 2 wins по Pair*10

    // после 2 шагов мы должны съесть 4 карты из deck
    expect(out.finalDealIndex).toBe(4)
  })

  it('refillDeck: если deck закончился, use-case запрашивает новую колоду и продолжает', () => {
    const initialHand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [c('diamonds', 3, 'd3')] // не хватит для замены пары
    const refilled = [c('clubs', 4, 'c4'), c('spades', 11, 'sJ')]

    let refillCalls = 0
    const out = buildCascadeSequenceUseCase(
      { bet: 10, hand: initialHand, deck, dealIndex: 0, maxSteps: 5 },
      {
        refillDeck: () => {
          refillCalls += 1
          return refilled
        },
      },
    )

    expect(out.steps.length).toBe(1)
    expect(refillCalls).toBe(1)
    expect(out.steps[0].handAfter[0].id).toBe('d3')
    expect(out.steps[0].handAfter[1].id).toBe('c4') // пришло из refilled
  })
})

describe('applyCascadeStepUseCase', () => {
  it('lose: multiplier=0 ничего не меняет', () => {
    const hand = [c('hearts', 2, 'a'), c('spades', 5, 'b'), c('clubs', 7, 'c'), c('diamonds', 9, 'd'), c('hearts', 13, 'e')]
    const deck = [c('clubs', 3, 'x')]
    const out = applyCascadeStepUseCase({ bet: 10, hand, deck, dealIndex: 0 }, { refillDeck: () => deck })
    expect(out.didWin).toBe(false)
    expect(out.winAmount).toBe(0)
    expect(out.handAfter).toEqual(hand)
    expect(out.dealIndexAfter).toBe(0)
  })

  it('win: заменяются только winningIndices', () => {
    const hand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [c('diamonds', 3, 'd3'), c('clubs', 4, 'c4')]
    const out = applyCascadeStepUseCase({ bet: 10, hand, deck, dealIndex: 0 }, { refillDeck: () => deck })
    expect(out.didWin).toBe(true)
    expect(out.evalResult.name).toBe('Pair')
    expect(out.winningIndices).toEqual([0, 1])
    expect(out.handAfter[2]).toEqual(hand[2])
    expect(out.handAfter[3]).toEqual(hand[3])
    expect(out.handAfter[4]).toEqual(hand[4])
    expect(out.dealIndexAfter).toBe(2)
  })

  it('refillDeck: если deck закончился, добор берётся из новой колоды', () => {
    const hand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [c('diamonds', 3, 'd3')]
    const refilled = [c('clubs', 4, 'c4'), c('spades', 11, 'sJ')]
    let calls = 0
    const out = applyCascadeStepUseCase(
      { bet: 10, hand, deck, dealIndex: 0 },
      {
        refillDeck: () => {
          calls += 1
          return refilled
        },
      },
    )
    expect(out.didWin).toBe(true)
    expect(calls).toBe(1)
    expect(out.handAfter[0].id).toBe('d3')
    expect(out.handAfter[1].id).toBe('c4')
  })
})


