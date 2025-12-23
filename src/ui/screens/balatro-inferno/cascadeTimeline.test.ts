import { describe, expect, it } from 'vitest'

import { createFakeClock } from '../../../infrastructure/clock/fakeClock'
import { createScheduler } from './scheduler'
import { scheduleCardRefillTimeline } from './cascadeTimeline'

describe('cascadeTimeline (refill)', () => {
  it('schedules appear/appearEnd and flash timings deterministically (fakeClock)', () => {
    const clock = createFakeClock(0)
    const tokenRef = { current: 1 }
    const scheduler = createScheduler({
      clock,
      tokenRef,
      token: 1,
      scaleMs: (ms) => ms,
    })

    const events: Array<{ type: string; idx?: number; t: number }> = []

    const refill = scheduleCardRefillTimeline({
      schedule: scheduler.schedule,
      winningIndices: [3, 1, 4],
      onAppear: (idx) => events.push({ type: 'appear', idx, t: clock.now() }),
      onAppearEnd: (idx) => events.push({ type: 'appearEnd', idx, t: clock.now() }),
      onFlashOn: () => events.push({ type: 'flashOn', t: clock.now() }),
      onFlashOff: () => events.push({ type: 'flashOff', t: clock.now() }),
    })

    expect(refill.sortedIdx).toEqual([1, 3, 4])
    expect(refill.commitAt).toBe(1480)
    expect(refill.flashOnAt).toBe(1520)
    expect(refill.flashOffAt).toBe(1700)
    expect(refill.endAt).toBe(1960)

    clock.runAll()

    expect(events).toEqual([
      { type: 'appear', idx: 1, t: 1080 },
      { type: 'appear', idx: 3, t: 1200 },
      { type: 'appear', idx: 4, t: 1320 },

      { type: 'appearEnd', idx: 1, t: 1340 },
      { type: 'appearEnd', idx: 3, t: 1460 },

      { type: 'flashOn', t: 1520 },

      { type: 'appearEnd', idx: 4, t: 1580 },
      { type: 'flashOff', t: 1700 },
    ])
  })

  it('clearAll cancels scheduled tasks', () => {
    const clock = createFakeClock(0)
    const tokenRef = { current: 1 }
    const scheduler = createScheduler({
      clock,
      tokenRef,
      token: 1,
      scaleMs: (ms) => ms,
    })

    const events: Array<{ type: string; t: number }> = []

    scheduleCardRefillTimeline({
      schedule: scheduler.schedule,
      winningIndices: [0, 2],
      onAppear: () => events.push({ type: 'appear', t: clock.now() }),
      onAppearEnd: () => events.push({ type: 'appearEnd', t: clock.now() }),
      onFlashOn: () => events.push({ type: 'flashOn', t: clock.now() }),
      onFlashOff: () => events.push({ type: 'flashOff', t: clock.now() }),
    })

    scheduler.clearAll()
    clock.runAll()

    expect(events).toEqual([])
    expect(clock.pendingCount()).toBe(0)
  })
})


