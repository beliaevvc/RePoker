# Архив — Ante ставки (2025-12-21)

## Summary
Перевели ставку **Ante** на фиксированный список значений и установили дефолт **1.00**. `+/-` теперь переключают ставку шагом по списку, а отображение денег в HUD/баннере форматируется с **2 знаками** после запятой.

## Requirements
- Обновить список Ante на:
  `0.20, 0.40, 0.60, 0.80, 1.00, 1.20, 1.40, 1.60, 1.80, 2.00, 3.00, 5.00, 10, 20, 30, 50, 100`
- Ставка по умолчанию: **1.00**

## Implementation
- Добавлен единый источник правды для Ante:
  - `src/application/game/constants/ante.ts` (`ANTE_VALUES`, `DEFAULT_ANTE`)
- Обновлён use-case изменения ставки:
  - `src/application/game/usecases/adjustBet.ts` — дискретный шаг по списку, учёт `balance`, и обработка случаев когда текущая ставка не совпадает со списком (берём ближайшую).
- UI:
  - `src/ui/screens/balatro-inferno/useBalatroInfernoController.js` — дефолт ставки = `DEFAULT_ANTE`
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx` — `+/-` вызывают `adjustBet(±1)`, денежные значения форматируются в `toFixed(2)`.

## Testing
- `npm test` (Vitest) — ok
- `npm run lint` — ok
- `npm run build` — ok

## Lessons learned
- Лучше держать ставки (и дефолты) **в одном месте** (константы application), чтобы UI и use-cases не расходились.
- При переходе с “произвольной” ставки на дискретный список важно иметь **мягкую миграцию**: если значение не из списка, выбирать ближайшее, иначе UI/логика могут “залипнуть”.
- Для дробных ставок стоит сразу стандартизировать **формат отображения денег**.

## References
- Рефлексия: `memory-bank/reflection/reflection-2025-12-21-ante-bets.md`


