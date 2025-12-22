/**
 * Файл: src/domain/hand-evaluator/constants.ts
 * Слой: domain
 * Назначение: таблицы tier и multiplier для комбинаций.
 *
 * Инварианты:
 * - Значения должны быть 1:1 с монолитом `src/BalatroInferno.jsx`.
 */

export const HAND_TIERS: Record<string, number> = {
  'Royal Flush': 4,
  'Straight Flush': 4,
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
  // Новая таблица выплат (x на ставку игрока)
  Pair: 0.2,
  'Two Pair': 1,
  'Three of a Kind': 5,
  Straight: 10,
  Flush: 20,
  'Full House': 50,
  'Four of a Kind': 100,
  'Straight Flush': 200,
  'Royal Flush': 1000,
  'High Card': 0,
}


