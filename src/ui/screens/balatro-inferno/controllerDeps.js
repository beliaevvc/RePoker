/**
 * Файл: src/ui/screens/balatro-inferno/controllerDeps.js
 * Слой: ui (композиция зависимостей)
 *
 * Назначение:
 * - держать "дефолтные" зависимости контроллера экрана (rng/clock/storage/location)
 * - чтобы сам `useBalatroInfernoController` не импортировал инфраструктуру напрямую
 */

import { nativeRng } from '../../../infrastructure/rng/nativeRng'
import { browserClock } from '../../../infrastructure/clock/browserClock'

/** @type {null | { rng: any, clock: any, storage: any, location: any }} */
let cached = null

export function getDefaultBalatroInfernoDeps() {
  if (cached) return cached

  let storage = null
  let location = null
  try {
    storage = globalThis?.localStorage ?? null
  } catch {
    storage = null
  }
  try {
    location = globalThis?.location ?? null
  } catch {
    location = null
  }

  cached = {
    rng: nativeRng,
    clock: browserClock,
    storage,
    location,
  }

  return cached
}


