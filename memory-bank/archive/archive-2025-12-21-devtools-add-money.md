# Archive — 2025-12-21 — DevTools: Add Money

## Summary
Добавили в DevTools (dev mode) отдельный раздел **“Добавить денег”** с кнопками пополнения баланса на фиксированные суммы и безопасной реализацией на уровне контроллера.

## Requirements
- В `DevToolsDrawer` нужен отдельный раздел с кнопками: **1000, 5000, 10000, 100000, 1m, 10m**.
- Действие должно быть безопасным: не обходить gating DevTools в прод-сборке.
- Баланс должен обновляться корректно (без float-артефактов), а действие — логироваться в DevTools log.

## Implementation
- **Контроллер (источник правды)**: `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`
  - Добавлен dev-only action `addMoney(amount)` с guard `devToolsAllowed`.
  - Нормализация денег через `cleanMoney` (округление).
  - Dev-log событие `BALANCE_ADD`.
  - Добавлен `balanceRef`, чтобы быстрые клики не “терялись” при batching обновлений.
- **Проброс пропсов**: `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - Проброшен `onAddMoney={addMoney}` в `DevToolsDrawer`.
- **UI DevTools**: `src/ui/screens/balatro-inferno/components/DevToolsDrawer.jsx`
  - Добавлена секция “Добавить денег” с кнопками пресетов.
  - Кнопки disabled, если `!allowed` или отсутствует handler.
  - Добавлен рендер события `BALANCE_ADD` в человекочитаемом виде.

## Testing
- `npm run test` — ✅ (24/24)
- `npm run lint` — ✅
- `npm run build` — ✅
- Примечание: в sandbox `vitest` падал с `EPERM kill` (tinypool), поэтому команды прогонялись вне sandbox.

## Lessons learned
- Guard на уровне контроллера (`devToolsAllowed`) — самый надёжный способ исключить обход DevTools gating.
- Нормализация денег должна быть общей практикой во всех местах, где идёт арифметика с валютой.
- Для частых последовательных инкрементов UI-стейта полезно использовать ref (или функциональные апдейты), чтобы не терять изменения.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-21-devtools-add-money.md`


