/**
 * Файл: src/domain/hand-evaluator/constants.ts
 * Слой: domain
 * Назначение: таблицы tier и multiplier для комбинаций.
 *
 * Инварианты:
 * - Значения должны быть 1:1 с монолитом `src/BalatroInferno.jsx`.
 */

export const HAND_TIERS: Record<string, number> = {
  '5 Jokers': 7,
  '4 Jokers': 6,
  '3 Jokers': 5,
  'Royal Flush': 4,
  'Straight Flush': 4,
  'Five of a Kind': 4, // With Joker
  'Four of a Kind': 3,
  'Full House': 3,
  Flush: 2,
  Straight: 2,
  'Three of a Kind': 2,
  'Two Pair': 1,
  Pair: 1,
  'High Card': 0,
}

export const HAND_MULTIPLIERS: Record<string, number> = {
  '5 Jokers': 150000,
  '4 Jokers': 10000,
  '3 Jokers': 5000,
  'Royal Flush': 1000,
  'Straight Flush': 200,
  'Five of a Kind': 150,
  'Four of a Kind': 60,
  'Full House': 30,
  Flush: 20,
  Straight: 15,
  'Three of a Kind': 8,
  'Two Pair': 4,
  Pair: 2,
  'High Card': 0,
}


