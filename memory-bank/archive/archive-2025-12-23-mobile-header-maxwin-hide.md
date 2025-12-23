# Archive — UI: mobile/узкие, шапка (скрыть MAX WIN, расширить CHIPS/ANTE)

## Summary
Исправили проблемы верстки на iPhone/узких ширинах в шапке игры: **на mobile (< 640px) убрали “MAX WIN 150.000x” из шапки**, чтобы освободить место под **CHIPS** и **ANTE**. На `sm+` (>=640px) шапка остаётся трёхколоночной с MAX WIN по центру. Дополнительно — защитили суммы `truncate` и сделали более агрессивный `formatMoneyAdaptive` на mobile.

## Requirements
- На iPhone (Safari/Chrome) и узких разрешениях:
  - “MAX WIN 150.000x” не должен ломать шапку/пересекаться с плашками.
  - CHIPS/ANTE не должны неприятно обрезаться.
- На desktop внешний вид не должен деградировать.

## Implementation
- `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - Шапка: `grid-cols-2 sm:grid-cols-3`.
  - Центр (MAX WIN): `hidden sm:flex` (на mobile скрыт).
  - CHIPS/ANTE: `truncate`, более мягкие размеры шрифта на mobile.
  - Mobile-only агрессивнее `formatMoneyAdaptive(balance, { maxFullLength: 10, compactFrom: 100_000 })`.

## Testing
- `npm run lint` — ✅ (вне sandbox, из-за `EPERM` при чтении `node_modules` в sandbox)
- `npm run build` — ✅

## Lessons learned
- Визуальный масштаб через `vw` (viewport) плохо “чувствует” реальную ширину центральной колонки на крупных телефонах; попытка container queries потребовала тонкой калибровки и была откатана по фидбэку.
- Самое надёжное решение для mobile в этом кейсе — **упростить UI** (убрать MAX WIN из шапки), а не “высчитывать идеальную формулу” масштабирования.
- В React легко словить критичный регресс (белый экран), если использовать переменную/хук до объявления (TDZ). Важно следить за порядком вычислений.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-23-mobile-header-maxwin-hide.md`
- Основной файл UI: `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
- Стили: `src/balatroInferno.css`


