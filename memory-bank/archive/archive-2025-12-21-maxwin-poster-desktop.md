# Archive — 2025-12-21 — MaxWinPoster (desktop full-res)

## Summary
Пофикшен UI-баг на **full desktop**: `MaxWinPoster` (“MAX WIN / 150,000X”) становился слишком крупным и пересекался с плашками **CHIPS / ANTE**. Дополнительно улучшена косметика второй строки: **150.000x**, `x` в 2 раза меньше, добавлен “воздух” между строками.

## Requirements
- На desktop full-res надпись `MaxWinPoster` не должна “залезать” на CHIPS/ANTE.
- В остальных разрешениях поведение должно остаться как было (без регрессов).
- Косметика:
  - заменить запятую на точку: `150,000X` → `150.000x`
  - `x` сделать в 2 раза меньше
  - вторую строку чуть опустить вниз (воздух).

## Implementation
- **`src/ui/screens/balatro-inferno/BalatroInferno.jsx`**
  - Обновлён `MaxWinPoster`:
    - безопасное позиционирование/выравнивание в центральной колонке: `inset-x-0`, `text-center`, `px-1`, `leading-none`, `pointer-events-none`
    - ограничение роста шрифтов только на **`2xl`** (уменьшены `max` в `clamp()`), чтобы адресовать ultra-wide без влияния на меньшие брейкпоинты
    - косметика: `150.000` + `<span>` для `x` (`0.5em`) и увеличенный отступ сверху второй строки (`mt clamp`) для “воздуха”.

## Testing
- `npm run test` — ✅ (24/24)
- `npm run lint` — ✅
- `npm run build` — ✅
- Примечание: прогон делался **вне sandbox** из-за `EPERM kill` у Vitest в sandbox.

## Lessons learned
- Для элементов с `vw`/`clamp()` стоит иметь быстрые пресеты проверки ширины (например 1280/1440/1920/2560), т.к. баги часто проявляются только на “краях” диапазона.
- Локальные `2xl`-оверрайды помогают лечить ultra-wide без регресса на остальных разрешениях.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-21-maxwin-poster-desktop.md`


