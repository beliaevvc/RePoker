/**
 * Файл: src/domain/hand-evaluator/getBestHand.ts
 * Слой: domain
 * Назначение: оценка лучшей комбинации для руки из 5 карт с поддержкой джокеров как wildcard.
 *
 * Инварианты:
 * - Поведение и коэффициенты должны быть 1:1 с реализацией в `src/BalatroInferno.jsx` на момент начала рефакторинга.
 * - Функция должна быть чистой: без таймеров, без UI, без доступа к DOM.
 */

import { RANKS, SUITS } from '../cards/constants'
import type { Card } from '../cards/types'
import { HAND_MULTIPLIERS } from './constants'

export type HandResult = {
  name: string
  multiplier: number
  score: number
  winningIndices: number[]
}

type IndexedCard = Card & { idx: number }

/**
 * Возвращает лучшую комбинацию для руки из 5 карт.
 * - Без джокеров: стандартная проверка.
 * - С 1–2 джокерами: перебор подстановок (52^N).
 * - С 3–5 джокерами: специальные комбинации.
 *
 * @param {Card[]} cards рука из 5 карт
 * @returns {HandResult}
 */
export function getBestHand(cards: Card[]): HandResult {
  /**
   * Стандартная оценка без джокеров.
   * Важно: `testCards` содержат поле `idx` — индекс карты в исходной руке (0..4).
   */
  const evaluateStandard = (testCards: IndexedCard[]): HandResult => {
    /**
     * Тай-брейк для одинаковых категорий.
     *
     * Важно: при 1–2 джокерах мы перебираем подстановки и выбираем максимум по `score`.
     * Если `score` одинаковый (как было раньше для Pair/Two Pair и т.п.), побеждает
     * первая найденная подстановка — что приводит к неверному выбору (например, пара
     * с самой младшей картой из доступных).
     *
     * Поэтому мы кодируем “силу внутри категории” в младших разрядах `score`.
     */
    const SCORE_BUCKET = 1_000_000
    const encodeRanksDesc = (ranksDesc: number[]) => {
      // base-15 кодирование (ранги 2..14) — достаточно для лексикографического сравнения
      return ranksDesc.reduce((acc, r) => acc * 15 + r, 0)
    }

    const sorted = [...testCards].sort((a, b) => a.rank - b.rank)
    const ranks = sorted.map((c) => c.rank)
    const suits = sorted.map((c) => c.suit)
    const isFlush = new Set(suits).size === 1
    const isStraight =
      ranks.every((val, i) => i === 0 || val === (ranks[i - 1] as number) + 1) ||
      ranks.join(',') === '2,3,4,5,14'

    const rankToIdxs = new Map<number, number[]>()
    for (const c of testCards) {
      const arr = rankToIdxs.get(c.rank) ?? []
      arr.push(c.idx)
      rankToIdxs.set(c.rank, arr)
    }
    const countsValues = [...rankToIdxs.values()]
      .map((v) => v.length)
      .sort((a, b) => b - a)

    const allIdx = testCards
      .map((c) => c.idx)
      .sort((a, b) => a - b)
    const idxsOfRank = (r: number) => (rankToIdxs.get(r) ?? []).slice().sort((a, b) => a - b)
    const rankGroupsDesc = [...rankToIdxs.entries()]
      .map(([rank, idxs]) => ({ rank, idxs }))
      .sort((a, b) => b.idxs.length - a.idxs.length || b.rank - a.rank)
    const ranksDesc = [...ranks].slice().sort((a, b) => b - a)
    const straightHigh =
      ranks.join(',') === '2,3,4,5,14' ? 5 : (ranks[ranks.length - 1] as number)

    if (isFlush && isStraight && ranks[4] === 14 && ranks[0] === 10)
      return {
        name: 'Royal Flush',
        multiplier: HAND_MULTIPLIERS['Royal Flush'],
        score: 1000 * SCORE_BUCKET,
        winningIndices: allIdx,
      }
    if (isFlush && isStraight)
      return {
        name: 'Straight Flush',
        multiplier: HAND_MULTIPLIERS['Straight Flush'],
        score: 900 * SCORE_BUCKET + straightHigh,
        winningIndices: allIdx,
      }
    if (countsValues[0] === 4)
      return {
        name: 'Four of a Kind',
        multiplier: HAND_MULTIPLIERS['Four of a Kind'],
        score:
          800 * SCORE_BUCKET +
          encodeRanksDesc([rankGroupsDesc[0]?.rank ?? 0, rankGroupsDesc[1]?.rank ?? 0]),
        winningIndices: rankGroupsDesc[0]?.idxs.slice().sort((a, b) => a - b) ?? [],
      }
    if (countsValues[0] === 3 && countsValues[1] === 2)
      return {
        name: 'Full House',
        multiplier: HAND_MULTIPLIERS['Full House'],
        score:
          700 * SCORE_BUCKET + encodeRanksDesc([rankGroupsDesc[0]?.rank ?? 0, rankGroupsDesc[1]?.rank ?? 0]),
        winningIndices: allIdx,
      }
    if (isFlush)
      return {
        name: 'Flush',
        multiplier: HAND_MULTIPLIERS.Flush,
        score: 600 * SCORE_BUCKET + encodeRanksDesc(ranksDesc),
        winningIndices: allIdx,
      }
    if (isStraight)
      return {
        name: 'Straight',
        multiplier: HAND_MULTIPLIERS.Straight,
        score: 500 * SCORE_BUCKET + straightHigh,
        winningIndices: allIdx,
      }
    if (countsValues[0] === 3)
      return {
        name: 'Three of a Kind',
        multiplier: HAND_MULTIPLIERS['Three of a Kind'],
        score:
          400 * SCORE_BUCKET +
          encodeRanksDesc([
            rankGroupsDesc[0]?.rank ?? 0,
            ...(rankGroupsDesc.slice(1).map((g) => g.rank).sort((a, b) => b - a) as number[]),
          ]),
        winningIndices: rankGroupsDesc[0]?.idxs.slice().sort((a, b) => a - b) ?? [],
      }
    if (countsValues[0] === 2 && countsValues[1] === 2)
      return {
        name: 'Two Pair',
        multiplier: HAND_MULTIPLIERS['Two Pair'],
        score:
          300 * SCORE_BUCKET +
          encodeRanksDesc([
            Math.max(rankGroupsDesc[0]?.rank ?? 0, rankGroupsDesc[1]?.rank ?? 0),
            Math.min(rankGroupsDesc[0]?.rank ?? 0, rankGroupsDesc[1]?.rank ?? 0),
            rankGroupsDesc[2]?.rank ?? 0,
          ]),
        winningIndices: [...(rankGroupsDesc[0]?.idxs ?? []), ...(rankGroupsDesc[1]?.idxs ?? [])].sort(
          (a, b) => a - b,
        ),
      }
    if (countsValues[0] === 2) {
      const pairRank = rankGroupsDesc[0]?.rank
      return {
        name: 'Pair',
        multiplier: HAND_MULTIPLIERS.Pair,
        score:
          200 * SCORE_BUCKET +
          encodeRanksDesc([
            pairRank ?? 0,
            ...(ranksDesc.filter((r) => r !== pairRank) as number[]),
          ]),
        winningIndices: pairRank != null ? idxsOfRank(pairRank) : [],
      }
    }
    return {
      name: 'High Card',
      multiplier: 0,
      score: 0 * SCORE_BUCKET + encodeRanksDesc(ranksDesc),
      winningIndices: [],
    }
  }

  // 1. Ищем джокеров
  const jokerIndices = cards
    .map((c, idx) => (c.suit === 'joker' ? idx : -1))
    .filter((idx) => idx !== -1)

  const jokerCount = jokerIndices.length

  // В основной колоде максимум 2 джокера. При большем количестве считаем это ошибкой данных/отладки.
  if (jokerCount > 2) {
    throw new Error(`getBestHand: jokerCount > 2 не поддерживается (получено: ${jokerCount})`)
  }

  if (jokerCount === 0) {
    return evaluateStandard(cards.map((c, idx) => ({ ...c, idx })))
  }

  // 2. Есть джокер(ы) (1 или 2): брутфорс
  let bestResult: HandResult = { name: 'High Card', multiplier: 0, score: -1, winningIndices: [] }

  // Карты без джокеров
  const fixedCards: IndexedCard[] = cards
    .map((c, idx) => ({ ...c, idx }))
    .filter((c) => c.suit !== 'joker')

  /**
   * Рекурсивный перебор подстановок для всех джокеров.
   *
   * @param currentCards текущие подставленные карты (без оставшихся джокеров)
   * @param jokersLeftToReplace индексы джокеров, которые ещё не заменили
   */
  const tryJokerCombinations = (currentCards: IndexedCard[], jokersLeftToReplace: number[]) => {
    if (jokersLeftToReplace.length === 0) {
      const res = evaluateStandard(currentCards)
      if (res.score > bestResult.score) bestResult = res
      return
    }

    const currentJokerIdx = jokersLeftToReplace[0]
    const remainingJokers = jokersLeftToReplace.slice(1)

    for (const s of SUITS) {
      for (const r of RANKS) {
        const newCard: IndexedCard = { suit: s, rank: r, idx: currentJokerIdx, id: `joker:${currentJokerIdx}` }
        tryJokerCombinations([...currentCards, newCard], remainingJokers)
      }
    }
  }

  tryJokerCombinations(fixedCards, jokerIndices)
  return bestResult
}


