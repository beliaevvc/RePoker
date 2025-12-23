# Archive — 2025-12-23: Cascade refactor + Docs

## Summary

Задача: провести прагматичный архитектурный аудит (Clean Architecture), улучшить перфоманс (без ломания поведения), аккуратно рефакторить каскадный таймлайн/контроллер и завершить это финальной документацией.

Итог: каскадный таймлайн стал более структурированным и тестируемым (scheduler + отдельный refill‑таймлайн + регресс‑тесты на fake clock), инфраструктурные зависимости контроллера инвертированы через DI, UI‑дерево сузили memo‑разрезом. Финальная документация создана и расширена (включая FAQ и глоссарий). В Memory Bank закреплены процессные правила: обновлять `Docs/` перед REFLECT и сверяться с `Docs/architecture.md` на PLAN/BUILD.

## Requirements

- **Clean Architecture (прагматично)**:
  - UI может быть “оркестратором”, но без прямого импорта инфраструктуры: зависимости через DI.
  - application/domain должны оставаться чистыми.
- **Перфоманс приоритет**: FPS/плавность анимаций, особенно на мобилках.
- **Микро‑шаги**: любые изменения маленькими порциями; перед существенным шагом подтверждение; быстрый откат.
- **Инвариант “поведение 1:1”**: рефакторинг не меняет правила/UX без отдельного согласования.
- **Документация — только после рефакторинга** (по финальному состоянию).

## Implementation

### Архитектура / границы

- Зафиксированы слои `src/domain`, `src/application`, `src/infrastructure`, `src/ui`.
- Введён паттерн DI для контроллера экрана:
  - дефолтные зависимости собираются в `src/ui/screens/balatro-inferno/controllerDeps.js`
  - контроллер принимает `deps` (rng/clock/storage/location) вместо прямых импортов.

### Каскад: scheduler + структурирование таймлайна (refactor-1/refactor-2)

- `refactor-1` (без изменения поведения):
  - единый scheduler поверх `deps.clock` с guard по токену (старые таймеры не пробивают новый шаг)
  - централизованный cleanup таймеров.
- `refactor-2` (без изменения поведения):
  - введён `cascadePhaseRef` (ref‑фазы для упорядочивания/отладки; UI не зависит)
  - вынесены утилиты:
    - `src/ui/screens/balatro-inferno/scheduler.js`
    - `src/ui/screens/balatro-inferno/cascadeTimeline.js` (refill‑тайминг)
  - добавлен регресс‑тест refill‑таймлайна на fake clock:
    - `src/ui/screens/balatro-inferno/cascadeTimeline.test.ts`.

### UI / перфоманс (крупными мазками)

- Сузили область ререндеров через memo‑разрез экрана `BalatroInferno` (header/modals/hand/footer).
- Оптимизировали `DevToolsDrawer`: тяжёлый контент не рендерится когда закрыт; генерация текста для копирования по действию.
- Коалесцирование DOM‑измерений CHIPS overflow через `requestAnimationFrame`.
- Убраны внешние текстуры (локальные SVG в `public/textures/*`) и ранняя загрузка шрифта через `index.html`.
- Попытка “мобильного perf‑режима во время анимаций” была откатана по запросу (визуал приоритет).

### Финальная документация

- Корневой `README.md` обновлён (актуальная точка входа экрана).
- Создана папка `Docs/` и заполнена:
  - `Docs/architecture.md`
  - `Docs/game-flow.md`
  - `Docs/profiling.md`
  - `Docs/performance.md`
  - `Docs/testing.md`
  - `Docs/deploy.md`
  - `Docs/faq.md`
  - `Docs/glossary.md`.

### Процесс (закреплено в Memory Bank)

- Перед переходом в REFLECT — обновлять `Docs/` там, где изменения это затрагивают.
- На PLAN/BUILD всегда сверяться с `Docs/architecture.md` (и при спорных случаях — `memory-bank/architecture-map.md`) чтобы правильно размещать код по слоям.

## Testing

- `npm test` (Vitest) — зелёный (в том числе новые тесты `fakeClock`/`cascadeTimeline`).
- `npm run build` — зелёный.
- ESLint — зелёный.

Примечание по среде: в sandbox иногда возможен `EPERM` у Vitest; рабочий запуск одним воркером зафиксирован в `Docs/testing.md`.

## Lessons learned

- **Token‑guard + централизованный cleanup** резко упрощают reasoning о каскадных таймерах и снижают риск “гонок”.
- **Вынос таймлайна в чистую функцию** даёт:
  - тесты без React
  - более безопасные будущие изменения таймингов.
- **Документация эффективнее, когда она “финальная” и отдельная** (в `Docs/`), а Memory Bank хранит процесс/контекст.
- **Процессные инварианты стоит закреплять** (Docs перед REFLECT, архитектура перед PLAN/BUILD) — это снижает архитектурные регрессии.

## References

- Рефлексия: `memory-bank/reflection/reflection-2025-12-23-refactor-docs.md`
- Архитектурная карта (рабочая): `memory-bank/architecture-map.md`
- Финальная документация: `Docs/README.md`
- Ключевые участки кода:
  - `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`
  - `src/ui/screens/balatro-inferno/scheduler.js`
  - `src/ui/screens/balatro-inferno/cascadeTimeline.js`
  - `src/ui/screens/balatro-inferno/cascadeTimeline.test.ts`


