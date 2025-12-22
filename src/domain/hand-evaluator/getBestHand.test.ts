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

  it('с 1 джокером собирает Royal Flush из 10-J-Q-K + joker', () => {
    const hand = [c('hearts', 10), c('hearts', 11), c('hearts', 12), c('hearts', 13), c('joker', 15, 'j1')]
    const res = getBestHand(hand)
    expect(res.name).toBe('Royal Flush')
    expect(res.multiplier).toBe(1000)
    expect(res.winningIndices).toEqual([0, 1, 2, 3, 4])
  })

  it('Pair платит 0.2x', () => {
    const hand = [c('hearts', 2), c('spades', 2), c('clubs', 9), c('diamonds', 5), c('hearts', 7)]
    const res = getBestHand(hand)
    expect(res.name).toBe('Pair')
    expect(res.multiplier).toBe(0.2)
  })

  it('Two Pair платит 1x', () => {
    const hand = [c('hearts', 2), c('spades', 2), c('clubs', 9), c('diamonds', 9), c('hearts', 7)]
    const res = getBestHand(hand)
    expect(res.name).toBe('Two Pair')
    expect(res.multiplier).toBe(1)
  })

  it('Four of a Kind платит 100x (без Five of a Kind)', () => {
    const hand = [c('spades', 9), c('hearts', 9), c('clubs', 9), c('joker', 15, 'j1'), c('joker', 15, 'j2')]
    const res = getBestHand(hand)
    expect(res.name).toBe('Four of a Kind')
    expect(res.multiplier).toBe(100)
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


