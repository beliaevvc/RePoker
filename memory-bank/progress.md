# Progress (Memory Bank)

## Текущий статус
- **Задача:** Баг: адаптивное сокращение баланса (CHIPS) не срабатывает при переполнении UI
- **Этап:** Реализация завершена, валидация тестов/сборки пройдена.

## Что сделано
- [x] Найдено место: плашка CHIPS в `src/ui/screens/balatro-inferno/BalatroInferno.jsx` использует `formatMoneyAdaptive(balance, ...)` + `truncate` + `title` с full.
- [x] Фикс в `src/ui/screens/balatro-inferno/moneyFormat.js`: условие длины full-строки теперь `>= maxFullLength` (раньше было `>`), чтобы “пограничные” значения тоже переходили в compact.
- [x] Усиление UX: в `BalatroInferno.jsx` добавлен реальный overflow-check (через `ResizeObserver` + измерение ширины строки через `canvas.measureText`). Если full физически не помещается, CHIPS форсится в compact.
- [x] Фикс артефакта: убраны любые скрытые DOM-ноды рядом с CHIPS-текстом (измерение делается без DOM), чтобы не провоцировать “тонкие белые полосы” на перерисовке.
- [x] Доп. фикс артефакта (сокращения): для compact-значений CHIPS убран `truncate/overflow-hidden`, чтобы не было клиппинга текста на skew/CRT слоях.
- [x] Фикс артефакта (CRT): значения CHIPS/ANTE подняты выше `.crt-overlay` (z=100), чтобы scanlines/RGB overlay не давали “тонкие белые полосы” на ярком пиксельном тексте.
- [x] Фикс артефакта (repaint): добавлены `transform-gpu` + `will-change-transform` на текст CHIPS/ANTE для стабилизации перерисовки при смене значения (особенно в compact-формате).
- [x] `npm test` — ✅ (24/24), `npm run build` — ✅ (в sandbox `vitest` мог падать на `EPERM kill`, поэтому прогон выполнен вне sandbox).

## Известные проблемы / Риски
- Зависимость от `ResizeObserver` (в современных браузерах есть; при отсутствии просто останется эвристика `formatMoneyAdaptive`).

## Следующие шаги
- Архив: `memory-bank/archive/archive-2025-12-23-chips-compact-overflow-artifact.md`
