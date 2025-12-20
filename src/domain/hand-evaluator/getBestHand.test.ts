/**
 * Файл: src/domain/hand-evaluator/getBestHand.test.ts
 * Слой: domain (tests)
 * Назначение: зафиксировать поведение оценки комбинаций (включая джокеров) на этапе рефакторинга.
 *
 * Инварианты:
 * - Тесты проверяют поведение 1:1. Если тест сломался — это сигнал, что рефакторинг изменил логику.
 */

import { describe, expect, it } from 'vitest'
import type { Card, Rank, Suit } from '../cards/types'
import { getBestHand } from './getBestHand'

/**
 * Удобный конструктор карты для тестов.
 */
function c(suit: Suit, rank: Rank, id = `${suit}-${rank}`): Card {
  return { suit, rank, id }
}

describe('getBestHand', () => {
  it('распознаёт Royal Flush (без джокеров)', () => {
    const hand = [c('hearts', 10), c('hearts', 11), c('hearts', 12), c('hearts', 13), c('hearts', 14)]
    const res = getBestHand(hand)
    expect(res.name).toBe('Royal Flush')
    expect(res.multiplier).toBe(1000)
    expect(res.winningIndices).toEqual([0, 1, 2, 3, 4])
  })

  it('распознаёт 5 Jokers', () => {
    const hand = [c('joker', 15, 'j1'), c('joker', 15, 'j2'), c('joker', 15, 'j3'), c('joker', 15, 'j4'), c('joker', 15, 'j5')]
    const res = getBestHand(hand)
    expect(res.name).toBe('5 Jokers')
    expect(res.multiplier).toBe(150000)
    expect(res.winningIndices).toEqual([0, 1, 2, 3, 4])
  })

  it('распознаёт 4 Jokers', () => {
    const hand = [c('joker', 15, 'j1'), c('joker', 15, 'j2'), c('joker', 15, 'j3'), c('joker', 15, 'j4'), c('spades', 2)]
    const res = getBestHand(hand)
    expect(res.name).toBe('4 Jokers')
    expect(res.multiplier).toBe(10000)
    expect(res.winningIndices.sort()).toEqual([0, 1, 2, 3])
  })

  it('распознаёт 3 Jokers', () => {
    const hand = [c('joker', 15, 'j1'), c('joker', 15, 'j2'), c('joker', 15, 'j3'), c('spades', 2), c('clubs', 3)]
    const res = getBestHand(hand)
    expect(res.name).toBe('3 Jokers')
    expect(res.multiplier).toBe(5000)
    expect(res.winningIndices.sort()).toEqual([0, 1, 2])
  })

  it('с 1 джокером собирает Royal Flush из 10-J-Q-K + joker', () => {
    const hand = [c('hearts', 10), c('hearts', 11), c('hearts', 12), c('hearts', 13), c('joker', 15, 'j1')]
    const res = getBestHand(hand)
    expect(res.name).toBe('Royal Flush')
    expect(res.multiplier).toBe(1000)
    expect(res.winningIndices).toEqual([0, 1, 2, 3, 4])
  })

  it('с 2 джокерами находит Five of a Kind (9-9-9 + joker + joker)', () => {
    const hand = [c('spades', 9), c('hearts', 9), c('clubs', 9), c('joker', 15, 'j1'), c('joker', 15, 'j2')]
    const res = getBestHand(hand)
    expect(res.name).toBe('Five of a Kind')
    expect(res.multiplier).toBe(150)
    expect(res.winningIndices).toEqual([0, 1, 2, 3, 4])
  })

  it('с 1 джокером при "одной паре" выбирает пару со старшей картой (а не с младшей)', () => {
    // Здесь джокер может образовать пару с любой из карт руки.
    // Ожидаем, что будет выбрана пара с самой старшей доступной картой: J (11).
    const hand = [c('spades', 2), c('hearts', 5), c('clubs', 9), c('diamonds', 11), c('joker', 15, 'j1')]
    const res = getBestHand(hand)
    expect(res.name).toBe('Pair')
    expect(res.winningIndices).toEqual([3, 4])
  })
})


