## Summary
Убраны два раздражающих UI-элемента на экране `BalatroInferno`:
- белый “пульсирующий” overlay (`animate-ping ... bg-white`) под баннером выигрыша/каскада
- HUD каскада “STEPS · TOTAL …” (убран полностью)

## Requirements
- Удалить `div.animate-ping ... bg-white` (из DOM) без побочных эффектов на лейаут/анимации.
- Убрать HUD каскада “STEPS · TOTAL …” полностью.
- Пройти гейты: `npm run test`, `npm run lint`, `npm run build`.

## Implementation
- `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - Удалён overlay-слой `absolute inset-0 ... animate-ping ... bg-white ...` из блока баннера выигрыша/каскада.
  - Удалён блок HUD `{showCascadeHud && (...)}` (строка с “STEPS · TOTAL ...”).
  - Удалены неиспользуемые переменные/вычисления, оставшиеся после удаления HUD, чтобы пройти ESLint.
- Memory Bank
  - `memory-bank/tasks.md`: чеклисты отмечены, Level 1.
  - `memory-bank/progress.md`: зафиксированы изменения и результаты гейтов.
  - `memory-bank/reflection/reflection-2025-12-20-ui-overlays.md`: рефлексия по задаче.

## Testing
- `npm run test` — ✅
- `npm run lint` — ✅
- `npm run build` — ✅

## Lessons learned
- В UI легко перепутать “похожий эффект” с “тем самым элементом”: полезно сразу уточнять, удаляем ли конкретный DOM-элемент или визуальный блок/оформление.
- Для правок по скриншоту лучше просить текущий DOM Path/HTML Element именно того элемента, который пользователь видит.
- В окружении могут всплывать `EPERM`/sandbox-ограничения при `test/lint`: это не всегда проблема кода, но важно зафиксировать причину.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-20-ui-overlays.md`

