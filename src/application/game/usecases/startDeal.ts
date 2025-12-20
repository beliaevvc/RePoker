/**
 * Файл: src/application/game/usecases/startDeal.ts
 * Слой: application
 * Назначение: старт раздачи (списание ставки, сброс временных данных, новая колода).
 *
 * Инварианты:
 * - Поведение 1:1 с `handleDeal()` в `BalatroInferno.jsx`.
 * - Если balance < bet, стартовать нельзя (use-case в этом случае возвращает null).
 */

import type { GameModel } from '../types'
import { createDeck } from '../../../domain/deck/createDeck'
import type { Rng } from '../../../domain/ports/rng'

export type StartDealResult = Pick<GameModel, 'balance' | 'hand' | 'result' | 'dealIndex' | 'deck' | 'gameState'>

/**
 * Стартует раздачу: списывает ставку, очищает руку/результат, создаёт колоду и переводит в `dealing`.
 *
 * @param {Pick<GameModel, 'balance'|'bet'>} input
 * @param {{ rng: Rng }} deps зависимости (порты)
 * @returns {StartDealResult | null}
 */
export function startDealUseCase(input: Pick<GameModel, 'balance' | 'bet'>, deps: { rng: Rng }): StartDealResult | null {
  const { balance, bet } = input
  if (balance < bet) return null
  const { rng } = deps

  return {
    balance: balance - bet,
    hand: [],
    result: null,
    dealIndex: 0,
    deck: createDeck(rng),
    gameState: 'dealing',
  }
}


