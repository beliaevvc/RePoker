# Archive — 2025-12-21 — UI: CHIPS overflow (adaptive money display)

## Summary
Исправили переполнение текста в плашке **CHIPS** при больших суммах: без переноса строки и без расширения блока. В UI теперь используется **адаптивный формат** (full → compact), а полная сумма доступна через tooltip (`title`).

## Requirements
- Плашка **CHIPS** не должна “вылазить” за границы при больших значениях.
- **Запрещён перенос строки**.
- Блок **строго в своей ширине** (не раздвигать сетку/колонку).
- Желательно: на hover видеть **полное значение**.

## Implementation
- Добавлен helper форматирования денег:
  - `src/ui/screens/balatro-inferno/moneyFormat.js`
  - API: `formatMoneyFull`, `formatMoneyCompact`, `formatMoneyAdaptive`
  - Реализация через `Intl.NumberFormat('en-US', { style: 'currency', ... })`
  - `formatMoneyAdaptive` переключается на compact по порогу величины и/или длине full-строки.
- Обновлён рендер CHIPS/ANTE и суммы выигрыша:
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - CHIPS: `{chipsDisplay}` + `title={chipsTitle}` + `whitespace-nowrap overflow-hidden`
  - ANTE и баннер выигрыша: переход на `formatMoneyFull`
- DevTools приведён к единому формату:
  - `src/ui/screens/balatro-inferno/components/DevToolsDrawer.jsx`
  - Удалён локальный `formatMoney`, используется `formatMoneyFull` из helper’а.

## Testing
- `npm run lint` — ✅ (в sandbox было `EPERM` на чтении `node_modules`, прогон выполнен вне sandbox)
- `npm test` — ✅ (24/24)
- `npm run build` — ✅

## Lessons learned
- **Compact + tooltip(full)** — хороший компромисс “красиво/стабильно” без сложных измерений текста и без переносов.
- Shared helper снижает дублирование и расхождения форматов между UI и debug-инструментами.
- Для “всегда full и всегда влезает” нужен отдельный дизайн/алгоритм (shrink-to-fit с измерениями), это лучше выделять как отдельную задачу.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-21-chips-plaque-overflow.md`


