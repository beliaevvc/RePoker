# Archive — 2025-12-20 — Cascade deck exhaust + Jackpot + QA sim + MAX WIN cinematic

## Summary
Изменена механика каскада: колода больше не “перегенерируется” при исчерпании, добавлен терминальный исход **джекпот 150 000× bet**, добавлен QA‑симулятор (5 сценариев), и добавлена “cinematic” анимация MAX WIN (появление из точки поверх затемнения + dismiss по клику).

## Requirements
- При каскаде **не генерировать новую колоду** при исчерпании.
- Если в выигрышном шаге нужно заменить N карт, а в колоде осталось < N:
  - добрать сколько есть,
  - недостающее оставить пустыми слотами,
  - каскад завершить после этого шага.
- Джекпот: если после win‑шага **стол пуст** и **колода пуста** → начислить **+150 000× bet** (сверху).
- Добавить QA‑кнопку для проверки: сценарии должны быть разными, но **всегда** приводить к джекпоту за **несколько** шагов.
- Визуальный финал джекпота: тряска/рябь → затемнение → MAX WIN появляется по центру “из точки” **поверх** всего; клик закрывает и возвращает в idle.

## Implementation
- **Application**
  - `src/application/game/usecases/applyCascadeStep.ts`
    - убран рефил; недобранные карты → `null`; добавлены `didDeckShortage`, `didJackpot`, `jackpotAmount`.
  - `src/application/game/usecases/buildCascadeSequence.ts` синхронизирован с новой механикой.
- **UI / Orchestration**
  - `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`
    - учитывает `didDeckShortage` (завершение каскада) и `jackpotAmount` в total;
    - сохраняет `lastWasJackpot` и умеет `dismissJackpotCinematic()` (клик закрывает синематику).
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
    - QA‑кнопка `JACKPOT SIM (QA)` (только CASCADE);
    - синематический overlay MAX WIN с `z-index` выше затемнения; появление из точки по центру.
- **QA generator**
  - `src/application/game/debug/jackpotSimulation.ts` — 5 сценариев, гарантированно приводящих к джекпоту за несколько win‑шагов.
- **CSS**
  - `src/balatroInferno.css` — отдельные анимации `maxwin-cinematic-*`.

## Testing
- `src/application/game/usecases/usecases.test.ts`
  - тест на 5 QA‑сценариев: каждый доходит до `didJackpot=true` и `jackpotAmount = bet * 150000`.
- Гейты пройдены: `npm test`, `npm run lint`, `npm run build`.

## Lessons learned
- “Правила колоды” лучше держать в application use-case: легче тестировать и меньше вероятность UI‑регрессий.
- Для “гарантированного” QA‑сценария важно избегать неоднозначностей в оценке рук (джокеры/пересечения рангов) — нужен детерминированный генератор + тест.
- Для сложных оверлеев (blackout + top overlay) важны stacking contexts: безопаснее выносить критичный слой в корневой `fixed` overlay.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-20-cascade-deck-exhaust-jackpot-cinematic.md`


