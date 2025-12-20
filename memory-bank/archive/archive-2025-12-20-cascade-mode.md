# Archive — 2025-12-20 — Cascade Mode

## Summary
Внедрён режим **CASCADE** для RePoker с пошаговыми каскадами (удаляются только выигрышные карты, добор новых, повтор до отсутствия комбинаций) и начислением выигрыша **одним платежом** в конце. Добавлено переключение **NORMAL/CASCADE** с сохранением выбора и визуальный таймлайн каскада.

## Requirements
- Каскад:
  - На каждом шаге определять лучшую комбинацию (`getBestHand`).
  - Удалять **только** карты из `winningIndices`, остальные сохраняются на местах.
  - Добор новых карт на освободившиеся позиции из `deck`.
  - Повторять, пока есть выигрыш (`multiplier > 0`).
  - Выигрыш суммируется и начисляется на баланс **только в конце каскада**.
  - Без множителей каскада (на будущее).
  - Если колода закончилась — **создать новую** и продолжить.
  - Streak: **+1 за спин**, если был хотя бы один win в каскаде, иначе 0.
- Режимы:
  - 2 режима: **NORMAL / CASCADE**.
  - Выбор режима сохраняется между перезапусками (`localStorage`).
- UX каскада:
  - На каждом шаге: баннер win → исчезновение → заметное появление новых → следующий шаг.
  - На финале каскада показывать **TOTAL WIN** (не “последнюю выигрышную комбинацию” на финальной руке).

## Implementation
- **Режимы**:
  - Добавлен `GameMode` в application типы: `src/application/game/types.ts`.
  - В `useBalatroInfernoController` добавлено состояние `mode` + чтение/запись `localStorage`.
  - В UI добавлен переключатель режима.
- **Каскадная логика (application)**:
  - `src/application/game/usecases/buildCascadeSequence.ts`: ранний подход — предрасчёт последовательности.
  - `src/application/game/usecases/applyCascadeStep.ts`: финальный подход — **один шаг каскада** (оценка → замена `winningIndices` → новый state) с `refillDeck`.
- **Оркестрация (ui)**:
  - `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`:
    - Ветка CASCADE в `suspense`.
    - Таймлайн шага: reveal+banner → hide → vanish → empty slots → drop-in new cards → next step.
    - Начисление `totalWin` единым платежом на финале.
    - Защита от гонок: токены таймеров и логическое состояние в `refs`, чтобы mid-step setState не перезапускал шаг.
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx`:
    - HUD каскада (step/total).
    - Баннер win на шаге.
    - Финальный баннер **TOTAL WIN** на `result` при `lastCascadeTotalWin > 0`.
    - Debug overlay (toggle `D`) для сравнения computed vs display (использовался для диагностики рассинхронов).
- **Анимации**:
  - `src/balatroInferno.css`: `cascade-vanish`, `cascade-appear`, `cascade-refill-flash`.
  - `src/ui/screens/balatro-inferno/components/Card.jsx`: поддержка `isVanishing/isAppearing`.

## Testing
- Unit tests (Vitest):
  - `src/application/game/usecases/usecases.test.ts`:
    - `buildCascadeSequenceUseCase`: 0/1/2+ шагов, замена только winningIndices, refillDeck.
    - `applyCascadeStepUseCase`: win/lose/refillDeck сценарии.
- Гейты:
  - `npm run test`
  - `npm run lint`
  - `npm run build`

## Lessons learned
- Для механик с таймлайном и анимациями нужно заранее закладывать:
  - пошаговый расчёт (а не предрасчёт всей последовательности),
  - защиту от гонок таймеров,
  - диагностический режим (debug overlay).
- На финале каскада нельзя показывать “последнюю выигрышную комбинацию” на финальной руке — лучше отдельный **TOTAL WIN**.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-20-cascade-mode.md`
- Plan/Task: `memory-bank/tasks.md`


