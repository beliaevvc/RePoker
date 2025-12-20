/**
 * Файл: src/infrastructure/clock/browserClock.ts
 * Слой: infrastructure (adapter)
 * Назначение: единая точка доступа к таймерам (setTimeout/clearTimeout) для UI.
 *
 * Зачем:
 * - Чтобы дальше можно было подменять таймеры (тесты/фейковый clock) и не держать “голые” вызовы в UI.
 */

export type TimeoutHandle = ReturnType<typeof setTimeout>

export const browserClock = {
  /**
   * Аналог `setTimeout`.
   */
  setTimeout(fn: () => void, ms: number): TimeoutHandle {
    return globalThis.setTimeout(fn, ms)
  },

  /**
   * Аналог `clearTimeout`.
   */
  clearTimeout(handle: TimeoutHandle): void {
    globalThis.clearTimeout(handle)
  },
}


