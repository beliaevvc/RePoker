# Docs — RePoker

Эта папка — **финальная документация** по проекту (после рефакторинга).

## Как читать эти документы

- Если ты **новый в проекте** — начни с `Docs/architecture.md`, потом `Docs/game-flow.md`.
- Если ты **оптимизируешь FPS/нагрев** — сразу `Docs/profiling.md` → `Docs/performance.md`.
- Если ты **добавляешь фичу/правило** — см. `Docs/architecture.md` (куда класть код) + `Docs/testing.md` (как тестировать).
- Если что-то “не работает” (preview/порты/шрифты/мобилки) — `Docs/faq.md`.

## Содержание

- **Архитектура и границы слоёв**: `Docs/architecture.md`
- **Флоу игры и каскада (таймлайн)**: `Docs/game-flow.md`
- **Профилирование (Chrome/React) — чеклисты и сценарии**: `Docs/profiling.md`
- **Перфоманс: что оптимизировали и как не регресснуть**: `Docs/performance.md`
- **Тестирование и детерминизм (seeded RNG + fake clock)**: `Docs/testing.md`
- **Сборка/preview/деплой**: `Docs/deploy.md`
- **FAQ / Troubleshooting**: `Docs/faq.md`
- **Глоссарий (термины и сокращения)**: `Docs/glossary.md`

## Быстрые ссылки

- Код экрана: `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
- Контроллер экрана: `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`
- Архитектурная карта (рабочая, в memory-bank): `memory-bank/architecture-map.md`


