/**
 * Файл: src/application/game/debug/jackpotSimulation.ts
 * Слой: application (debug)
 * Назначение: генератор “QA-сценариев” для проверки каскада и джекпота.
 *
 * Важно:
 * - Это НЕ “честная” колода: мы намеренно формируем порядок карт, чтобы гарантировать
 *   достижение джекпота за несколько каскадных шагов.
 * - Используется только из UI-кнопки симуляции.
 */

import type { Card } from '../../../domain/cards/types'
import { createBaseDeck } from '../../../domain/deck/createDeck'

export type JackpotSimScenario = {
  id: string
  deck: Card[]
  hand: Card[]
  dealIndex: number
  expectedMinWinSteps: number
}

function swap<T>(arr: T[], a: number, b: number) {
  const tmp = arr[a]
  arr[a] = arr[b]!
  arr[b] = tmp!
}

function moveFirstMatchingCardToIndex(deck: Card[], predicate: (c: Card) => boolean, targetIndex: number) {
  const foundIndex = deck.findIndex(predicate)
  if (foundIndex < 0) {
    throw new Error(`jackpotSimulation: не нашли карту для переноса в индекс ${targetIndex}`)
  }
  swap(deck, foundIndex, targetIndex)
}

function pick(deck: Card[], suit: Card['suit'], rank: Card['rank']): Card {
  const card = deck.find((c) => c.suit === suit && c.rank === rank)
  if (!card) throw new Error(`jackpotSimulation: не нашли карту ${suit}:${rank} в базовой колоде`)
  return card
}

/**
 * Строит один из 5 сценариев.
 *
 * Идея:
 * - Берём **основную базовую колоду** (52 + 2 джокера = 54).
 * - Стартуем “как будто колода почти исчерпана”: `dealIndex = deck.length - 2`.
 * - Делаем 2 win-шага:
 *   1) Pair → съедаем последние 2 карты и превращаем руку в Flush.
 *   2) Flush при пустой колоде → добор невозможен, `null×5`, срабатывает джекпот.
 */
export function buildJackpotSimulationScenario(scenarioIndex: number): JackpotSimScenario {
  const idx = ((scenarioIndex % 5) + 5) % 5
  let idPtr = 0
  const deck = createBaseDeck(() => `sim:${idx}:deck:${(idPtr += 1)}`)

  // Параметры сценариев: делаем 1 win-шага Pair → превращаемся в Flush.
  // Важно: не собирать Straight/Full House случайно.
  const pairRankByScenario: Array<Card['rank']> = [9, 10, 11, 12, 13]
  const keptHeartsByScenario: Array<[Card['rank'], Card['rank'], Card['rank']]> = [
    [2, 5, 7],
    [3, 6, 8],
    [4, 6, 9],
    [2, 7, 10],
    [3, 8, 11],
  ]
  const tailHeartsByScenario: Array<[Card['rank'], Card['rank']]> = [
    [11, 13],
    [12, 14],
    [10, 14],
    [9, 12],
    [9, 14],
  ]

  const pairRank = pairRankByScenario[idx]!
  const [h0, h1, h2] = keptHeartsByScenario[idx]!
  const [t0, t1] = tailHeartsByScenario[idx]!

  // Гарантируем, что последние 2 карты колоды — нужные hearts для добора пары.
  moveFirstMatchingCardToIndex(deck, (c) => c.suit === 'hearts' && c.rank === t0, deck.length - 2)
  moveFirstMatchingCardToIndex(deck, (c) => c.suit === 'hearts' && c.rank === t1, deck.length - 1)

  // Рука: Pair + 3 hearts. После замены пары на tail2-hearts получится Flush.
  const hand: Card[] = [
    pick(deck, 'spades', pairRank),
    pick(deck, 'diamonds', pairRank),
    pick(deck, 'hearts', h0),
    pick(deck, 'hearts', h1),
    pick(deck, 'hearts', h2),
  ]

  const dealIndex = deck.length - 2
  return {
    id: `sim-${idx + 1}`,
    deck,
    hand,
    dealIndex,
    expectedMinWinSteps: 2,
  }
}


