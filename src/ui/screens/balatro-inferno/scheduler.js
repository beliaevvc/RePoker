/**
 * Файл: src/ui/screens/balatro-inferno/scheduler.js
 * Слой: ui (utility)
 *
 * Назначение:
 * - единый "scheduler" поверх clock, который:
 *   - guard'ит коллбеки по токену (чтобы старые таймеры не пробивали новые шаги)
 *   - даёт централизованный cleanup (clearAll)
 *
 * Важно:
 * - Этот модуль не знает про React и не хранит state — только таймеры.
 */

/**
 * @typedef {{
 *   setTimeout: (fn: () => void, ms: number) => any,
 *   clearTimeout: (h: any) => void
 * }} Clock
 */

/**
 * @param {{
 *   clock: Clock,
 *   tokenRef: { current: number },
 *   token: number,
 *   scaleMs: (ms: number) => number
 * }} params
 */
export function createScheduler({ clock, tokenRef, token, scaleMs }) {
  /** @type {any[]} */
  const handles = []

  /** @type {(fn: () => void, ms: number) => any} */
  const schedule = (fn, ms) => {
    const h = clock.setTimeout(() => {
      if (tokenRef.current !== token) return
      fn()
    }, scaleMs(ms))
    handles.push(h)
    return h
  }

  const clearAll = () => {
    for (const h of handles) clock.clearTimeout(h)
    handles.length = 0
  }

  return { schedule, clearAll }
}


