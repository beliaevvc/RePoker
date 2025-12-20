/**
 * Файл: src/application/game/usecases/usecases.test.ts
 * Слой: application (tests)
 * Назначение: минимальные тесты сценарной логики (use-cases), чтобы фиксировать поведение 1:1.
 */

import { describe, expect, it } from 'vitest'
import { adjustBetUseCase } from './adjustBet'
import { resolveResultUseCase } from './resolveResult'

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


