# Archive — 2025-12-23 — PixelIcons cleanup

## Summary
Удалили мёртвый UI-код: неиспользуемый импорт `PixelMoneyIcon` и файл `PixelIcons.jsx` с пиксельными иконками (Turbo/Auto/Money). Дополнительно довели `eslint` до зелёного (всплыли 2 правила `react-hooks/set-state-in-effect`).

## Requirements
- Проверить, используются ли пиксельные иконки из `src/ui/screens/balatro-inferno/components/PixelIcons.jsx`.
- Если не используются — удалить импорты и файл без влияния на UI.
- Подтвердить корректность через `test/build/lint`.

## Implementation
- Поиск по проекту показал единственный импорт `PixelMoneyIcon` в `src/ui/screens/balatro-inferno/BalatroInferno.jsx` без фактического JSX-использования.
- Удалён импорт `PixelMoneyIcon` из `src/ui/screens/balatro-inferno/BalatroInferno.jsx`.
- Удалён файл `src/ui/screens/balatro-inferno/components/PixelIcons.jsx`.
- Линт-правки (побочный эффект задачи):
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx`: удалён лишний effect, который синхронно делал `setChipsForceCompact(false)`.
  - `src/ui/screens/balatro-inferno/components/Card.jsx`: reset состояния при `!isInteractable` отложен в microtask.

## Testing
- `npm test` — ✅ (24/24)
- `npm run build` — ✅
- `npm run lint` — ✅

## Lessons learned
- Удаление “простого” мёртвого кода может расшириться из‑за строгих правил линта — лучше прогонять `eslint` как можно раньше.
- Поиск импорта + поиск фактического JSX-использования — быстрый способ подтвердить, что компонент действительно не используется.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-23-pixel-icons-cleanup.md`


