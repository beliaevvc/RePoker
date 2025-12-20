/**
 * Файл: src/infrastructure/rng/seededRng.ts
 * Слой: infrastructure (adapter)
 * Назначение: детерминированный RNG для тестов/воспроизводимости.
 */

import type { Rng } from '../../domain/ports/rng'

/**
 * Простой LCG (Linear Congruential Generator).
 * Не криптографический; нужен только для детерминированных тестов.
 *
 * @param {number} seed
 * @returns {Rng}
 */
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0

  return {
    randomFloat() {
      // Numerical Recipes LCG
      state = (1664525 * state + 1013904223) >>> 0
      return state / 0x1_0000_0000
    },
  }
}


