# RePoker — Balatro Inferno (React + Vite)

Небольшая “покерная” мини‑игра/прототип с акцентом на эффектный UI и джокеров (включая редкий “chaos mode” с дополнительными джокерами и debug‑кнопки `3J/4J/5J`).

## Быстрый старт

Требования: Node.js + npm.

```bash
npm install
npm run dev
```

Открой `http://localhost:5173`.

## Команды

- **`npm run dev`**: дев‑сервер (HMR)
- **`npm run build`**: production‑сборка
- **`npm run preview`**: превью production‑сборки
- **`npm run lint`**: ESLint
- **`npm run test`**: unit‑тесты (Vitest)
- **`npm run test:watch`**: Vitest в watch‑режиме

## Архитектура (Clean Architecture, максимум)

Код разделён на слои:

- **`src/domain/`**: чистая доменная логика (карты, колода, оценка комбинаций).
- **`src/application/`**: use‑cases (сценарии игры: раздача, ставка, расчет результата, debug‑хэнд).
- **`src/infrastructure/`**: адаптеры к окружению (RNG, таймеры/clock).
- **`src/ui/`**: React UI (экран, компоненты, контроллер‑хук).

Точка входа экрана:
- `src/App.jsx` → `src/ui/screens/balatro-inferno/BalatroInferno.jsx` — основной UI‑экран.

## Тестирование

Vitest покрывает:
- `src/domain/**` (оценка комбинаций, колода, джокеры/chaos ветки)
- `src/application/**` (use‑cases)

Запуск:

```bash
npm run test
```

## Важные инварианты проекта

- **Поведение 1:1**: рефакторинг не должен ломать логику.
- **Редкости/хаос**: вероятность дополнительных джокеров сохранена.
- **Debug‑кнопки**: `3J/4J/5J` остаются (для проверки редких комбинаций).

## Документация по процессу

- Документация проекта (архитектура/перфоманс/профилирование/флоу): `Docs/README.md`
- Мастер‑план рефакторинга: `memory-bank/refactor-plan.md`
- Текущий прогресс: `memory-bank/progress.md`
