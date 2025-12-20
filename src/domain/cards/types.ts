/**
 * Файл: src/domain/cards/types.ts
 * Слой: domain
 * Назначение: базовые типы домена “карты/масти/ранги”.
 *
 * Инварианты:
 * - Не тянуть UI/React зависимости.
 * - Типы должны соответствовать текущему поведению (1:1) из монолита `BalatroInferno.jsx`.
 */

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker'

export type Rank =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15 // JOKER

export type Card = {
  suit: Suit
  rank: Rank
  id: string
}


