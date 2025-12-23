# FAQ / Troubleshooting

## Preview не открывается на `localhost`, а на `127.0.0.1` работает

Симптом: `http://localhost:<port>/` даёт ошибку, а `http://127.0.0.1:<port>/` открывается.

Причина: `localhost` может резолвиться в IPv6 `::1`, а preview поднят на IPv4.

Решение:

```bash
npm run preview -- --host 127.0.0.1
```

Открывать: `http://127.0.0.1:<port>/`.

## После изменений “ничего не поменялось” в preview

Симптом: в dev всё ок, но в preview старое поведение/ассеты.

Причина: `vite preview` показывает **то, что лежит в `dist/`**.

Решение:

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

## Медленная загрузка шрифта / FOIT/FOUT

Симптом: текст “перепрыгивает” или долго грузится.

Проверка:

- Chrome DevTools → Network → фильтр “font”
- Performance trace → посмотри LCP и время до загрузки шрифтов.

Решения по степени радикальности:

- держать текущий `<link rel="stylesheet">` в `index.html` (самый простой вариант)
- локализовать шрифт в `public/` (полный контроль/оффлайн)

## Вылезают запросы на внешние текстуры

Симптом: Network показывает `transparenttextures.com` или похожие домены.

Ожидаемое состояние: **все текстуры локальные** и лежат в `public/textures/*` с путём `/textures/...`.

Что проверить:

- `public/textures/*` есть в репозитории/деплое
- в UI используются пути вида `bg-[url('/textures/noise.svg')]`
- после правки не забыли `npm run build` перед preview

## Телефон греется / просадки во время каскадов

Реальность: iPhone может троттлить при тяжёлых эффектах (blur/filter/оверлеи), особенно в долгих сессиях и на зарядке.

Как диагностировать:

- сравнить `AUTO 25` с Turbo и без
- в Safari (iPhone) субъективно: “плавность” + “нагрев” + “время до троттлинга”

Что делать:

- сначала профилирование по `Docs/profiling.md`
- оптимизации — по `Docs/performance.md`

## Как воспроизвести джекпот быстро (QA)

В UI есть сценарий симуляции джекпота (под капотом `buildJackpotSimulationScenario`).

Идея сценария:

- колода почти исчерпана (`dealIndex = deck.length - 2`)
- 2 win‑шага: Pair → Flush → deck shortage → `null×5` → джекпот

Если нужно стабильно проверить:

- запусти симуляцию
- убедись, что режим CASCADE активен
- дождись MAX WIN оверлея

## Где менять выплаты / множители

- Базовые множители комбинаций: доменный evaluator (`src/domain/hand-evaluator/*`)
- Множитель каскада по номеру win‑шага: `src/application/game/cascadeMultiplier.ts`
- Джекпот: `JACKPOT_MULTIPLIER = 150_000` в `src/application/game/usecases/applyCascadeStep.ts`

## Как добавить новую ставку (ANTE)

Список ставок: `src/application/game/constants/ante.ts` (`ANTE_VALUES`).

Важно:

- `adjustBetUseCase` ходит по списку и дополнительно ограничивает ставку по балансу.
- UI ожидает, что ставки не “прыгают” хаотично — лучше держать список отсортированным.

## Vitest падает в sandbox (EPERM)

В некоторых окружениях “песочницы” `vitest` может падать на остановке воркеров.

Решение:

```bash
npm test -- --pool=threads --maxWorkers=1 --minWorkers=1 --no-file-parallelism
```


