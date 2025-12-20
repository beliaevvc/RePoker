/**
 * Файл: src/domain/deck/createDeck.test.ts
 * Слой: domain (tests)
 * Назначение: детерминированно зафиксировать “chaos” ветки создания колоды.
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

describe('createDeck (chaos ветки)', () => {
  it('без chaos добавляет ровно 1 джокера (53 карты)', () => {
    // 52 вызова на id + затем chaosRoll = 0.5
    const rng = queueRng([...Array(52).fill(0.123), 0.5])
    const deck = createDeck(rng)
    expect(deck.length).toBe(53)
    expect(countJokers(deck)).toBe(1)
  })

  it('Loaded Deck: chaosRoll < 0.005 добавляет ещё 2 джокера (55 карт, 3 джокера)', () => {
    const rng = queueRng([...Array(52).fill(0.123), 0.003])
    const deck = createDeck(rng)
    expect(deck.length).toBe(55)
    expect(countJokers(deck)).toBe(3)
  })

  it('Super Loaded Deck: chaosRoll < 0.001 добавляет ещё 4 джокера (57 карт, 5 джокеров)', () => {
    const rng = queueRng([...Array(52).fill(0.123), 0.0005])
    const deck = createDeck(rng)
    expect(deck.length).toBe(57)
    expect(countJokers(deck)).toBe(5)
  })
})


