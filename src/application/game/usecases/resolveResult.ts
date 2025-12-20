/**
 * Файл: src/application/game/usecases/resolveResult.ts
 * Слой: application
 * Назначение: применение результата раздачи к балансу/стрик, перевод в состояние `result`.
 *
 * Инварианты:
 * - Поведение 1:1 с веткой `gameState === 'suspense'` в `BalatroInferno.jsx`.
 */

import type { GameModel } from '../types'
import type { HandResult } from '../../../domain/hand-evaluator/getBestHand'

export type ResolveResultInput = Pick<GameModel, 'balance' | 'bet' | 'streak'> & {
  evalResult: HandResult
}

export type ResolveResultOutput = Pick<GameModel, 'balance' | 'streak' | 'result' | 'gameState'>

/**
 * Применяет результат: начисляет выигрыш и увеличивает streak (до 5), либо сбрасывает streak на 0.
 *
 * @returns {ResolveResultOutput}
 */
export function resolveResultUseCase(input: ResolveResultInput): ResolveResultOutput {
  const { balance, bet, streak, evalResult } = input

  if (evalResult.multiplier > 0) {
    return {
      balance: balance + bet * evalResult.multiplier,
      streak: Math.min(streak + 1, 5),
      result: evalResult,
      gameState: 'result',
    }
  }

  return {
    balance,
    streak: 0,
    result: evalResult,
    gameState: 'result',
  }
}


