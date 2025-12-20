# Архив — Dev Mode / Dev Tools v1 (2025-12-21)

## Summary
Добавлен **Dev Mode (Dev Tools)**: кнопка **DEV** в верхней панели открывает левый drawer (desktop) / bottom-sheet (mobile) с инструментами отладки, логом действий и просмотром состояния/колоды. Debug overlay по `D` теперь gated, `JP SIM` перенесён внутрь Dev Tools, debug-кнопки `1J/2J` удалены из основного UI.

## Requirements
- Кнопка рядом с переключателем `NORMAL/CASCADE` (до `TURBO`) открывает Dev Tools.
- Dev Tools содержит:
  - запуск/переключение debug-оверлея (включая hotkey `D`)
  - кнопку симуляции джекпота (перенос с главного экрана)
  - лог действий (максимум доступных событий) + Clear/Copy/Pause
  - просмотр состояния и оставшихся карт в колоде во время каскада
- UI не должен мешать наблюдать игру (без затемнения), закрытие только по `CLOSE`.
- Читабельность: лог/стата человекопонятными названиями, лог на русском.
- Добавить в лог “какая комбинация сработала” (например `Pair 33`, `Full House 999J*J*`).

## Implementation
- **UI**
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
    - добавлена кнопка **DEV** рядом с `NORMAL/CASCADE` и до `TURBO`
    - подключён `DevToolsDrawer`
    - удалены кнопки `JP/1J/2J` из зоны рядом с `PLAY`
  - `src/ui/screens/balatro-inferno/components/DevToolsDrawer.jsx`
    - drawer слева на desktop / sheet на mobile
    - без backdrop (нет затемнения), закрытие только кнопкой
    - русские подписи, лог как список действий, Copy копирует текст
    - экран “Dev tools выключены” + кнопка включения (localStorage + reload)

- **Controller / логирование**
  - `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`
    - gating Dev Tools: dev всегда разрешён; prod через `?dev=1`/`?devtools=1` или `localStorage('repoker.devTools'='1')`
    - hotkey `D` работает только когда Dev Tools разрешены
    - action log (cap 400) + Pause/Clear/Copy
    - добавлены события: deal/mode/turbo/debug/jp-sim/cascade/result и т.п.
    - добавлена “подпись комбинации” в лог через `winningIndices` + текущую руку (`J*` для джокера)

## Testing
- `npm run lint` — ✅
- `npm run test` — ✅ (24/24)
- `npm run build` — ✅

## Lessons learned
- Не прятать важные dev-контролы только за gating: лучше показывать кнопку и внутри давать понятный способ включения.
- Логирование внутри `useEffect` должно быть аккуратным (lint `set-state-in-effect`): безопаснее планировать запись асинхронно.
- Для dev-инструментов критична “операторская” читабельность: русский текст, минимум шумных структур, Copy = plain-text.

## References
- Рефлексия: `memory-bank/reflection/reflection-2025-12-21-devtools-devmode-v1.md`


