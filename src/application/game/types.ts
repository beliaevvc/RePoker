/**
 * Файл: src/application/game/types.ts
 * Слой: application
 * Назначение: типы состояния игры и контракты use-cases (без UI и без инфраструктуры).
 *
 * Инварианты:
 * - Поведение должно соответствовать текущему UI (1:1).
 * - Здесь нет React/DOM/таймеров: только структура данных.
 */

import type { Card } from '../../domain/cards/types'
import type { HandResult } from '../../domain/hand-evaluator/getBestHand'

export type GameState = 'idle' | 'dealing' | 'suspense' | 'result'

export type GameModel = {
  balance: number
  bet: number
  streak: number
  hand: Card[]
  gameState: GameState
  result: HandResult | null
  deck: Card[]
  dealIndex: number
}


