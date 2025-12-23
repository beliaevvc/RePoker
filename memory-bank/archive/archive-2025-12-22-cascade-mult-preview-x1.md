# Archive — 2025-12-22 — CASCADE multiplier preview (x1 always on)

## Summary
Улучшили UX режима **CASCADE**: индикатор множителя отображается “заранее” и помогает понимать потенциал следующего шага. По уточнению убран OFF-режим — базовый **x1 всегда горит**.

## Requirements
- В режиме **CASCADE** индикатор виден уже после раздачи (в `suspense`) и показывает **STEP 1 / x1**.
- Во время каскада (`cascading`):
  - **на win-баннере** показывать “текущий” шаг (**STEP N / xN применённый**),
  - **между шагами** показывать “следующий потенциальный” (**STEP N+1 / x…**), т.е. после первого win — **STEP 2 / x2**.
- **OFF не нужен**: вне активного каскада (idle/result) остаётся **STEP 1 / x1**.
- Preview множитель должен считаться из единого источника (`getCascadeMultiplierForWinStep`), без дублирования таблиц.

## Implementation
- `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - Добавлена/используется memo-логика `cascadeMultIndicator`, которая:
    - в `cascading` выбирает “current vs next” в зависимости от `showStepWinBanner` и `cascadeWinStepNumber`;
    - вычисляет preview через `getCascadeMultiplierForWinStep(nextStep)`;
    - после уточнения убирает OFF-ветку и возвращает базовое **STEP 1 / x1** даже в `idle/result` (armed=true).

## Testing
- `npm run test` — ✅ (24/24)
- `npm run lint` — ✅
- `npm run build` — ✅
- Примечание: прогон выполнялся **вне sandbox**, т.к. в sandbox возможен `EPERM kill` у `vitest`.

## Lessons learned
- UX-правила “базового состояния” (idle/result) лучше фиксировать явно сразу, чтобы не тратить итерации на OFF↔ON.
- Preview множитель стоит всегда брать из общего helper’а (`getCascadeMultiplierForWinStep`) — меньше расхождений и проще поддержка.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-22-cascade-mult-preview-x1.md`



