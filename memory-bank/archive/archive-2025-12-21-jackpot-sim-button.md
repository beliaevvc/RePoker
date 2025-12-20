# Archive — 2025-12-21 — Jackpot Sim button (QA) reposition

## Summary
Перенёс QA-кнопку `JACKPOT SIM (QA)` из отдельной широкой строки в компактную, малозаметную кнопку справа от `PLAY` (в правой колонке контролов), чтобы она не отвлекала от основного CTA.

## Requirements
- Кнопка `JACKPOT SIM (QA)` должна быть:
  - маленькой
  - справа от кнопки `PLAY`
  - еле заметной (low-emphasis)
- Функциональность QA-симуляции должна сохраниться.

## Implementation
- Файл: `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
- Изменения:
  - Удалена широкая кнопка `JACKPOT SIM (QA)`, которая рендерилась отдельным блоком на всю ширину.
  - Добавлена компактная кнопка “JP” в правую колонку (рядом с debug-кнопками), видимая только при `mode === 'cascade'`.
  - Базовая заметность снижена через `opacity`, при hover становится полностью видимой.

## Testing
- `npm run lint` — ✅
- `npm run build` — ✅

## Lessons learned
- QA-инструменты лучше держать рядом с dev/debug контролами и выводить low-emphasis, чтобы не конкурировали с основным действием пользователя.
- Линт/сборка в sandbox могут падать на доступе к `node_modules` (EPERM) — в таких случаях нужно запускать проверки вне песочницы.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-21-jackpot-sim-button.md`


