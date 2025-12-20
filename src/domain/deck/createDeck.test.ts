/**
 * Файл: src/domain/deck/createDeck.test.ts
 * Слой: domain (tests)
 * Назначение: зафиксировать инварианты создания колоды.
 *
 * Важно:
 * - Мы не проверяем порядок перемешивания (sort + rng), только инварианты: размер колоды и число джокеров.
 */

import { describe, expect, it } from 'vitest'
import type { Rng } from '../ports/rng'
import { createDeck } from './createDeck'

function queueRng(values: number[], fallback = 0.5): Rng {
  let i = 0
  return {
    randomFloat() {
      const v = values[i]
      i += 1
      return v ?? fallback
    },
  }
}

function countJokers(deck: Array<{ suit: string }>): number {
  return deck.filter((c) => c.suit === 'joker').length
}

describe('createDeck', () => {
  it('создаёт колоду 52 + 2 джокера = 54 карты', () => {
    // Важно: shuffle внутри sort() вызывает rng неопределённое число раз, поэтому даём fallback.
    const rng = queueRng([...Array(200).fill(0.123)], 0.123)
    const deck = createDeck(rng)

    expect(deck.length).toBe(54)
    expect(countJokers(deck)).toBe(2)
  })

  it('каждая стандартная карта присутствует ровно в 1 копии', () => {
    const rng = queueRng([...Array(200).fill(0.123)], 0.123)
    const deck = createDeck(rng)

    const counts = new Map<string, number>()
    for (const card of deck) {
      const key = `${card.suit}:${card.rank}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    // 2 джокера
    expect(counts.get('joker:15')).toBe(2)

    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const
    const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const
    for (const suit of suits) {
      for (const rank of ranks) {
        expect(counts.get(`${suit}:${rank}`)).toBe(1)
      }
    }
  })
})


