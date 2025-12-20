# Прогресс

## Статус
- В процессе: подготовка мастер‑плана рефакторинга под Clean Architecture (бесшовно, 1:1 поведение).

## Сделано
- Добавлены Cursor-команды Memory Bank в `/.cursor/commands/`.
- Создана структура `memory-bank/` (core файлы + папки `creative/`, `reflection/`, `archive/`).

## Дальше
- Утвердить мастер‑план: `memory-bank/refactor-plan.md`.
- После утверждения начать реализацию этапа 1 через `/build`.

## Наблюдения
- Основной код игры находится в `src/BalatroInferno.jsx`: там и состояние (balance/bet/streak/hand/gameState) и оценка комбинаций (включая джокеров) и большая часть UI.
