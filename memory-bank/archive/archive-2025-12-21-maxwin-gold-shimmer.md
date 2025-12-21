# Archive — 2025-12-21 — MAX WIN gold shimmer

## Summary
Восстановлен “золотой” стиль с переливом для надписи **“MAX WIN 150.000x”** в верхней панели `BalatroInferno`.

## Requirements
- Надпись “MAX WIN 150.000x” должна снова быть **золотой** и иметь **эффект перелива**.
- Без регрессий на desktop/mobile.

## Implementation
- Диагностика показала, что в `BalatroInferno.jsx` уже используется класс `text-gold-shimmer`, но он **не был определён** в стилях проекта.
- Добавлено в `src/balatroInferno.css`:
  - `.text-gold-shimmer` (градиент “золото” через `background-clip: text`)
  - `@keyframes gold-shimmer` (анимация движения градиента)
  - `@media (prefers-reduced-motion: reduce)` — отключение анимации для пользователей с выключенными анимациями

## Testing
- `npm run build` — ✅

## Lessons learned
- Если используем кастомные классы “как tailwind”, важно держать их определение рядом/явно и периодически проверять, что класс реально существует в CSS (иначе браузер молча проигнорирует).

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-21-maxwin-gold-shimmer.md`
- Code:
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx` (использование `text-gold-shimmer`)
  - `src/balatroInferno.css` (определение `text-gold-shimmer`)


