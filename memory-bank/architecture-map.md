## Architecture Map — RePoker (прагматичная Clean Architecture)

### Слои и ответственность
- **UI (`src/ui/**`)**
  - Рендер и интерактив: `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - Оркестрация состояния/таймеров экрана: `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`
  - Компоненты экрана: `src/ui/screens/balatro-inferno/components/*`
  - UI‑композиция зависимостей (DI): `src/ui/screens/balatro-inferno/controllerDeps.js`

- **Application (`src/application/**`)**
  - Use-cases и правила переходов состояния (без React/DOM): `src/application/game/usecases/*`
  - Типы модели игры: `src/application/game/types.ts`

- **Domain (`src/domain/**`)**
  - Чистая предметная область: карты, колода, оценка руки
  - Порты (интерфейсы): `src/domain/ports/*` (например `rng`)

- **Infrastructure (`src/infrastructure/**`)**
  - Реализации портов для браузера/платформы:
    - RNG: `src/infrastructure/rng/nativeRng.ts`, `seededRng.ts`
    - Clock: `src/infrastructure/clock/browserClock.ts`

### Допустимые зависимости (правила)
- **UI → Application / Domain / (Infrastructure только через DI-композицию)** ✅
- **Application → Domain** ✅
- **Domain → (ничего “наружу”, только типы/порты)** ✅
- **Infrastructure → Domain (реализует порты)** ✅

### Текущее состояние (что уже ок)
- `application/*` зависит только от `domain/*` (use-cases используют доменную оценку/типы).
- `ui/*` вызывает use-cases и использует доменные константы (например `RANK_NAMES`).
- Контроллер экрана получает `rng/clock/storage/location` через deps (DI), а дефолтные реализации собираются в UI‑композиции (`controllerDeps.js`).

### “Серые зоны” (сознательные исключения/точки внимания)
- **UI ↔ Browser API** (нормально для UI, но важно ограничивать):
  - `window.matchMedia`, `ResizeObserver`, `getComputedStyle`, `canvas` измерения, `requestAnimationFrame`
  - модалки: `document.body.style.overflow`, `keydown`
  - DevTools: `navigator.clipboard`, `textarea` fallback
- **UI‑контроллер как “оркестратор”**
  - В `useBalatroInfernoController.js` много таймеров/refs — это прагматично для прототипа, но потенциальный источник сложности.

### Рекомендации по улучшению (микро‑шаги)
- Держать инфраструктуру вне контроллера: новые зависимости добавлять через `deps` + `controllerDeps.js`.
- Любые тяжёлые DOM‑измерения — коалесцировать (rAF) и держать локально в UI-компонентах.
- Для детерминированных проверок каскада использовать seeded RNG + fake clock (уже добавлено).


