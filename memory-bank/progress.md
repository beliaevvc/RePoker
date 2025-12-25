# Progress (Memory Bank)

## Текущий статус
- **Задача:** Готов к новой задаче
- **Этап:** VAN (ожидание новой задачи)
- **Ветка:** `main`

## Что сделано
- [x] Зафиксирована задача и ограничения (прагматичная Clean Architecture, приоритет перфоманса, возможен поэтапный разрез монолита UI).
- [x] Быстро проверены ключевые точки входа и зависимости слоёв (UI → application → domain; UI использует infrastructure через контроллер).
- [x] Подтверждено: dev-сервер уже запущен (`http://localhost:5173/`).
- [x] Получен экспорт React Profiler (Chrome). Сводка:
  - commits: **296**
  - total commit time: **~1829.7ms**, avg **~6.18ms**, max commit **34ms**
  - топ по суммарному времени: **BalatroInferno (~1596.7ms actual / ~556.2ms self)**, **DevToolsDrawer (~523.8ms actual / ~509.2ms self)**, далее карточки и `CascadeMultiplierIndicator`.
  - частые updaters: `CascadeMultiplierIndicator` (185 commits, дешёвые), `BalatroInferno` (102 commits, средний commit ~15.65ms).
  - вывод: надо снижать “ширину” рендера `BalatroInferno` и отрезать дорогие части (особенно DevTools/log) от игрового таймлайна.
- [x] Сделан микро‑шаг оптимизации: `DevToolsDrawer` теперь не рендерит тяжёлый контент и не строит лог, когда закрыт; текст лога для копирования строится только по клику.
- [x] Получены скриншоты Chrome DevTools Performance (dev-сборка). Наблюдения по trace (~19.95s):
  - Breakdown (Summary): **Scripting ~1752ms**, **Rendering ~845ms**, **Painting ~323ms**, **System ~600ms**.
  - 1st/3rd party: заметный вклад расширений/DevTools (в т.ч. **React Developer Tools ~231ms** main thread).
  - Bottom-up: топ событий — `createTask`, `exports.jsxDEV` (dev runtime), `BalatroInferno`/`Card`, `inspectHooks`.
  - Существенные UI-события: **Recalculate style ~376ms**, **Paint ~230ms**, **Layout ~97ms**.
  - Вывод: текущий trace сильно “зашумлён” dev runtime и расширениями, поэтому нужен повтор baseline в более чистом режиме для достоверных решений (prod preview + без расширений).
- [x] Получены скриншоты Chrome DevTools Performance (чистый / без расширений). Наблюдения (~19.76s):
  - Summary: **Scripting ~967ms**, **Rendering ~699ms**, **Painting ~250ms**, **System ~349ms**.
  - Bottom-up: всё ещё доминируют dev runtime (`exports.jsxDEV`) и React scheduler (`performWorkUntilDeadline`), но уже без заметного вклада расширений.
  - Существенные UI-события: **Recalculate style ~307ms**, **Paint ~169ms**, **Layout ~126ms**.
  - Конкретная привязка к коду: `BalatroInferno.jsx:288` (`recomputeChipsOverflow`) фигурирует в цепочках Recalculate Style/Layout → вероятный кандидат на throttling/coalescing измерений.
- [x] Микро‑оптимизация: `BalatroInferno.jsx` — измерение overflow для CHIPS (`recomputeChipsOverflow`) теперь коалесцируется через `requestAnimationFrame` (не чаще 1 раза за кадр) и использует refs для актуальных значений. Цель: снизить пики `Recalculate Style/Layout` без изменения поведения.
- [x] Переснят Performance trace (чистый) после фикса CHIPS overflow (coalescing через rAF). По присланным скринам (~25.29s):
  - Summary: **Scripting ~1506ms**, **Rendering ~728ms**, **Painting ~314ms**.
  - Bottom-up: **Recalculate style ~314ms**, **Paint ~210.7ms**, **Layout ~83.3ms** (Layout выглядит ниже, чем на прошлом “чистом” снимке; Recalculate Style близко, но трейс длиннее, поэтому для честного сравнения надо одинаковую длительность/сценарий).
  - Вывод: фикс вероятно снижает часть layout-работы, но требуется контрольный замер с тем же таймингом (например 20s) и лучше в production build, чтобы убрать `exports.jsxDEV`.
- [x] Микро‑оптимизация загрузки шрифтов: `Press Start 2P` перенесён из `@import` в `src/balatroInferno.css` в раннюю загрузку через `<link rel="stylesheet">` в `index.html` + добавлены `preconnect` на `fonts.googleapis.com`/`fonts.gstatic.com`. Цель: ускорить первый рендер/LCP и убрать “поздний старт” загрузки шрифтов.
- [x] Убраны внешние текстуры `transparenttextures.com` из UI: добавлены локальные SVG-паттерны в `public/textures/*` и заменены `bg-[url('https://...')]` на `bg-[url('/textures/...')]` (экран + карты). Цель: убрать сетевые запросы, ускорить/стабилизировать загрузку (особенно на iPhone) и снизить риски CSP/офлайна.
- [x] Важно: production preview нужно пересобирать после таких изменений. Поднят свежий preview, чтобы исключить “старый dist” и остаточные запросы на `transparenttextures.com`: `http://127.0.0.1:5175/`.
- [x] Проверка после пересборки: на preview `5175` метрики загрузки стали стабильнее при повторных hard reload/очистке кеша (LCP варьируется от прогрева кеша, но в целом “быстрее”). Важно сравнивать на одном и том же URL/порту и одинаковом режиме кеша.
- [x] Примечание по портам/хосту: preview запущен с `--host 127.0.0.1`, поэтому открывать нужно именно `http://127.0.0.1:5175/` (а не `http://localhost:5175/`, который может резолвиться в IPv6 `::1`).
- [x] Микро‑рефакторинг UI (без изменения поведения): в `BalatroInferno.jsx` верхняя шапка (CHIPS/MAX WIN/ANTE + PAYTABLE + /dev) вынесена в `HeaderBar` и обёрнута в `React.memo`. Цель: сузить область ререндеров во время каскада/таймеров.
- [x] Проверка через React DevTools Profiler (dev): в flamegraph теперь явно виден отдельный `HeaderBar` под `BalatroInferno` — это подтверждает, что разрез сделан корректно и далее можно измерять/снижать ререндеры по зонам (header/modals/board).
- [x] Микро‑рефакторинг UI (без изменения поведения): вынесен хост модалок в `ModalsHost` + `React.memo`. Важное: “тяжёлые” props (history/totalWin/isBusy и т.п.) передаются только когда соответствующая модалка открыта — это снижает ререндеры во время каскада.
- [x] Проверка (React Profiler, dev): `ModalsHost` отмечен как `Memo` и в ряде commit'ов показывает `Did not client render` — т.е. модалки действительно не участвуют в большинстве перерисовок, пока закрыты.
- [x] Микро‑рефакторинг UI (без изменения поведения): блок “5 карт на столе” вынесен в `HandBoard` и обёрнут в `React.memo` (внутри `BalatroInferno.jsx`). Цель: чтобы изменения хедера/контролов/дебага не цепляли дерево карт.
- [x] Тех‑проверка: `npm run build` проходит после выделения `HandBoard`.
- [x] Микро‑рефакторинг UI (без изменения поведения): нижний блок (логотип + TURBO/AUTO/PLAY/+/-) вынесен в `FooterControls` и обёрнут в `React.memo`. Цель: сузить область ререндеров при каскаде/таймерах и отделить контролы от центральной сцены.
- [x] Тех‑проверка: `npm run build` проходит после выделения `FooterControls`.
- [x] Микро‑оптимизация стабильности пропсов: inline `onClick={() => ...}` в `HeaderBar`/`FooterControls` заменены на `useCallback`‑обработчики внутри этих `memo`‑компонентов. Цель: уменьшить “ложные” изменения пропсов и повысить шанс `Did not client render` в профайлере.
- [x] Тех‑проверка: `npm run build` проходит после стабилизации обработчиков.
- [x] Mobile perf mode (мягкий) + perf-anim (во время анимаций) — **ОТКАЧЕНО по просьбе пользователя** (вернули прежний визуал/поведение). Тех‑проверка: `npm run build` проходит.
- [x] Архитектура/вход: `src/App.jsx` теперь импортирует экран напрямую из `src/ui/screens/balatro-inferno/BalatroInferno.jsx`; прокси‑файл `src/BalatroInferno.jsx` удалён (чтобы не было “двух истин” и путаницы). Тех‑проверка: `npm run build` проходит.
- [x] Clean Architecture (DI, аккуратно): `useBalatroInfernoController` теперь получает зависимости через `deps` (rng/clock/storage/location) с дефолтами из нового `src/ui/screens/balatro-inferno/controllerDeps.js`. Убраны прямые ссылки на `nativeRng/browserClock` внутри контроллера — всё идёт через `rng/clock`. Цель: убрать прямую привязку контроллера к инфраструктуре и облегчить тестирование/замену зависимостей без изменения поведения. Тех‑проверка: `npm run build` проходит.
- [x] Микро‑оптимизация ререндеров: `CascadeMultiplierIndicator` обёрнут в `React.memo`, inline‑колбэк `onOpenHistory={() => ...}` заменён на стабильный `useCallback` (`openHistoryModal`). Цель: уменьшить ререндеры индикатора/центральной сцены при несвязанных апдейтах.
- [x] Аудит/док: добавлен документ `memory-bank/architecture-map.md` (слои, правила зависимостей, серые зоны, рекомендации).
- [x] План/контроль: синхронизирован чеклист в `memory-bank/tasks.md` с фактически выполненными шагами (baseline, UI memo-разрез, DI storage/location).
- [x] Test deps (детерминизм): добавлен `fakeClock` (`src/infrastructure/clock/fakeClock.ts`) и `createTestBalatroInfernoDeps()` (`src/ui/screens/balatro-inferno/testDeps.ts`: seeded RNG + fake clock + in-memory storage/location). Добавлены тесты Vitest; прогон: **30/30 passed** (запуск с `npm test -- --pool=threads --maxWorkers=1 ...` в sandbox).
- [x] Рефакторинг (без изменения поведения): упорядочены каскадные таймеры в `useBalatroInfernoController.js` — введён единый `createScheduler()` поверх `deps.clock` (guard по `cascadeAnimTokenRef` + централизованный cleanup). Проверка: **Vitest 30/30 passed**, линтов нет.
- [x] Рефакторинг (без изменения поведения): минимально структурирован cascade state — введён `cascadePhaseRef` (ref‑фазы, UI не зависит), вынесены утилиты `src/ui/screens/balatro-inferno/scheduler.js` и `src/ui/screens/balatro-inferno/cascadeTimeline.js` (refill‑таймлайн), добавлен регрессионный тест `cascadeTimeline.test.ts` на `fakeClock`. Проверка: **Vitest 32/32 passed**, `npm run build` ок.
- [x] Убраны всплывающие подсказки (tooltips) у кнопок: Play, Autogame, Turbo, Minus, Plus — удалены атрибуты `title` из `BalatroInferno.jsx` (6 мест: Turbo, Play, AUTO индикатор, Plus, Autogame, Minus). Проверка: **`npm run build` успешно**, линтер без ошибок.
- [x] Актуализирован `memory-bank/productContext.md`:
  - Обновлён пользовательский сценарий с учётом режимов CASCADE/NORMAL, автоплея и TURBO.
  - Исправлены все пути к файлам (getBestHand: `src/domain/hand-evaluator/getBestHand.ts`, use-cases, constants).
  - Добавлены разделы о режимах игры, автоплее, TURBO режиме и каскадных множителях.
  - Исправлена информация о загрузке шрифтов (через `<link>` в `index.html`, не через `@import`).
  - Добавлена информация об анимациях каскада (vanish/appear/refill-flash) и CRT-оверлее.
  - Все пути к файлам проверены на актуальность через `glob_file_search`.
  - Архив: `memory-bank/archive/archive-2025-01-product-context.md`
- [x] Актуализирован `memory-bank/projectbrief.md`:
  - Обновлено описание проекта с указанием типа (instant-игра, азартная игра) и названий (BalatroInferno — первое, RePoker — второе).
  - Добавлена информация о режиме CASCADE как основном режиме игры.
  - Добавлены разделы "Технический стек" и "Основные особенности".
  - Обновлены цели с учётом текущей архитектуры.
  - Документ синхронизирован с `productContext.md`, `techContext.md` и `README.md`.
  - Архив: `memory-bank/archive/archive-2025-01-projectbrief-update.md`

## Известные проблемы / Риски
- Риск перфоманса: большой экран `BalatroInferno.jsx` + много `setState` по таймерам → широкие ререндеры.
- Риск мобилок: тяжёлые визуальные эффекты (blur/градиенты/оверлеи) могут давить GPU.

## Что сделано (текущая задача)

### Логотип в стиле Balatro Pokerfall — ✅ Завершено и архивировано
- [x] Creative-фаза завершена: зафиксированы решения по цветовой палитре, неоновому свечению, glitch-эффектам и shimmer-анимациям (`memory-bank/creative/creative-logo-pokerfall.md`)
- [x] Добавлены CSS-эффекты в `src/balatroInferno.css`:
  - Неоновый градиент с shimmer (`logo-gradient-gold`): золотой → оранжевый → томатный (5s цикл)
  - Пульсация неонового свечения (`logo-neon-pulse`): 3s цикл с изменением интенсивности text-shadow
  - Усиленные glitch-эффекты: автоматические вспышки каждые 2.8s (±2-3px), при burst более агрессивные (±4-5px)
  - Обновлены ghost-слои: розово-красный и голубой RGB-сдвиги (opacity 0.6, при burst 0.7)
- [x] Обновлён компонент `ResimpleLogo` в `BalatroInferno.jsx`:
  - Изменён текст: "RESIMPLE GAMES" → "POKERFALL"
  - Применены классы `logo-gradient-gold` и `logo-neon-pulse` к тексту
  - Сохранена интерактивность (hover/click burst)
  - Сохранена адаптивность размеров (`clamp()`)
- [x] Добавлена миниатюра джокера слева от текста:
  - Создан компонент `LogoPixelSuit` для пиксельных мастей и джокера
  - Реализованы пиксельные масти через SVG (как в основном компоненте `Card`)
  - Применён пиксельный шрифт `Press Start 2P` для букв
  - Настроено позиционирование (абсолютное, с отступом от текста)
  - Отображается на всех разрешениях (включая мобильные)
- [x] Проверка сборки: `npm run build` успешно (множество итераций)
- [x] Проверка линтера: ошибок нет
- [x] Визуальная проверка в браузере: выполнена в процессе итераций с пользователем
- [x] Ветка `logo-pokerfall` слита в `main`
- [x] Рефлексия: создан файл `memory-bank/reflection/reflection-2025-01-logo-pokerfall.md`
- [x] Архивация: создан файл `memory-bank/archive/archive-2025-01-logo-pokerfall.md`

### Предыдущая задача (архив)
- [x] Добавлен кастомный CSS класс `.hand-board-container-adaptive` в `src/balatroInferno.css` с множеством медиа-запросов для различных разрешений
- [x] Применён класс к контейнеру с картами в `BalatroInferno.jsx` (строка 1074)
- [x] Добавлены правила для множества разрешений по запросам пользователя (378x958, 388x958, 395x958, 367x958, 797x958, 807x958, 824x958, 838x958, 842x958, диапазон 774-846x958, до 353x958 и меньше, универсальное правило для всех разрешений с высотой 958px)
- [x] Исправлен баг с полосками на тексте CascadeMultiplierIndicator (добавлены `transform-gpu` и `will-change-transform`)
- [x] Проверка линтера: ошибок нет
- [x] Проверка сборки: `npm run build` успешно (множество сборок в процессе итераций)
- [x] Рефлексия: создан файл `memory-bank/reflection/reflection-2025-01-XX-adaptive-hand-board-positioning.md`

## Следующие шаги
- Архивация задачи логотипа Pokerfall (`/archive`)

## Архив

- `memory-bank/archive/archive-2025-01-logo-pokerfall.md` (логотип в стиле Balatro Pokerfall)
- `memory-bank/reflection/reflection-2025-01-logo-pokerfall.md` (рефлексия по логотипу Pokerfall)
- `memory-bank/archive/archive-2025-01-XX-adaptive-hand-board-positioning.md`
- `memory-bank/archive/archive-2025-01-XX-disable-mobile-hide-peek.md`
- `memory-bank/archive/archive-2025-12-23-style-guide.md`
- `memory-bank/archive/archive-2025-01-projectbrief-update.md`
- `memory-bank/archive/archive-2025-01-XX-remove-tooltips-buttons.md`
- `memory-bank/archive/archive-2025-12-23-refactor-docs.md`
- `memory-bank/archive/archive-2025-12-23-refactor-plan.md`
