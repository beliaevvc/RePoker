# Archive — 2025-12-23 — Cascade usecases (apply step vs build sequence)

## Summary
Разобрались в различиях двух usecase-ов каскада:
- `applyCascadeStepUseCase` — один шаг (под пошаговый UI/анимации), включает cascade multiplier и jackpot.
- `buildCascadeSequenceUseCase` — полный прогон последовательности шагов (под симуляции/быстрые расчёты), возвращает `steps/totalWin` и финальные состояния.

## Requirements
- Понять и объяснить, чем отличаются `applyCascadeStep.ts` и `buildCascadeSequence.ts`.
- Зафиксировать, какой usecase использовать для пошагового UI, а какой — для расчёта каскада “целиком”.

## Implementation
- Сопоставлены контракты и логика:
  - `applyCascadeStepUseCase`:
    - выполняет один win/lose шаг;
    - принимает `winStepNumber`, считает `cascadeMultiplier`;
    - считает `baseWinAmount` и `winAmount` (с каскадным множителем);
    - умеет `didJackpot/jackpotAmount` при полной очистке deck в ходе шага;
    - возвращает детальные состояния “до/после” шага.
  - `buildCascadeSequenceUseCase`:
    - выполняет цикл шагов до проигрыша/нехватки deck/`maxSteps`;
    - собирает `steps` и агрегирует `totalWin` (без каскадных множителей);
    - возвращает финальные `hand/deck/dealIndex` и `finalResult`.

## Testing
- Тесты/сборка не запускались: изменение носило документационный/аналитический характер (без правок игровой логики).

## Lessons learned
- В коде есть два уровня абстракции каскада:
  - **пошаговый** (для UI, таймингов, эффектов, jackpot/множителя каскада),
  - **батчовый** (для симуляций и “быстрых” расчётов).
- Для снижения путаницы полезно явно подсветить в доках, что `totalWin` (batch) и `winAmount` (step) считают разные вещи.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-23-cascade-usecases.md`


