# Прогресс

## Статус
- В процессе: Этап 8 (финализация/документация) по плану `memory-bank/refactor-plan.md`.

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

## Дальше
- Ручной smoke‑чеклист (в браузере) для подтверждения поведения 1:1.
- Далее: завершить Этап 8 (README + актуализация Memory Bank) и зафиксировать гейты `lint/build/test`.

## Наблюдения
- UI экран вынесен в `src/ui/screens/balatro-inferno/`, доменная логика и use‑cases отделены и покрыты unit‑тестами.
