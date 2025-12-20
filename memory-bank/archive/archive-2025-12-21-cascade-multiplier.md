# Archive — 2025-12-21 — Cascade Multiplier (x1→x2→x3→x5) + UI

## Summary
В режиме **CASCADE** внедрён множитель каскада по выигрышным шагам (1× → 2× → 3× → 5× с 4-го шага), который заменяет streak в каскаде. Множитель применяется к выплате за комбинацию и отображается в UI (индикатор под картами, подпись в баннере шага и `MAX MULT` в финальном `TOTAL WIN`).

## Requirements
- Множитель каскада по win-шагам:
  - шаг 1: 1×
  - шаг 2: 2×
  - шаг 3: 3×
  - шаг 4+: 5×
- Множитель применяется **только** к выплате за комбинацию (hand payout).
- **Jackpot не множится**.
- В **CASCADE** streak **не используется** и **не должен меняться**.
- Визуализация множителя должна быть заметной и “игровой”.

## Implementation
- **Application**
  - `src/application/game/cascadeMultiplier.ts`: добавлена функция `getCascadeMultiplierForWinStep(winStepNumber)`.
  - `src/application/game/usecases/applyCascadeStep.ts`:
    - добавлен `winStepNumber` в input,
    - добавлены поля `cascadeMultiplier` и `baseWinAmount` в output,
    - `winAmount = baseWinAmount * cascadeMultiplier`,
    - `jackpotAmount` считается отдельно и не зависит от множителя.
- **UI/controller**
  - `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`:
    - `winStepNumber` передаётся как `cascadeStepIndex + 1`,
    - `streak` в CASCADE не меняется (в т.ч. на финале каскада и в `JACKPOT SIM`),
    - прокинуты состояния `cascadeWinStepNumber` и `cascadeMultiplier` для UI.
- **UI**
  - `src/ui/screens/balatro-inferno/components/CascadeMultiplierIndicator.jsx`: новый индикатор 1×/2×/3×/5× с pop/glow.
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx`:
    - в CASCADE вместо `ElectricPlasmaOrbs` показывается `CascadeMultiplierIndicator`,
    - в step win-баннер добавлена строка `CASCADE MULT xN`,
    - в `TOTAL WIN` добавлена строка `MAX MULT xN`.
  - `src/balatroInferno.css`: добавлены классы/кейфреймы для pop/glow.
- **Tests**
  - `src/application/game/usecases/usecases.test.ts`: добавлены unit-тесты для маппинга множителя и проверки, что jackpot не множится.

## Testing
- `npm run test` — ok
- `npm run lint` — ok
- `npm run build` — ok

## Lessons learned
- Игровую “математику денег” лучше держать в **application**, а не в UI, чтобы анимации не могли повлиять на корректность расчёта.
- Для UX важно объяснять “почему totalWin такой”: строка `MAX MULT` на финале сильно снижает ощущение “магии/непонятности”.

## References
- Creative: `memory-bank/creative/creative-cascade-multiplier.md`
- Reflection: `memory-bank/reflection/reflection-2025-12-21-cascade-multiplier.md`


