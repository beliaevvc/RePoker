/**
 * Файл: src/domain/deck/createDeck.ts
 * Слой: domain
 * Назначение: создание и перемешивание колоды.
 *
 * Инварианты:
 * - Поведение и вероятности должны быть 1:1 с `src/BalatroInferno.jsx`.
 * - На Этапе 5 запрещено использовать `Math.random()` напрямую — RNG приходит через порт.
 */

import { RANKS, SUITS } from '../cards/constants'
import type { Card, Rank, Suit } from '../cards/types'
import type { Rng } from '../ports/rng'

/**
 * Создаёт базовую (неперемешанную) колоду:
 * - 52 стандартные карты
 * - 2 джокера
 * Итого: 54 карты.
 *
 * Это **единственный источник истины** по составу колоды. Любые debug-сценарии/симуляции
 * должны опираться на эту функцию, чтобы не расходиться с основной механикой.
 */
export function createBaseDeck(createId: () => string): Card[] {
  const deck: Card[] = []

  // 52 стандартные карты
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit: suit as Suit, rank: rank as Rank, id: createId() })
    }
  }

  // 2 джокера
  deck.push({ suit: 'joker', rank: 15, id: createId() })
  deck.push({ suit: 'joker', rank: 15, id: createId() })

  return deck
}

/**
 * Создаёт новую колоду: базовая колода + перемешивание.
 *
 * @param {Rng} rng источник случайности (порт)
 * @returns {Card[]} перемешанная колода
 */
export function createDeck(rng: Rng): Card[] {
  const deck = createBaseDeck(() => rng.randomFloat().toString(36).slice(2, 11))

  // Перемешивание 1:1 (не крипто‑качество, но соответствует текущему поведению).
  return deck.sort(() => rng.randomFloat() - 0.5)
}


