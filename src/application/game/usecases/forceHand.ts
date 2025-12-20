/**
 * Файл: src/application/game/usecases/forceHand.ts
 * Слой: application
 * Назначение: debug-use-case для форса руки с N джокерами (1–2), чтобы тестировать wildcard-поведение.
 *
 * Инварианты:
 * - Поведение 1:1 с `forceHand(jokerCount)` в `BalatroInferno.jsx`.
 * - Используется только когда игра в `idle` или `result` (в UI это проверяется).
 */

import type { GameModel } from '../types'
import type { Card } from '../../../domain/cards/types'
import { createDeck } from '../../../domain/deck/createDeck'
import type { Rng } from '../../../domain/ports/rng'

export type ForceHandResult = Pick<GameModel, 'balance' | 'hand' | 'result' | 'dealIndex' | 'deck' | 'gameState'>

/**
 * Создаёт “форсированную” колоду: N джокеров + добивка случайными картами (без джокеров),
 * списывает ставку и переводит игру в `dealing`.
 *
 * @param {Pick<GameModel,'balance'|'bet'>} input
 * @param {{ rng: Rng }} deps зависимости (порт RNG)
 * @param {number} jokerCount количество джокеров (0..2)
 * @returns {ForceHandResult | null} null если balance < bet
 */
export function forceHandUseCase(
  input: Pick<GameModel, 'balance' | 'bet'>,
  deps: { rng: Rng },
  jokerCount: number,
): ForceHandResult | null {
  const { balance, bet } = input
  if (balance < bet) return null
  const { rng } = deps

  const safeJokerCount = Math.max(0, Math.min(2, Math.floor(jokerCount)))

  const forcedDeck: Card[] = []

  // Add jokers
  for (let i = 0; i < safeJokerCount; i++) {
    forcedDeck.push({ suit: 'joker', rank: 15, id: `force-joker-${i}` })
  }

  // Fill rest with random cards (без джокеров)
  const tempDeck = createDeck(rng).filter((c) => c.suit !== 'joker')

  let added = 0
  for (const card of tempDeck) {
    if (added >= 5 - safeJokerCount) break
    forcedDeck.push(card)
    added++
  }

  return {
    balance: balance - bet,
    hand: [],
    result: null,
    deck: forcedDeck,
    dealIndex: 0,
    gameState: 'dealing',
  }
}


