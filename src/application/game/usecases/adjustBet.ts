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
import { ANTE_VALUES } from '../constants/ante'

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

  // delta трактуем как “шаг” по списку ставок: знак определяет направление, модуль не важен.
  if (delta === 0) return bet
  const step = delta > 0 ? 1 : -1

  const eps = 1e-9
  const values = ANTE_VALUES

  // Текущая ставка может быть не из списка (например, после старых версий/округлений) — тогда берём ближайшую.
  let currentIndex = values.findIndex((v) => Math.abs(v - bet) < eps)
  if (currentIndex === -1) {
    // ближайший по абсолютной разнице
    currentIndex = 0
    let bestDist = Math.abs(values[0] - bet)
    for (let i = 1; i < values.length; i += 1) {
      const d = Math.abs(values[i] - bet)
      if (d < bestDist) {
        bestDist = d
        currentIndex = i
      }
    }
  }

  // Применяем шаг и ограничение доступностью по балансу.
  let nextIndex = Math.max(0, Math.min(values.length - 1, currentIndex + step))
  let nextBet = values[nextIndex]

  // Если следующая ставка недоступна (выше баланса), берём максимальную доступную <= balance.
  if (nextBet > balance + eps) {
    let affordableIndex = -1
    for (let i = 0; i < values.length; i += 1) {
      if (values[i] <= balance + eps) affordableIndex = i
    }

    // Если вообще ничего не доступно — оставляем как есть (игра всё равно не даст стартовать раздачу).
    if (affordableIndex === -1) return bet
    nextIndex = affordableIndex
    nextBet = values[nextIndex]
  }

  return nextBet
}


