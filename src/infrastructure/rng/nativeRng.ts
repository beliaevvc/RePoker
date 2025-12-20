/**
 * Файл: src/infrastructure/rng/nativeRng.ts
 * Слой: infrastructure (adapter)
 * Назначение: адаптер RNG на основе `Math.random()` для production/dev.
 */

import type { Rng } from '../../domain/ports/rng'

export const nativeRng: Rng = {
  randomFloat() {
    return Math.random()
  },
}


