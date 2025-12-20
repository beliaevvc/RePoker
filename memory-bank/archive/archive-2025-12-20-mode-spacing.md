# Archive — 2025-12-20 — MODE spacing (panel bottom air)

## Summary
Добавлен небольшой вертикальный отступ под панелью переключения режима **MODE**, чтобы она визуально не “прилипала” к блоку **ANTE**.

## Requirements
- Панель MODE должна иметь заметный “воздух” снизу.
- Изменение должно быть минимальным, без влияния на игровую логику.
- Гейты должны оставаться зелёными: lint/test/build.

## Implementation
- Правка выполнена в `src/ui/screens/balatro-inferno/BalatroInferno.jsx`.
- Контейнеру панели MODE добавлен нижний отступ: `mb-2 sm:mb-3`, чтобы оттолкнуть следующий ряд (грид с CHIPS/ANTE) вниз.

## Testing
- `npm run lint` — ok
- `npm run test` — ok
- `npm run build` — ok

## Lessons learned
- Для “склеенных” блоков в верхней части экрана достаточно точечного `mb-*` на контейнере, чтобы не трогать сетку/грид ниже.
- Полезно иметь небольшую стандартную шкалу вертикальных отступов (например 8/12/16px) для консистентности.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-20-mode-spacing.md`


