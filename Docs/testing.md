# Тестирование и детерминизм

## Команды

```bash
npm run test
```

Watch:

```bash
npm run test:watch
```

ESLint:

```bash
npm run lint
```

## Что покрыто тестами

- `src/domain/**`: колода, оценка комбинаций.
- `src/application/**`: use‑cases игры.
- `src/infrastructure/clock/fakeClock.ts`: детерминированные таймеры.
- `src/ui/screens/balatro-inferno/cascadeTimeline.js`: таймлайн refill (тест на fakeClock).

## Детерминированные зависимости для контроллера (DI)

Контроллер `useBalatroInfernoController(deps)` принимает зависимости:

- `rng`: можно подменить на seeded RNG
- `clock`: можно подменить на fake clock
- `storage/location`: in-memory заглушки для тестов

Готовая сборка test deps: `src/ui/screens/balatro-inferno/testDeps.ts`

- `createTestBalatroInfernoDeps(seed, startMs)`

## Fake clock (как работает)

`createFakeClock(startMs)` поддерживает:

- `setTimeout(fn, ms)`
- `clearTimeout(handle)`
- `advanceBy(ms)`
- `runAll(maxSteps?)`
- `pendingCount()`

Это позволяет гонять таймлайны каскада без реального времени.

## Важно про окружение (Cursor sandbox)

В песочнице иногда встречается `EPERM` на остановке воркеров `vitest`.

Рабочий “безболезненный” запуск одним воркером:

```bash
npm test -- --pool=threads --maxWorkers=1 --minWorkers=1 --no-file-parallelism
```


