/**
 * Файл: src/domain/cards/constants.ts
 * Слой: domain
 * Назначение: константы домена для мастей/рангов и отображения рангов.
 *
 * Инварианты:
 * - Значения должны быть 1:1 с тем, что было в `src/BalatroInferno.jsx`.
 */

import type { Rank, Suit } from './types'

/**
 * Список мастей без джокера (используется для перебора при wildcard-оценке).
 */
export const SUITS: Array<Exclude<Suit, 'joker'>> = ['hearts', 'diamonds', 'clubs', 'spades']

/**
 * Ранги стандартных карт (2..14), где 14 = A.
 */
export const RANKS: Array<Exclude<Rank, 15>> = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

/**
 * Отображение рангов для UI (J/Q/K/A и “JOKER”).
 */
export const RANK_NAMES: Record<Rank, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
  15: 'JOKER',
}


