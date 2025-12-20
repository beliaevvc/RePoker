/**
 * Файл: src/application/game/usecases/adjustBet.ts
 * Слой: application
 * Назначение: изменение ставки с учётом ограничений и текущего состояния игры.
 *
 * Инварианты:
 * - Поведение 1:1 с логикой из `BalatroInferno.jsx` (мин. 5, макс. balance).
 * - Ставку можно менять только в состояниях `idle` и `result`.
 */

import type { GameState } from '../types'

export type AdjustBetInput = {
  bet: number
  balance: number
  delta: number
  gameState: GameState
}

/**
 * Возвращает новую ставку или исходную, если менять нельзя/не нужно.
 *
 * @returns {number} newBet
 */
export function adjustBetUseCase({ bet, balance, delta, gameState }: AdjustBetInput): number {
  if (gameState !== 'idle' && gameState !== 'result') return bet
  const newBet = Math.max(5, Math.min(balance, bet + delta))
  return newBet
}


