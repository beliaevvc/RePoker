# Archive — 2025-12-23: Мастер‑план рефакторинга (Clean Architecture)

## Summary

Задача: провести полный рефакторинг проекта RePoker к Clean Architecture с поэтапной миграцией на TypeScript, разделением на слои (domain/application/infrastructure/ui), внедрением DI и тестированием.

Итог: рефакторинг завершён успешно. Проект приведён к чистой слоистой архитектуре с соблюдением всех принципов Clean Architecture. Все 8 этапов выполнены, поведение сохранено 1:1. Домен и application мигрированы на TypeScript, UI остался на JavaScript по прагматичным соображениям. Написаны детерминированные тесты для критичной логики. Документация создана и актуальна.

## Requirements

- **Clean Architecture**: привести проект к максимально "чистой" слоистой архитектуре:
  - `domain` (бизнес‑правила/модели/чистые функции)
  - `application` (use-cases / сценарии, orchestration)
  - `infrastructure` (порты/адаптеры: RNG, таймеры, storage, внешние libs)
  - `ui` (React-компоненты, state orchestration, визуал)
- **Ограничение**: поведение 1:1 (включая "chaos" вероятность доп. джокеров и debug-кнопки `3J/4J/5J`)
- **Бесшовность**: после каждого этапа проект собирается и работает
- **TypeScript**: поэтапная миграция (сначала domain и application, затем infrastructure, UI по желанию)
- **DI/порты‑адаптеры**: без DI‑контейнера, явная передача зависимостей
- **Тесты**: Vitest, минимум unit-тесты на domain
- **Документация**: шапки файлов + JSDoc на русском, финальная документация в `Docs/`

## Implementation

### Этап 1 — Базовая стабилизация и "контроль поведения"
- Добавлены developer notes в `memory-bank/refactor-plan.md`
- Добавлен скрипт `test` в `package.json`
- Добавлены русские шапки/комментарии в ключевых файлах

### Этап 2 — Введение TypeScript + настройка тестов (Vitest)
- Добавлен TypeScript: `typescript`, `tsconfig.json` с `isolatedModules: true`, `moduleResolution: "bundler"`
- Настроен Vitest и интегрирован в `package.json`
- Конфигурация позволяет смешанный JS/TS для поэтапной миграции

### Этап 3 — Вынос `domain`: карты/колода/оценка комбинаций
- Созданы типы в `src/domain/cards/types.ts` и `src/domain/cards/constants.ts`
- Оценка комбинаций вынесена в `src/domain/hand-evaluator/`:
  - `getBestHand.ts` — основная функция оценки
  - `constants.ts` — `HAND_MULTIPLIERS`, `HAND_TIERS`
- Колода создаётся через `src/domain/deck/createDeck.ts`
- Написаны тесты: `getBestHand.test.ts`, `createDeck.test.ts`

### Этап 4 — `application`: use-cases и сценарии игры
- Use-cases созданы в `src/application/game/usecases/`:
  - `startDeal.ts` — начало раздачи
  - `adjustBet.ts` — изменение ставки
  - `resolveResult.ts` — разрешение результата
  - `applyCascadeStep.ts` — применение шага каскада
  - `buildCascadeSequence.ts` — построение последовательности каскада
  - `forceHand.ts` — debug-функция для принудительной руки
- Типы состояния в `src/application/game/types.ts`:
  - `GameState`, `GameMode`, `GameModel`
- Порты определены в `src/domain/ports/rng.ts`
- Написаны тесты: `usecases.test.ts`

### Этап 5 — `infrastructure`: адаптеры RNG/Clock
- `src/infrastructure/rng/`:
  - `nativeRng.ts` — прод-адаптер (`Math.random`)
  - `seededRng.ts` — тестовый адаптер (детерминированный)
- `src/infrastructure/clock/`:
  - `browserClock.ts` — прод-адаптер (`setTimeout/clearTimeout`)
  - `fakeClock.ts` — тестовый адаптер (с возможностью "перемотки" времени)
- Use-cases принимают зависимости через параметры
- DI композиция в `src/ui/screens/balatro-inferno/controllerDeps.js`

### Этап 6 — `ui`: декомпозиция экрана, компонентов и стилей
- Компоненты вынесены в `src/ui/screens/balatro-inferno/components/`:
  - `Card.jsx`, `MiniCard.jsx`
  - `ElectricPlasmaOrbs.jsx`
  - `AutoPlayModal.jsx`, `CascadeHistoryModal.jsx`, `PaytableModal.jsx`, `DevToolsDrawer.jsx`
  - `CascadeMultiplierIndicator.jsx`
- Контроллер выделен: `useBalatroInfernoController.js`
- DI композиция: `controllerDeps.js`
- Стили структурированы в `src/balatroInferno.css`
- Утилиты таймлайна: `scheduler.js`, `cascadeTimeline.js` (тестируемые)
- Тесты таймлайна: `cascadeTimeline.test.ts`

### Этап 7 — Мобильная адаптация (responsive / touch-first)
- Responsive паттерны реализованы через Tailwind utilities и `clamp()`
- Touch targets оптимизированы
- Производительность улучшена (memo‑разрез, коалесцирование DOM‑измерений)
- Примечание: полная мобильная оптимизация завершена в рамках отдельной задачи

### Этап 8 — Финализация: best practices, чистка, документация
- TypeScript миграция завершена для domain и application (UI остался на JS)
- ESLint настроен и работает
- Документация обновлена:
  - `Docs/architecture.md` — детальное описание слоёв и правил зависимостей
  - `Docs/game-flow.md`, `Docs/testing.md`, `Docs/performance.md`, `Docs/profiling.md`, `Docs/deploy.md`, `Docs/faq.md`, `Docs/glossary.md`
  - `memory-bank/systemPatterns.md` обновлён
  - `memory-bank/architecture-map.md` создан

## Testing

- **Vitest**: настроен и интегрирован в `package.json`
- **Тесты написаны**:
  - `src/domain/hand-evaluator/getBestHand.test.ts` — тесты оценки комбинаций
  - `src/domain/deck/createDeck.test.ts` — тесты создания колоды
  - `src/application/game/usecases/usecases.test.ts` — тесты use-cases
  - `src/infrastructure/clock/fakeClock.test.ts` — тесты fake clock
  - `src/ui/screens/balatro-inferno/cascadeTimeline.test.ts` — регресс‑тесты таймлайна
  - `src/ui/screens/balatro-inferno/testDeps.test.ts` — тесты test deps
- **Все тесты зелёные**: `npm test` проходит успешно
- **Детерминированные тесты**: использование `seededRng` и `fakeClock` для регресс‑тестов

## Lessons learned

### Удачные решения

1. **Поэтапная миграция на TypeScript**
   - Начали с domain и application (где TS даёт максимальную пользу)
   - UI оставили на JS (прагматично для прототипа)
   - Результат: получили типизацию там, где она важна, без лишних затрат времени

2. **Явная передача зависимостей вместо DI‑контейнера**
   - Проще и понятнее для небольшого проекта
   - Легче тестировать (можно передать моки напрямую)
   - Результат: код стал чище и понятнее

3. **Вынос таймлайна в чистые функции**
   - `scheduler.js` и `cascadeTimeline.js` тестируются без React
   - Можно менять тайминги безопасно
   - Результат: более надёжный код и возможность регресс‑тестов

4. **Документация в отдельной папке `Docs/`**
   - Финальная документация отделена от процесса разработки
   - Memory Bank хранит процесс и контекст
   - Результат: документация актуальна и не смешивается с рабочими заметками

5. **Процессные инварианты в Memory Bank**
   - Правило "обновлять Docs перед REFLECT"
   - Правило "сверяться с architecture.md на PLAN/BUILD"
   - Результат: меньше архитектурных регрессий

### Сложности

1. **Каскадная логика и таймлайны**
   - Проблема: сложная оркестрация анимаций с множеством таймеров, риск гонок
   - Решение: вынос в `scheduler.js` с token‑guard и централизованным cleanup, отдельный `cascadeTimeline.js` для тестируемого таймлайна
   - Урок: сложную асинхронную логику лучше выносить в чистые функции с тестами

2. **Сохранение поведения 1:1**
   - Проблема: риск случайно изменить игровую логику при рефакторинге
   - Решение: детерминированные тесты с `seededRng` и `fakeClock`, smoke‑чеклист после каждого этапа
   - Урок: тесты критически важны для рефакторинга, особенно детерминированные

3. **Баланс между декомпозицией и производительностью**
   - Проблема: слишком мелкая декомпозиция может ухудшить производительность
   - Решение: memo‑разрез экрана, коалесцирование DOM‑измерений, профилирование
   - Урок: декомпозиция должна быть осмысленной, не ради декомпозиции

### Что можно улучшить

1. **Более раннее написание тестов**
   - Некоторые тесты писались после реализации
   - Улучшение: TDD для критичных участков (domain, use-cases)

2. **Более частые smoke‑чеклисты**
   - Smoke‑чеклист выполнялся после каждого этапа
   - Улучшение: можно было бы делать после каждого подэтапа для более быстрого обнаружения проблем

3. **Документация архитектурных решений**
   - Некоторые решения (например, почему контроллер в UI) документировались постфактум
   - Улучшение: документировать архитектурные решения сразу при принятии

## Метрики успеха

- ✅ Все 8 этапов выполнены
- ✅ Поведение сохранено 1:1 (smoke‑чеклист проходит)
- ✅ Тесты написаны и зелёные (`npm test`)
- ✅ Проект собирается (`npm run build`)
- ✅ Линтер проходит (`npm run lint`)
- ✅ Документация создана и актуальна
- ✅ Clean Architecture реализована с соблюдением границ слоёв

## References

- Рефлексия: `memory-bank/reflection/reflection-2025-12-23-refactor-plan.md`
- План рефакторинга: `memory-bank/archive/archive-2025-12-23-refactor-plan.md` (исходный план)
- Архитектурная документация: `Docs/architecture.md`
- Архитектурная карта: `memory-bank/architecture-map.md`
- Системные паттерны: `memory-bank/systemPatterns.md`
- Ключевые участки кода:
  - `src/domain/` — доменная логика
  - `src/application/game/usecases/` — use-cases
  - `src/infrastructure/` — адаптеры
  - `src/ui/screens/balatro-inferno/` — UI и контроллер
  - `src/ui/screens/balatro-inferno/scheduler.js` — scheduler
  - `src/ui/screens/balatro-inferno/cascadeTimeline.js` — таймлайн каскада
