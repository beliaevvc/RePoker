# Archive — 2025-12-21 — Payouts rework (новая таблица выплат)

## Summary
Обновили выплаты за покерные комбинации (множители “x на ставку”), добавили дробную выплату для Pair (0.3×), удалили “джокер-комбо” (`3/4/5 Jokers`, `Five of a Kind`). Привели тесты/QA-инструменты и UI-константы в соответствие, гейты зелёные.

## Requirements
- Обновить выплаты:
  - Pair 0.3× bet
  - Two Pair 1× bet
  - Three of a Kind 5× bet
  - Straight 10× bet
  - Flush 20× bet
  - Full House 50× bet
  - Four of a Kind 100× bet
  - Straight Flush 200× bet
  - Royal Flush 1000× bet
- Хранить и показывать **точные числа** (без бизнес-округления).
- Убрать комбинации: `3 Jokers`, `4 Jokers`, `5 Jokers`, `Five of a Kind`.

## Implementation
- **Paytable**:
  - Обновили `src/domain/hand-evaluator/constants.ts` (`HAND_MULTIPLIERS`) под новую таблицу.
  - Удалили из `HAND_TIERS` неиспользуемые джокер-комбо и “max-win tier”.
- **Оценка комбинаций**:
  - В `src/domain/hand-evaluator/getBestHand.ts` убрали возврат `Five of a Kind` и специальные “3/4/5 Jokers”.
  - Добавили guard на `jokerCount > 2` (в основной колоде максимум 2 джокера).
- **QA/Debug**:
  - `src/application/game/usecases/forceHand.ts` и кнопки в UI (`BalatroInferno.jsx`) ограничены на форс **1–2** джокеров (чтобы не ломать доменный guard).
- **Дробные выплаты**:
  - Добавили “cleanMoney” нормализацию в application use-cases:
    - `src/application/game/usecases/resolveResult.ts`
    - `src/application/game/usecases/applyCascadeStep.ts`
    - `src/application/game/usecases/buildCascadeSequence.ts`
  - Цель: избежать float-артефактов при суммировании/отображении (например, `3.5999999999999996`).
- **UI-слой**:
  - Почистили `src/ui/screens/balatro-inferno/constants.js` от упоминаний `3/4/5 Jokers`.
  - Упростили эффект `PixelFire` в `src/ui/screens/balatro-inferno/components/Card.jsx` (убран спец-режим tier=7).

## Testing
- `npm run test` — ✅
- `npm run lint` — ✅
- `npm run build` — ✅

## Lessons learned
- Дробные коэффициенты быстро вскрывают ограничения float при накоплении (особенно в каскаде) — лучше стабилизировать денежные значения на уровне application.
- Если удаляем комбинации/правила, важно синхронизировать не только domain и тесты, но и debug-инструменты (иначе они начинают генерить “невозможные” состояния).

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-21-payouts-rework.md`


