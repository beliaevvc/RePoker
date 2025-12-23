/**
 * Файл: src/ui/screens/balatro-inferno/cascadeTimeline.js
 * Слой: ui (utility)
 *
 * Назначение:
 * - зафиксировать таймлайн refill‑фазы каскада (появление новых карт по индексам)
 * - сделать тайминги/порядок единым и тестируемым (без React)
 *
 * Инвариант:
 * - Должно совпадать 1:1 с прежними задержками в `useBalatroInfernoController`.
 */

/**
 * @typedef {{
 *   sortedIdx: number[],
 *   commitAt: number,
 *   flashOnAt: number,
 *   flashOffAt: number,
 *   endAt: number,
 * }} CardRefillTimeline
 */

/**
 * Планирует (и частично ставит) таймлайн "refill" (появление новых карт в пустые слоты).
 *
 * @param {{
 *   schedule: (fn: () => void, ms: number) => any,
 *   winningIndices: number[],
 *   appearStart?: number,
 *   appearDelay?: number,
 *   appearHold?: number,
 *   onAppear: (idx: number) => void,
 *   onAppearEnd: (idx: number) => void,
 *   onFlashOn?: () => void,
 *   onFlashOff?: () => void,
 * }} params
 *
 * @returns {CardRefillTimeline}
 */
export function scheduleCardRefillTimeline({
  schedule,
  winningIndices,
  appearStart = 1080,
  appearDelay = 120,
  appearHold = 260,
  onAppear,
  onAppearEnd,
  onFlashOn = null,
  onFlashOff = null,
}) {
  const sortedIdx = [...(winningIndices ?? [])].slice().sort((a, b) => a - b)

  for (let k = 0; k < sortedIdx.length; k += 1) {
    const idx = sortedIdx[k]
    schedule(() => onAppear(idx), appearStart + k * appearDelay)
    schedule(() => onAppearEnd(idx), appearStart + k * appearDelay + appearHold)
  }

  // ВАЖНО: тайминги должны совпадать 1:1 с исходной реализацией контроллера.
  const commitAt = appearStart + sortedIdx.length * appearDelay + 40
  const flashOnAt = appearStart + sortedIdx.length * appearDelay + 80
  const flashOffAt = appearStart + sortedIdx.length * appearDelay + 260
  const endAt = appearStart + sortedIdx.length * appearDelay + 520

  if (typeof onFlashOn === 'function') schedule(onFlashOn, flashOnAt)
  if (typeof onFlashOff === 'function') schedule(onFlashOff, flashOffAt)

  return { sortedIdx, commitAt, flashOnAt, flashOffAt, endAt }
}


