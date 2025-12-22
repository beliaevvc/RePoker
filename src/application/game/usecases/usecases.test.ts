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
import { buildJackpotSimulationScenario } from '../debug/jackpotSimulation'
import { getCascadeMultiplierForWinStep } from '../cascadeMultiplier'

describe('adjustBetUseCase', () => {
  it('не меняет ставку если gameState не idle/result', () => {
    const bet = adjustBetUseCase({ bet: 1.0, balance: 100, delta: 1, gameState: 'dealing' })
    expect(bet).toBe(1.0)
  })

  it('переключает ставку по фиксированному списку Ante (вперёд/назад) и учитывает баланс', () => {
    expect(adjustBetUseCase({ bet: 1.0, balance: 100, delta: 1, gameState: 'idle' })).toBe(1.2)
    expect(adjustBetUseCase({ bet: 1.0, balance: 100, delta: -1, gameState: 'idle' })).toBe(0.8)

    // нижняя граница списка
    expect(adjustBetUseCase({ bet: 0.2, balance: 100, delta: -1, gameState: 'idle' })).toBe(0.2)

    // верхняя граница списка + ограничение балансом (нельзя прыгнуть на ставку выше баланса)
    expect(adjustBetUseCase({ bet: 1.0, balance: 1.0, delta: 1, gameState: 'idle' })).toBe(1.0)
    expect(adjustBetUseCase({ bet: 10, balance: 15, delta: 1, gameState: 'idle' })).toBe(10)
  })
})

describe('resolveResultUseCase', () => {
  it('на win начисляет bet*multiplier и увеличивает streak до 5', () => {
    const out = resolveResultUseCase({
      balance: 100,
      bet: 10,
      streak: 4,
      evalResult: { name: 'Pair', multiplier: 0.2, score: 200, winningIndices: [0, 1] },
    })
    expect(out.balance).toBe(102)
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

describe('getCascadeMultiplierForWinStep', () => {
  it('маппинг: 1→1×, 2→2×, 3→3×, 4+→5×', () => {
    expect(getCascadeMultiplierForWinStep(1)).toBe(1)
    expect(getCascadeMultiplierForWinStep(2)).toBe(2)
    expect(getCascadeMultiplierForWinStep(3)).toBe(3)
    expect(getCascadeMultiplierForWinStep(4)).toBe(5)
    expect(getCascadeMultiplierForWinStep(5)).toBe(5)
    expect(getCascadeMultiplierForWinStep(99)).toBe(5)
  })

  it('guard: winStepNumber должен быть целым >= 1', () => {
    expect(() => getCascadeMultiplierForWinStep(0)).toThrow()
    expect(() => getCascadeMultiplierForWinStep(-1)).toThrow()
    expect(() => getCascadeMultiplierForWinStep(1.2)).toThrow()
  })
})

function c(suit, rank, id) {
  return { suit, rank, id }
}

describe('buildCascadeSequenceUseCase', () => {
  it('0 шагов: если сразу High Card, totalWin=0', () => {
    const out = buildCascadeSequenceUseCase({
      bet: 10,
      hand: [c('hearts', 2, 'a'), c('spades', 5, 'b'), c('clubs', 7, 'c'), c('diamonds', 9, 'd'), c('hearts', 13, 'e')],
      deck: [c('clubs', 3, 'x')],
      dealIndex: 0,
    })

    expect(out.steps.length).toBe(0)
    expect(out.totalWin).toBe(0)
    expect(out.hadAnyWin).toBe(false)
    expect(out.finalResult.multiplier).toBe(0)
  })

  it('1 шаг: заменяются только winningIndices, остальные карты остаются', () => {
    const initialHand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [c('clubs', 3, 'c3'), c('spades', 11, 'sJ')]

    const out = buildCascadeSequenceUseCase({ bet: 10, hand: initialHand, deck, dealIndex: 0, maxSteps: 10 })

    expect(out.steps.length).toBe(1)
    expect(out.totalWin).toBe(2) // Pair multiplier = 0.2
    expect(out.steps[0].evalResult.name).toBe('Pair')
    expect(out.steps[0].evalResult.winningIndices).toEqual([0, 1])
    expect(out.steps[0].didDeckShortage).toBe(false)

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

    const out = buildCascadeSequenceUseCase({ bet: 10, hand: initialHand, deck, dealIndex: 0 })

    expect(out.steps.length).toBe(2)
    expect(out.totalWin).toBe(4) // 2 wins по Pair*10

    // после 2 шагов мы должны съесть 4 карты из deck
    expect(out.finalDealIndex).toBe(4)
  })

  it('если deck не хватило для добора в win-шага, недостающие слоты становятся null и каскад заканчивается', () => {
    const initialHand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [c('diamonds', 3, 'd3')] // не хватит для замены пары
    const out = buildCascadeSequenceUseCase({ bet: 10, hand: initialHand, deck, dealIndex: 0, maxSteps: 5 })

    expect(out.steps.length).toBe(1)
    expect(out.steps[0].didDeckShortage).toBe(true)
    expect(out.steps[0].handAfter[0].id).toBe('d3')
    expect(out.steps[0].handAfter[1]).toBe(null)
  })
})

describe('applyCascadeStepUseCase', () => {
  it('lose: multiplier=0 ничего не меняет', () => {
    const hand = [c('hearts', 2, 'a'), c('spades', 5, 'b'), c('clubs', 7, 'c'), c('diamonds', 9, 'd'), c('hearts', 13, 'e')]
    const deck = [c('clubs', 3, 'x')]
    const out = applyCascadeStepUseCase({ bet: 10, hand, deck, dealIndex: 0, winStepNumber: 1 })
    expect(out.didWin).toBe(false)
    expect(out.winAmount).toBe(0)
    expect(out.handAfter).toEqual(hand)
    expect(out.dealIndexAfter).toBe(0)
    expect(out.didDeckShortage).toBe(false)
    expect(out.didJackpot).toBe(false)
  })

  it('win: заменяются только winningIndices', () => {
    const hand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [c('diamonds', 3, 'd3'), c('clubs', 4, 'c4')]
    const out = applyCascadeStepUseCase({ bet: 10, hand, deck, dealIndex: 0, winStepNumber: 1 })
    expect(out.didWin).toBe(true)
    expect(out.evalResult.name).toBe('Pair')
    expect(out.winningIndices).toEqual([0, 1])
    expect(out.handAfter[2]).toEqual(hand[2])
    expect(out.handAfter[3]).toEqual(hand[3])
    expect(out.handAfter[4]).toEqual(hand[4])
    expect(out.dealIndexAfter).toBe(2)
    expect(out.didDeckShortage).toBe(false)
    expect(out.didJackpot).toBe(false)
    expect(out.jackpotAmount).toBe(0)
  })

  it('если deck не хватило для добора, недостающие позиции становятся null', () => {
    const hand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [c('diamonds', 3, 'd3')]
    const out = applyCascadeStepUseCase({ bet: 10, hand, deck, dealIndex: 0, winStepNumber: 1 })
    expect(out.didWin).toBe(true)
    expect(out.didDeckShortage).toBe(true)
    expect(out.handAfter[0].id).toBe('d3')
    expect(out.handAfter[1]).toBe(null)
  })

  it('множитель каскада применяется только к выплате за комбинацию (winAmount), но не к jackpotAmount', () => {
    const hand = [c('hearts', 2, 'h2'), c('spades', 2, 's2'), c('clubs', 9, 'c9'), c('diamonds', 5, 'd5'), c('hearts', 7, 'h7')]
    const deck = [c('diamonds', 3, 'd3'), c('clubs', 4, 'c4')]
    const out = applyCascadeStepUseCase({ bet: 10, hand, deck, dealIndex: 0, winStepNumber: 2 })
    // Pair=0.2 => base=2; winStepNumber=2 => x2 => 4
    expect(out.baseWinAmount).toBe(2)
    expect(out.cascadeMultiplier).toBe(2)
    expect(out.winAmount).toBe(4)
    expect(out.jackpotAmount).toBe(0)
  })

  it('jackpot: если после win-шага стол стал полностью пустым и deck пуст, начисляется +150000x bet', () => {
    const hand = [c('hearts', 2, 'h2'), c('hearts', 4, 'h4'), c('hearts', 6, 'h6'), c('hearts', 9, 'h9'), c('hearts', 13, 'hK')] // Flush
    const deck = []
    const out = applyCascadeStepUseCase({ bet: 10, hand, deck, dealIndex: 0, winStepNumber: 4 })
    expect(out.didWin).toBe(true)
    expect(out.evalResult.name).toBe('Flush')
    expect(out.didDeckShortage).toBe(true)
    expect(out.handAfter.every((x) => x === null)).toBe(true)
    expect(out.didJackpot).toBe(true)
    expect(out.jackpotAmount).toBe(10 * 150000)
  })
})

describe('jackpot simulation (QA)', () => {
  it('5 сценариев: каждый приводит к джекпоту за несколько win-шагов', () => {
    for (let i = 0; i < 5; i += 1) {
      const s = buildJackpotSimulationScenario(i)
      let hand = s.hand.slice()
      let deck = s.deck.slice()
      let dealIndex = s.dealIndex

      let winSteps = 0
      let didJackpot = false
      for (let safety = 0; safety < 200; safety += 1) {
        const step = applyCascadeStepUseCase({ bet: 10, hand, deck, dealIndex, winStepNumber: winSteps + 1 })
        if (!step.didWin) break
        winSteps += 1

        if (step.didJackpot) {
          didJackpot = true
          expect(winSteps).toBeGreaterThanOrEqual(s.expectedMinWinSteps)
          expect(step.jackpotAmount).toBe(10 * 150000)
          break
        }

        // До финала в этой симуляции мы не должны получать shortage
        expect(step.didDeckShortage).toBe(false)

        // handAfter до джекпота должен оставаться полностью заполненным (без null)
        const next = step.handAfter
        expect(next.every(Boolean)).toBe(true)

        hand = next as unknown as typeof hand
        deck = step.deckAfter
        dealIndex = step.dealIndexAfter
      }

      // гарантируем, что джекпот действительно случился
      expect(didJackpot).toBe(true)
      expect(winSteps).toBeGreaterThanOrEqual(s.expectedMinWinSteps)
    }
  })
})


