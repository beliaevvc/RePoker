/**
 * Файл: src/ui/screens/balatro-inferno/testDeps.ts
 * Слой: ui (test utilities)
 *
 * Назначение:
 * - “test deps” для `useBalatroInfernoController(deps)`:
 *   seeded RNG + fake clock + in-memory storage/location
 * - используется только в тестах/QA-сценариях (не влияет на runtime)
 */

import type { Rng } from '../../../domain/ports/rng'
import { createSeededRng } from '../../../infrastructure/rng/seededRng'
import type { FakeClock } from '../../../infrastructure/clock/fakeClock'
import { createFakeClock } from '../../../infrastructure/clock/fakeClock'

export type TestStorage = {
  getItem: (k: string) => string | null
  setItem: (k: string, v: string) => void
}

export type TestLocation = {
  search: string
  reload: () => void
}

export type BalatroInfernoTestDeps = {
  rng: Rng
  clock: FakeClock
  storage: TestStorage
  location: TestLocation
}

export function createTestBalatroInfernoDeps(seed = 123, startMs = 0): BalatroInfernoTestDeps {
  const map = new Map<string, string>()
  const storage: TestStorage = {
    getItem(k) {
      return map.has(k) ? map.get(k)! : null
    },
    setItem(k, v) {
      map.set(k, String(v))
    },
  }

  let reloaded = false
  const location: TestLocation = {
    search: '',
    reload() {
      reloaded = true
    },
  }

  const rng = createSeededRng(seed)
  const clock = createFakeClock(startMs)

  // expose for debugging in tests (non-essential)
  ;(location as any).__reloaded = () => reloaded

  return { rng, clock, storage, location }
}


