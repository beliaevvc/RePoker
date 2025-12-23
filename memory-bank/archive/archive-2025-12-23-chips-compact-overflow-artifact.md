# Archive — 2025-12-23 — CHIPS: compact/overflow + артефакт полос при обновлении баланса

## Summary
Починили отображение баланса в плашке **CHIPS**:
- **Compact включается, когда значение реально не помещается**, а не только по эвристике длины строки.
- Убрали визуальный **артефакт тонких полос** на цифрах, который проявлялся при обновлении баланса в compact-формате и исчезал после “сильного” repaint.

## Requirements
- CHIPS не должен “вылазить” за границы; если не помещается — показывать compact.
- Полное значение доступно через tooltip (`title`).
- Никаких визуальных артефактов при частых обновлениях баланса (списание/добавление, dev-console).

## Implementation
- `src/ui/screens/balatro-inferno/moneyFormat.js`
  - `formatMoneyAdaptive`: пограничные случаи учтены (`full.length >= maxFullLength`).
- `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - CHIPS: добавлен реальный overflow-check:
    - измерение ширины full-строки через `canvas.measureText`
    - пересчёт на resize через `ResizeObserver`
    - если full не помещается, CHIPS форсится в compact
  - Фикс артефакта рендера:
    - убраны любые скрытые DOM-ноды рядом с CHIPS-текстом
    - текст CHIPS/ANTE поднят выше `.crt-overlay` (z=100)
    - добавлены `transform-gpu` + `will-change-transform` для более стабильной перерисовки текста при обновлениях

## Testing
- `npm test` — ✅ (24/24)
- `npm run build` — ✅

## Lessons learned
- Эвристики “по длине строки” недостаточно: лучше иметь **реальный overflow-check**.
- CRT/transform слои могут давать “графические” баги при обновлении текста; `transform-gpu`/`will-change` и корректный z-order часто решают без изменения дизайна.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-23-chips-compact-overflow-artifact.md`


