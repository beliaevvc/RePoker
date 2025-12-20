# Archive — 2025-12-20 — Cascade final banner steps

## Summary
Добавили на финальный баннер каскада (“TOTAL WIN”) **вторую строку** с отображением **кол-ва шагов каскада** в стиле текущего UI: `CASCADES xN`.

## Requirements
- На финальном баннере каскада показывать **кол-во шагов (steps)** текущей каскадной цепочки.
- Отображение — **второй строкой** под суммой, в “нашем” стиле (press-start, трекинг, аккуратный цвет).
- Строка должна появляться **только** на финале каскада (не на обычных win-баннерах).

## Implementation
- **UI (экран)**: `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - Добавили `lastCascadeStepsCount` в деструктуризацию результата `useBalatroInfernoController()`.
  - В блоке баннера “TOTAL WIN” добавили условный рендер второй строки при `showCascadeTotalBanner === true`:
    - `CASCADES x{lastCascadeStepsCount}`
    - типографика: мелкий размер, `uppercase`, повышенный `tracking`, `text-slate-300`.
- **Источник данных**: `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`
  - `lastCascadeStepsCount` уже считался на финале каскада; изменение потребовало только прокинуть его в UI.

## Testing
- Прогон гейтов:
  - `npm run test` (Vitest) — OK
  - `npm run lint` — OK
  - `npm run build` — OK
- Примечание: в sandbox-среде Vitest мог падать с `kill EPERM`; гейты прогнаны вне sandbox.

## Lessons learned
- Когда счётчик уже посчитан в контроллере/оркестраторе, UI-улучшения можно делать локально без риска зацепить domain/application слой.
- Для каскадных UI-баннеров лучше держать строгие условия показа (здесь — `showCascadeTotalBanner`), чтобы избежать “протекания” состояния на другие режимы.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-20-cascade-final-banner-steps.md`


