# Reflection — 2025-12-22 — Cascade Multiplier Indicator (preview + x1 always on)

### Контекст задачи
Нужно улучшить UX в режиме **CASCADE**: игрок должен видеть каскадный множитель **заранее** (после раздачи, до win-баннера/подсветки). Дополнительное уточнение: **OFF-режим не нужен** — базовый **x1 должен “гореть” всегда**.

### План vs факт
- **План** (из `memory-bank/tasks.md`):
  - показывать `CascadeMultiplierIndicator` уже на стадии `suspense` и в `cascading`;
  - в `cascading`: на win-баннере — “текущий” шаг, между шагами — “следующий потенциальный”;
  - preview множитель считать через `getCascadeMultiplierForWinStep`;
  - индикатор не пропадает в CASCADE.
- **Факт**:
  - Логика `cascadeMultIndicator` в `BalatroInferno.jsx` уже считала preview через `getCascadeMultiplierForWinStep` и различала “current vs next” в `cascading`.
  - По уточнению убран OFF (`armed:false`, `x—`, `STEP 0`) — теперь в CASCADE даже в `idle/result` показываем **STEP 1 / x1** (armed=true).

### Что сделали
- В `src/ui/screens/balatro-inferno/BalatroInferno.jsx` убрали OFF-ветку и сделали базовое состояние **STEP 1 / x1** всегда, когда `mode === 'cascade'`.
- Оставили поведение в `cascading`:
  - **во время win-баннера**: текущий `STEP N / xN` (применённый к шагу),
  - **между шагами**: следующий потенциальный `STEP N+1 / x…`.

### Что было сложным / почему
- Не сама логика, а **уточнение UX** в ходе выполнения (OFF vs “x1 всегда горит”). Хорошо, что изменение локализовано в одном месте (`cascadeMultIndicator`).

### Удачные решения
- Preview множителя берётся из **единого источника** `getCascadeMultiplierForWinStep` — нет дублирования таблицы уровней в UI.
- Изменение сделано **чисто UI-уровня**, без влияния на расчёт выигрышей и application use-cases.

### Что улучшить
- В будущем фиксировать UX-правила одним абзацем в начале задачи (особенно “базовое/idle поведение”), чтобы избежать лишних итераций “OFF ↔ ON”.

### Проверки
- `npm run test` — ✅ (24/24)
- `npm run lint` — ✅
- `npm run build` — ✅
- Примечание: прогон делался **вне sandbox** (в sandbox возможен `EPERM kill` у `vitest`).


