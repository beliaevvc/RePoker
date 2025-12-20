# Прогресс

## Статус
- Завершено: режим **каскада** + переключение режимов (normal/cascade) + визуальный таймлайн, гейты зелёные.
- Завершено: UI-фикс — убран белый overlay `animate-ping ... bg-white` из баннера выигрыша (BalatroInferno).
- Завершено: финальный баннер каскада — показ “CASCADES xN” (кол-во шагов) второй строкой под TOTAL WIN.
- Завершено: UI-спейсинг — добавлен нижний отступ под панелью MODE, чтобы она не “прилипала” к блоку ANTE.
- Гейты: `npm run lint`, `npm run test`, `npm run build` — пройдены.
- Завершено: багфикс — при 1 джокере и комбинации **Pair** выбирается пара со **старшей** картой (добавлен тай-брейк внутри категории при брутфорсе джокера).
- Гейты (после фикса джокера): `npm run test`, `npm run lint`, `npm run build` — пройдены.

## Архив
- `memory-bank/archive/archive-2025-12-20-cascade-mode.md`
- `memory-bank/archive/archive-2025-12-20-ui-overlays.md`
- `memory-bank/archive/archive-2025-12-20-cascade-final-banner-steps.md`
- `memory-bank/archive/archive-2025-12-20-mode-spacing.md`
- `memory-bank/archive/archive-2025-12-20-joker-pair-highest.md`

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
