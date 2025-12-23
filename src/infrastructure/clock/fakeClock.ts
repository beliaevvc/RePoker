/**
 * Файл: src/infrastructure/clock/fakeClock.ts
 * Слой: infrastructure (test adapter)
 *
 * Назначение:
 * - детерминированный “ручной” clock для тестов (setTimeout/clearTimeout)
 * - позволяет воспроизводимо прогонять таймлайн каскада без реальных таймеров
 */

export type FakeTimeoutHandle = number

export type FakeClock = {
  now: () => number
  setTimeout: (fn: () => void, ms: number) => FakeTimeoutHandle
  clearTimeout: (handle: FakeTimeoutHandle) => void
  /** продвинуть время и выполнить все задачи с dueTime <= now */
  advanceBy: (ms: number) => void
  /** выполнить все задачи (в порядке dueTime; защищено от бесконечных циклов) */
  runAll: (maxSteps?: number) => void
  pendingCount: () => number
}

type Task = {
  id: FakeTimeoutHandle
  dueTime: number
  fn: () => void
  cancelled: boolean
}

export function createFakeClock(startMs = 0): FakeClock {
  let t = Math.max(0, Math.floor(startMs))
  let nextId: FakeTimeoutHandle = 1
  const tasks = new Map<FakeTimeoutHandle, Task>()

  const sortDue = (a: Task, b: Task) => (a.dueTime - b.dueTime) || (a.id - b.id)

  const flushDue = () => {
    const due = [...tasks.values()].filter((x) => !x.cancelled && x.dueTime <= t).sort(sortDue)
    for (const task of due) {
      // удаляем до выполнения — чтобы повторный clearTimeout не мешал и чтобы задачи не повторялись
      tasks.delete(task.id)
      if (task.cancelled) continue
      task.fn()
    }
  }

  return {
    now() {
      return t
    },
    setTimeout(fn, ms) {
      const delay = Math.max(0, Math.floor(Number(ms) || 0))
      const id = nextId++
      tasks.set(id, { id, dueTime: t + delay, fn, cancelled: false })
      return id
    },
    clearTimeout(handle) {
      const task = tasks.get(handle)
      if (task) {
        task.cancelled = true
        tasks.delete(handle)
      }
    },
    advanceBy(ms) {
      const delta = Math.max(0, Math.floor(Number(ms) || 0))
      t += delta
      flushDue()
    },
    runAll(maxSteps = 10_000) {
      let steps = 0
      while (steps < maxSteps) {
        const pending = [...tasks.values()].filter((x) => !x.cancelled)
        if (pending.length === 0) return
        pending.sort(sortDue)
        // прыгаем к ближайшей задаче
        const next = pending[0]!
        t = Math.max(t, next.dueTime)
        flushDue()
        steps += 1
      }
      throw new Error(`fakeClock.runAll: exceeded maxSteps=${maxSteps}`)
    },
    pendingCount() {
      return [...tasks.values()].filter((x) => !x.cancelled).length
    },
  }
}


