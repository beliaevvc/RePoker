# Архитектура (Clean Architecture — прагматично)

## TL;DR

- **UI** (`src/ui/**`): React‑экран, UI‑компоненты, контроллер‑хук (оркестрация состояния/таймеров).
- **Application** (`src/application/**`): use‑cases игры (сценарии переходов состояния).
- **Domain** (`src/domain/**`): чистая доменная логика (карты/колода/оценка руки) + порты (`src/domain/ports/**`).
- **Infrastructure** (`src/infrastructure/**`): реализации портов (RNG/clock) и тестовые адаптеры.

## Диаграмма зависимостей (упрощённо)

```
UI  ──────► Application ──────► Domain
│                │               ▲
│                └───────────────┘ (Domain types/logic)
│
└────► Infrastructure (только через DI-композицию в UI)
            ▲
            └──── implements ports (Domain)
```

## Структура проекта (важные точки входа)

- **App entry**: `src/main.jsx` → `src/App.jsx`
- **Экран игры**: `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
- **Контроллер экрана**: `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`
- **UI‑композиция зависимостей (DI)**: `src/ui/screens/balatro-inferno/controllerDeps.js`

## Карта директорий (подробно)

### `src/domain/`

Доменная логика без React/DOM/таймеров:

- `cards/` — типы и константы карт
- `deck/` — создание колоды (в т.ч. базовая колода + джокеры)
- `hand-evaluator/` — оценка руки (`getBestHand`)
- `ports/` — интерфейсы внешних зависимостей (например RNG)

### `src/application/`

Use‑cases и правила игры:

- `game/usecases/*` — сценарии (startDeal/resolveResult/applyCascadeStep/adjustBet/…)
- `game/constants/*` — константы (например список ante)
- `game/debug/*` — debug/QA сценарии (например jackpotSimulation)
- `game/types.ts` — типы модели

### `src/infrastructure/`

Адаптеры к среде исполнения:

- `rng/` — `nativeRng` (боевой), `seededRng` (детерминированный)
- `clock/` — `browserClock` (боевой), `fakeClock` (для тестов)

### `src/ui/`

React UI:

- `screens/balatro-inferno/` — экран и всё рядом
  - `BalatroInferno.jsx` — React‑экран/разметка
  - `useBalatroInfernoController.js` — оркестрация состояния, таймеров, вызовов use‑cases
  - `components/*` — UI‑компоненты
  - `controllerDeps.js` — сборка дефолтных зависимостей (DI)
  - `scheduler.js` / `cascadeTimeline.js` — утилиты таймеров/таймлайна (тестируемые)
  - `testDeps.ts` — test deps для детерминизма

## Правила зависимостей (что можно импортировать)

- **UI → Application / Domain** ✅
- **UI → Infrastructure**: только через **DI‑композицию** (`controllerDeps.js`) ✅
- **Application → Domain** ✅
- **Domain → ничего “наружу”** (кроме собственных типов/портов) ✅
- **Infrastructure → Domain** (реализует порты) ✅

### Быстрый чеклист “куда класть код”

- **Новая комбинация/оценка руки** → `src/domain/hand-evaluator/`
- **Новое правило выплат/множителей/джекпота** → `src/application/game/*`
- **Новый сценарий/оркестрация шага игры** → `src/application/game/usecases/*`
- **Новая зависимость на окружение (таймеры/случайность/хранилище)**:
  - порт → `src/domain/ports/*`
  - реализация → `src/infrastructure/*`
  - подключение в UI → `controllerDeps.js` + прокидывание через `deps`
- **Новая кнопка/модалка/оверлей** → `src/ui/screens/balatro-inferno/components/*`

## Почему контроллер живёт в UI

`useBalatroInfernoController.js` — это “оркестратор” экрана: он держит state, таймлайн анимаций (через `deps.clock`), вызывает use‑cases.  
Это прагматичный компромисс для прототипа: доменную и use‑case логику мы держим чистой, а “склейку” (React state + таймеры) — в UI.

### Что НЕ должно попадать в контроллер

- DOM‑измерения/стили (`getBoundingClientRect`, `getComputedStyle`, `ResizeObserver`) — это задача UI‑компонентов.
- “Бизнес‑правила” выплат — это application/domain.
- Прямые импорты инфраструктуры — только через `deps` (DI).

## DI (Dependency Injection) в контроллере

Контроллер принимает `deps`, чтобы не импортировать инфраструктуру напрямую:

- `deps.rng` (реализация порта RNG)
- `deps.clock` (таймеры)
- `deps.storage` / `deps.location` (браузерные зависимости для флагов/devtools)

Дефолты собираются в `controllerDeps.js`.

### Пример: как добавлять новую зависимость (шаблон)

1) Определи порт (если это domain‑значимая зависимость).
2) Реализуй адаптер в `src/infrastructure/*`.
3) Добавь в `controllerDeps.js` дефолтную реализацию.
4) Прокинь через `deps` и используй в контроллере.
5) Для тестов: добавь заглушку в `testDeps.ts`.

## Тестируемость

Для детерминированных тестов есть:

- `src/infrastructure/clock/fakeClock.ts`
- `src/infrastructure/rng/seededRng.ts`
- `src/ui/screens/balatro-inferno/testDeps.ts` (комбинирует seeded RNG + fake clock + in-memory storage/location)

## Замечания по перфомансу (границы)

- Любые **DOM‑измерения** (overflow, layout) — держать в UI‑компонентах и коалесцировать (например через `requestAnimationFrame`).
- Тяжёлые UI‑поддеревья должны быть **изолированы** (мемоизация, стабильные пропсы), чтобы каскадные таймеры не “тянули” весь экран в ререндер.

## Ссылки

- Рабочая карта слоёв (в процессе аудита): `memory-bank/architecture-map.md`
- Профилирование: `Docs/profiling.md`
- Флоу каскада: `Docs/game-flow.md`


