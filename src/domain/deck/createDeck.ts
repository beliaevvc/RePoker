/**
 * Файл: src/domain/deck/createDeck.ts
 * Слой: domain
 * Назначение: создание и перемешивание колоды (включая джокеров и “chaos” шанс дополнительных джокеров).
 *
 * Инварианты:
 * - Поведение и вероятности должны быть 1:1 с `src/BalatroInferno.jsx`.
 * - На Этапе 5 запрещено использовать `Math.random()` напрямую — RNG приходит через порт.
 */

import { RANKS, SUITS } from '../cards/constants'
import type { Card, Rank, Suit } from '../cards/types'
import type { Rng } from '../ports/rng'

/**
 * Создаёт новую колоду: 52 карты + 1 “golden joker”.
 * Редко добавляет дополнительные джокеры (chaos roll), чтобы было возможно 3+ джокеров.
 *
 * @param {Rng} rng источник случайности (порт)
 * @returns {Card[]} перемешанная колода
 */
export function createDeck(rng: Rng): Card[] {
  const deck: Card[] = []

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit: suit as Suit, rank: rank as Rank, id: rng.randomFloat().toString(36).slice(2, 11) })
    }
  }

  // ADD ONE GOLDEN JOKER
  deck.push({ suit: 'joker', rank: 15, id: 'joker-card' })

  // RARE: Add extra jokers (Chaos Mode probability)
  // Chance to have a deck capable of 3+ jokers
  const chaosRoll = rng.randomFloat()
  if (chaosRoll < 0.001) {
    // 0.1% chance: Super Loaded Deck (up to 5 jokers)
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-2' })
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-3' })
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-4' })
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-5' })
  } else if (chaosRoll < 0.005) {
    // 0.4% chance: Loaded Deck (up to 3 jokers)
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-2' })
    deck.push({ suit: 'joker', rank: 15, id: 'joker-card-3' })
  }

  // Перемешивание 1:1 (не крипто‑качество, но соответствует текущему поведению).
  return deck.sort(() => rng.randomFloat() - 0.5)
}


