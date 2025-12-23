import { describe, expect, it } from 'vitest'
import { createSeededRng } from '../../../infrastructure/rng/seededRng'
import { createDeck } from '../../../domain/deck/createDeck'
import { startDealUseCase } from '../../../application/game/usecases/startDeal'
import { createTestBalatroInfernoDeps } from './testDeps'

describe('testDeps', () => {
  it('seeded rng produces deterministic sequence', () => {
    const a = createSeededRng(42)
    const b = createSeededRng(42)
    const seqA = Array.from({ length: 20 }, () => a.randomFloat())
    const seqB = Array.from({ length: 20 }, () => b.randomFloat())
    expect(seqA).toEqual(seqB)
  })

  it('startDeal is deterministic with seeded rng (same seed => same deck)', () => {
    const deps1 = createTestBalatroInfernoDeps(123)
    const deps2 = createTestBalatroInfernoDeps(123)

    const r1 = startDealUseCase({ balance: 100, bet: 1 }, { rng: deps1.rng })
    const r2 = startDealUseCase({ balance: 100, bet: 1 }, { rng: deps2.rng })

    expect(r1).not.toBeNull()
    expect(r2).not.toBeNull()
    expect(r1!.deck.map((c) => `${c.suit}:${c.rank}:${c.id}`)).toEqual(r2!.deck.map((c) => `${c.suit}:${c.rank}:${c.id}`))
  })

  it('createDeck is deterministic within runtime for a given seed', () => {
    const rng1 = createSeededRng(999)
    const rng2 = createSeededRng(999)
    const d1 = createDeck(rng1)
    const d2 = createDeck(rng2)
    expect(d1.map((c) => `${c.suit}:${c.rank}:${c.id}`)).toEqual(d2.map((c) => `${c.suit}:${c.rank}:${c.id}`))
  })
})


