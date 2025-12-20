# Reflection — 2025-12-21 — Cascade Multiplier (x1→x2→x3→x5) + UI

## Контекст задачи
Нужно было заменить “активный streak” в режиме **CASCADE** на **множитель каскада**: на каждом последующем *выигрышном* шаге каскада выплаты за комбинацию увеличиваются (1× → 2× → 3× → 5× с 4-го шага).  
При этом **jackpot не должен множиться**, а в режиме **NORMAL** streak остаётся как был.

## План vs фактическая реализация
- **План** (в `memory-bank/tasks.md`):
  - вынести механику множителя в “чистый” модуль,
  - интегрировать в каскадный расчёт выплат (только hand payout),
  - убрать изменение streak в CASCADE,
  - сделать заметный UI-индикатор + подпись в баннере,
  - прогнать test/lint/build.
- **Факт**:
  - Добавили `getCascadeMultiplierForWinStep(winStepNumber)` в application (`src/application/game/cascadeMultiplier.ts`) + unit-тесты.
  - Расчёт перенесли в application: `applyCascadeStepUseCase` принимает `winStepNumber`, считает:
    - `baseWinAmount = bet * handMultiplier`,
    - `winAmount = baseWinAmount * cascadeMultiplier`,
    - `jackpotAmount` отдельно (без умножения).
  - В `useBalatroInfernoController`:
    - передаём `winStepNumber = cascadeStepIndex + 1`,
    - копим `totalWin` с учётом множителя,
    - **не меняем streak** в CASCADE (в т.ч. на финале каскада и в `JACKPOT SIM`).
  - UI:
    - в CASCADE `ElectricPlasmaOrbs` заменён на `CascadeMultiplierIndicator` (4 уровня 1×/2×/3×/5× + pop/glow),
    - в step win-баннер добавлена строка `CASCADE MULT xN`,
    - в финальный баннер `TOTAL WIN` добавлена строка `MAX MULT xN`, чтобы игрок видел “до какого уровня дошёл каскад”.
  - Гейты прошли: `npm run test`, `npm run lint`, `npm run build`.

## Что было сложным и почему
- **Определение “шага”**: важно было считать множитель только по *выигрышным* шагам (если win нет — каскад завершён и множителя “не существует”).
- **Разделение выплат**: jackpot уже считается как отдельная сущность, но нужно было явно закрепить правило “jackpot не множится”, чтобы не сломать баланс.
- **Наблюдаемость в UI**: без отдельной индикации на финале игрок может не понять, почему totalWin такой (из-за множителей). Поэтому добавили `MAX MULT xN` в финальный баннер.

## Удачные решения
- Перенос расчёта множителя в **application** (а не в UI): проще тестировать и гарантирует корректность выплат независимо от анимаций.
- Раздельные поля `baseWinAmount / winAmount / jackpotAmount`: снижает риск “случайного умножения” не того.
- UI-замена “в том же месте”, где были орбы streak: ощущение, что новая механика действительно заменяет старую.

## Что улучшить дальше
- Вынести “max multiplier” в application-результат каскада (вместо вычисления по числу шагов в UI), если захотим в будущем делать более сложные правила (например, cap зависит от модификаторов).
- Добавить мини-хинт/tooltip (в debug/QA режиме) “TOTAL WIN includes cascade multipliers”, если игрокам будет неочевидно.

## Проверки
- `npm run test` — ok
- `npm run lint` — ok
- `npm run build` — ok


