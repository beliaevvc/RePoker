# Прогресс

## Статус
- В работе: Turbo-кнопка (ускорение темповых анимаций/таймингов без ускорения декоративных shake/ореолов).
- Сделано (Turbo): добавлен `turboEnabled` в `useBalatroInfernoController`, ускорены JS-тайминги раздачи/suspense/каскада через масштабирование задержек.
- Сделано (Turbo UI): добавлена кнопка `TURBO` в верхней панели `BalatroInferno`, toggle ON/OFF, disabled во время `isBusy`, без сохранения в `localStorage`.
- Сделано (Turbo CSS): добавлен класс `.repoker-turbo` с `--repoker-time-factor: 0.5`; ускорены `animate-cascade-vanish/appear/refill-flash` и `animate-cascade-mult-pop`; ускорены `transitionDelay/Duration` карт через CSS‑переменную.
- QA: `npm run test` — ✅ (24/24). `npm run lint` — ✅. `npm run build` — ✅.
- Примечание: test/lint в sandbox падали с `EPERM` (чтение/kill воркеров), поэтому прогон делался вне sandbox.
- Дальше: `/reflect`.
- Сделано: UI — `JACKPOT SIM (QA)` перенесена вправо от кнопки PLAY и сделана еле заметной.
- Гейты: `npm run lint`, `npm run build` — пройдены.
- В работе: множитель каскада (1×→2×→3×→5×) + UI-индикатор, замена streak в CASCADE.
- Сделано (механика): добавлен `getCascadeMultiplierForWinStep` + unit-тесты; `applyCascadeStepUseCase` принимает `winStepNumber` и считает `winAmount = baseWinAmount * cascadeMultiplier`, джекпот не множится.
- Сделано (интеграция): `useBalatroInfernoController` передаёт `winStepNumber = cascadeStepIndex+1`, копит totalWin с учётом множителя и **не меняет streak** в CASCADE; добавлены состояния `cascadeWinStepNumber/cascadeMultiplier`.
- Сделано (UI): добавлен `CascadeMultiplierIndicator` (в CASCADE вместо `ElectricPlasmaOrbs`) + строка `CASCADE MULT xN` в step win-баннере.
- Сделано (UI): в финальный баннер `TOTAL WIN` добавлена строка `MAX MULT xN` (максимальный достигнутый множитель по win-шагам каскада).
- Гейты (после множителя каскада): `npm run test`, `npm run lint`, `npm run build` — пройдены.
- Сделано: переделаны ставки **Ante** — введён фиксированный список (0.20…100), дефолт **1.00**, кнопки `+/-` переключают по списку, суммы в UI отображаются с 2 знаками после запятой.
- Гейты (после Ante): `npm run test`, `npm run lint`, `npm run build` — пройдены.
- В работе: обновление выплат за комбинации.
- Сделано: обновлена доменная таблица выплат (`HAND_MULTIPLIERS`) под новую спецификацию (Pair=0.3x, Two Pair=1x, ...), удалены `3/4/5 Jokers` и `Five of a Kind`.
- Сделано: `getBestHand` больше не возвращает удалённые комбинации; добавлен guard на `jokerCount > 2`.
- Сделано: debug форс руки теперь поддерживает только 1–2 джокера (UI + `forceHandUseCase`).
- Сделано: добавлена нормализация денег в application use-cases (чтобы не было `3.5999999999999996` при 0.3×bet).
- Сделано: UI-константы/эффекты очищены от упоминаний `3/4/5 Jokers` и tier=7.
- Гейты пройдены: `npm run test`, `npm run lint`, `npm run build` — зелёные.
- Завершено: режим **каскада** + переключение режимов (normal/cascade) + визуальный таймлайн, гейты зелёные.
- Завершено: каскад **без автопополнения колоды** — при нехватке добора недостающие позиции становятся `null`, каскад завершается после шага.
- Завершено: добавлен **джекпот 150 000× bet**, если после win-шага каскада стол полностью пуст и колода пуста (начисляется сверху).
- Завершено: добавлена QA-фича **JACKPOT SIM** (кнопка в CASCADE), запускающая один из 5 сценариев, которые гарантированно приводят к джекпоту за несколько шагов.
- Сделано: `JACKPOT SIM (QA)` больше не занимает отдельную широкую строку — перенесена в правую колонку контролов рядом с PLAY как маленькая кнопка “JP” с низкой opacity (видна на hover).
- Завершено: UI-фикс — убран белый overlay `animate-ping ... bg-white` из баннера выигрыша (BalatroInferno).
- Завершено: финальный баннер каскада — показ “CASCADES xN” (кол-во шагов) второй строкой под TOTAL WIN.
- Завершено: UI-спейсинг — добавлен нижний отступ под панелью MODE, чтобы она не “прилипала” к блоку ANTE.
- Гейты: `npm run lint`, `npm run test`, `npm run build` — пройдены.
- Завершено: багфикс — при 1 джокере и комбинации **Pair** выбирается пара со **старшей** картой (добавлен тай-брейк внутри категории при брутфорсе джокера).
- Гейты (после фикса джокера): `npm run test`, `npm run lint`, `npm run build` — пройдены.
- Завершено: основная колода обновлена до **52 + 2 джокера = 54** (единый источник истины через `createBaseDeck`).
- Завершено: **JACKPOT SIM** переведён на использование основной колоды (убран отдельный debug-состав на 57/5 джокеров).
- Гейты (после обновления колоды): `npm run test`, `npm run lint`, `npm run build` — пройдены.

## Архив
- `memory-bank/archive/archive-2025-12-20-cascade-mode.md`
- `memory-bank/archive/archive-2025-12-20-ui-overlays.md`
- `memory-bank/archive/archive-2025-12-20-cascade-final-banner-steps.md`
- `memory-bank/archive/archive-2025-12-20-mode-spacing.md`
- `memory-bank/archive/archive-2025-12-20-joker-pair-highest.md`
- `memory-bank/archive/archive-2025-12-20-cascade-deck-exhaust-jackpot-cinematic.md`
- `memory-bank/archive/archive-2025-12-21-deck-54-two-jokers-jackpot-sim.md`
- `memory-bank/archive/archive-2025-12-21-payouts-rework.md`
- `memory-bank/archive/archive-2025-12-21-ante-bets.md`
- `memory-bank/archive/archive-2025-12-21-cascade-multiplier.md`
- `memory-bank/archive/archive-2025-12-21-jackpot-sim-button.md`
- `memory-bank/archive/archive-2025-12-21-turbo-button.md`

## Сделано
- Добавлены Cursor-команды Memory Bank в `/.cursor/commands/`.
- Создана структура `memory-bank/` (core файлы + папки `creative/`, `reflection/`, `archive/`).
- Этап 1: добавлены шапка файла и JSDoc (RU) в `src/BalatroInferno.jsx` без изменения логики.
- Этап 1 гейты: `npm run lint` и `npm run build` — пройдены.
- Этап 2: добавлен каркас TypeScript (`tsconfig.json`, `src/vite-env.d.ts`).
- Этап 2: подключён Vitest (скрипты `npm run test`, конфиг `test` в `vite.config.js`).
- Этап 2 гейты: `npm run lint`, `npm run build`, `npm run test` — пройдены.
- Этап 3: вынесен domain в `src/domain/**` (типы/константы, `createDeck`, `getBestHand`, таблицы коэффициентов).
- Этап 3: `BalatroInferno.jsx` переведён на импорты из domain (поведение 1:1).
- Этап 3: добавлены unit‑тесты Vitest для `getBestHand` (включая джокеров).
- Этап 3 гейты: `npm run lint`, `npm run build`, `npm run test` — пройдены.
- Этап 4: добавлен application слой `src/application/game/**` (use-cases: startDeal/adjustBet/resolveResult/forceHand).
- Этап 4: UI использует use-cases (поведение 1:1).
- Этап 4: добавлены unit‑тесты Vitest для use-cases.
- Этап 4 гейты: `npm run lint`, `npm run build`, `npm run test` — пройдены.
- Этап 5: добавлен порт RNG в domain (`src/domain/ports/rng.ts`) и адаптеры в infrastructure (`nativeRng`, `createSeededRng`).
- Этап 5: `createDeck` теперь принимает RNG и не использует `Math.random()` напрямую.
- Этап 5: UI таймеры используют `browserClock` вместо “голых” `setTimeout/clearTimeout`.
- Этап 5: добавлены детерминированные тесты для `createDeck` (chaos ветки).
- Этап 5 гейты: `npm run lint`, `npm run build`, `npm run test` — пройдены.
- Этап 6: UI вынесен в `src/ui/screens/balatro-inferno/` (экран + контроллер-хук).
- Этап 6: декомпозированы компоненты: `Card` и `ElectricPlasmaOrbs` вынесены в `src/ui/screens/balatro-inferno/components/`.
- Этап 6: `src/BalatroInferno.jsx` стал тонким ре-экспортом для совместимости.
- Этап 6 гейты: `npm run lint`, `npm run build`, `npm run test` — пройдены.
- Этап 7: mobile-first правки экрана (svh, safe-area, предотвращение переполнений, touch targets).
- Этап 7: адаптирована типографика/трекинг и размеры карт для узких экранов.
- Этап 7 гейты: `npm run lint`, `npm run build`, `npm run test` — пройдены.
- Этап 7 (доработка): улучшен responsive при любом ресайзе (clamp-типографика, `grid` для 5 карт и сетка контролов вместо хрупких `flex`).

- Добавлен базовый `GameMode` (normal/cascade) и сохранение выбора в `localStorage` (пока без изменения игровой логики).
- В UI добавлен минимальный переключатель режима (disabled во время раздачи/саспенса).
- Реализован application use-case `buildCascadeSequenceUseCase` + unit-тесты (0/1/2 шага, замена только `winningIndices`, `refillDeck`).
- Интегрирован каскад в `useBalatroInfernoController`: пошаговая подсветка и замена выигрышных карт, суммирование выигрышей и начисление **одним платежом** в конце, streak **+1 за спин** при наличии win.
- Добавлен HUD каскада (step/total) и отключение действий во время каскада (PLAY/режим).
- Гейты пройдены: `npm run test`, `npm run lint`, `npm run build`.
- Улучшен визуальный таймлайн каскада: баннер шага показывается и скрывается отдельно, затем выигрышные карты красиво исчезают, после чего новые карты заметно “падают” на их место по одной.
- UI: убран белый пульсирующий слой `absolute inset-0 ... animate-ping ... bg-white` под баннером выигрыша/каскада.
- Гейты (после UI-фикса): `npm run test`, `npm run lint`, `npm run build` — пройдены.
- UI: полностью убран HUD каскада “STEPS · TOTAL …”.
- Гейты (после удаления HUD): `npm run test`, `npm run lint`, `npm run build` — пройдены.

## Дальше
- Дальше: `/van` для следующей задачи.

## Наблюдения
- UI экран вынесен в `src/ui/screens/balatro-inferno/`, доменная логика и use‑cases отделены и покрыты unit‑тестами.
- Для рук с джокером, где возможны несколько вариантов одной и той же категории (например, “две пары + джокер” ⇒ Full House), нужен стабильный тай‑брейк по “силе внутри категории” (уже добавлен через `score`), а **на будущее** может пригодиться явное хранение того, какую именно карту “представляет” джокер в лучшем результате (для UI/анимаций/подсветок).
