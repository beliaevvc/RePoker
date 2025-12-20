# System Patterns — RePoker

## Высокоуровневая архитектура
- **Single-screen app**: `App` рендерит один основной экран игры.
- **Clean Architecture (слои)**:
  - `src/domain/**` — доменные сущности/правила (чистые функции).
  - `src/application/**` — use-cases (сценарии) и модель состояния игры.
  - `src/infrastructure/**` — адаптеры к окружению (RNG/Clock).
  - `src/ui/**` — React UI (экран/компоненты/контроллер).

## Паттерны состояния
- UI использует контроллер‑хук `useBalatroInfernoController()` как “тонкий контроллер”:
  - держит локальное UI‑состояние (фазы, анимации, shake и т.п.)
  - вызывает `application` use‑cases для чистых переходов модели
- Основные фазы игры: `gameState: 'idle' | 'dealing' | 'suspense' | 'result'`.

## Генерация данных
- `domain/deck/createDeck(rng)` создаёт колоду 52 карты + 1 джокер, иногда добавляет ещё джокеры по редкому random-roll (“chaos mode”).
- Случайность инвертирована через порт `domain/ports/rng.ts`, прод‑реализация: `infrastructure/rng/nativeRng`.

## Оценка комбинаций
- `getBestHand(cards)`:
  - без джокеров — `evaluateStandard`
  - с 1–2 джокерами — брутфорс перебор подстановок (до 2704 комбинаций), выбирается лучший `score`
  - отдельные быстрые ветки для 3/4/5 джокеров

## UI/стили
- Tailwind utility-классы в JSX + кастомные анимации/эффекты в `src/balatroInferno.css`.
- Экран декомпозирован:
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx` (композиция)
  - `src/ui/screens/balatro-inferno/components/*` (визуальные компоненты)
- Responsive‑паттерн: `grid`/`clamp(...)` для предсказуемого поведения при ресайзе (в т.ч. маленькие экраны).

## Дебаг/чест-кнопки
- Внизу UI есть скрытые/полупрозрачные кнопки `3J/4J/5J`, вызывающие `forceHand()` для теста спец-комбинаций.
