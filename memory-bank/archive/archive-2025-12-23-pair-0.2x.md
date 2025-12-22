# Archive — 2025-12-23 — Pair payout 0.3x → 0.2x

## Summary
Снижен множитель выплаты за комбинацию **Pair**: **0.3x → 0.2x**.

## Requirements
- Изменить выплату за **Pair** с 0.3x ставки на 0.2x.
- Сохранить целостность доменной логики и сценарных use-cases (тесты/сборка должны пройти).

## Implementation
- Обновлён источник истины таблицы выплат: `HAND_MULTIPLIERS.Pair = 0.2` в `src/domain/hand-evaluator/constants.ts`.
- Синхронизированы unit‑тесты, которые фиксируют множитель и производные расчёты:
  - `src/domain/hand-evaluator/getBestHand.test.ts`
  - `src/application/game/usecases/usecases.test.ts`

## Testing
- `npm test` — ✅ (24/24) *(прогон вне sandbox из‑за `EPERM kill` в tinypool)*
- `npm run lint` — ✅
- `npm run build` — ✅

## Lessons learned
- Единый источник истины (`HAND_MULTIPLIERS`) + тесты на выплату/математику делают баланс‑правки быстрыми и безопасными.
- В окружении Cursor sandbox `vitest` может падать `EPERM kill`; стоит сразу планировать fallback‑прогон вне sandbox.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-23-pair-0.2x.md`


