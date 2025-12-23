import { describe, expect, it, vi } from 'vitest'
import { createFakeClock } from './fakeClock'

describe('fakeClock', () => {
  it('executes timeouts only after advancing time', () => {
    const clock = createFakeClock(1000)
    const calls: string[] = []

    clock.setTimeout(() => calls.push('a'), 10)
    clock.setTimeout(() => calls.push('b'), 0)

    expect(calls).toEqual([])

    clock.advanceBy(0)
    expect(calls).toEqual(['b'])

    clock.advanceBy(9)
    expect(calls).toEqual(['b'])

    clock.advanceBy(1)
    expect(calls).toEqual(['b', 'a'])
  })

  it('clearTimeout cancels scheduled task', () => {
    const clock = createFakeClock()
    const spy = vi.fn()
    const id = clock.setTimeout(spy, 5)
    clock.clearTimeout(id)
    clock.advanceBy(10)
    expect(spy).toHaveBeenCalledTimes(0)
  })

  it('runAll executes tasks in dueTime order', () => {
    const clock = createFakeClock()
    const calls: number[] = []
    clock.setTimeout(() => calls.push(2), 20)
    clock.setTimeout(() => calls.push(1), 10)
    clock.setTimeout(() => calls.push(0), 0)
    clock.runAll()
    expect(calls).toEqual([0, 1, 2])
    expect(clock.pendingCount()).toBe(0)
  })
})


