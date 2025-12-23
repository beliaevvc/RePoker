# Progress (Memory Bank)

## Текущий статус
- **Задача:** Архитектурный аудит RePoker (Clean Architecture) + план рефакторинга/оптимизаций (маленькими шагами, без поломок) + финальная документация.
- **Этап:** В работе (PLAN). Браузер: Chrome → Safari; есть iPhone для проверки.

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
- [x] Mobile perf mode (минимальный, безопасный): добавлен класс `repoker-perf-mobile` (авто на телефонах + override `?perf=1/0`), и CSS‑переопределения для тяжёлых эффектов (уменьшен CRT inset shadow, отключён `mix-blend` на мелких оверлеях, отключён самый дорогой `maxwin-cinematic-noise`). Тех‑проверка: `npm run build` проходит.
- [x] Проверка пользователем (Vercel/домен): `?perf=1/0` работает; визуальная разница минимальна/почти не заметна — считаем ок для “мягкого” режима.
- [x] Mobile perf (только во время анимаций): добавлен класс `repoker-perf-anim` (включается при `repoker-perf-mobile` и состояниях `cascading/dealing/suspense` или `isBusy`). Во время анимаций на мобилке временно отключаем/упрощаем самые дорогие эффекты (blur/filter/mix-blend + бесконечные фоновые анимации), чтобы снизить нагрев и стабилизировать FPS именно на каскадах. Тех‑проверка: `npm run build` проходит.
- [x] Микро‑оптимизация ререндеров: `CascadeMultiplierIndicator` обёрнут в `React.memo`, inline‑колбэк `onOpenHistory={() => ...}` заменён на стабильный `useCallback` (`openHistoryModal`). Цель: уменьшить ререндеры индикатора/центральной сцены при несвязанных апдейтах.

## Известные проблемы / Риски
- Риск перфоманса: большой экран `BalatroInferno.jsx` + много `setState` по таймерам → широкие ререндеры.
- Риск мобилок: тяжёлые визуальные эффекты (blur/градиенты/оверлеи) могут давить GPU.

## Следующие шаги
- **A1 (baseline, без изменений кода):** снять профили в Chrome и принести результаты.
  - Chrome DevTools → **Performance**: Record 10–15s.
    - Сценарий: 1) открыть страницу и подождать 2–3s, 2) нажать PLAY 2 раза, 3) дождаться каскада (если случится) или результата.
    - Сохранить: `Save profile...` (или хотя бы скриншоты: Summary + Main thread flame chart, и FPS).
    - Что выписать: кол-во **Long tasks**, пики **Recalculate Style/Layout**, дропы FPS.
  - React DevTools → **Profiler**: Record, затем тот же сценарий (2 PLAY).
    - Сохранить: `Export profile...` (или скриншоты “Ranked” топ‑компонентов).
    - Что выписать: топ‑3 компонента по “self/total time”, и сколько commit’ов за сценарий.
- **A2:** по результатам baseline зафиксировать hot-spots и выбрать самый безопасный следующий микро‑шаг (обычно: разрез `BalatroInferno.jsx` + `memo`).
- **A1 (дособрать):** всё ещё нужен Chrome Performance trace (CSS/layout/FPS) для полной картины (особенно для мобилок).
- **A1.1 (уточнение):** переснять Performance trace:
  - в **Incognito** с выключенными расширениями (или отдельный Chrome profile без extensions),
  - и/или в **production preview** (`npm run build && npm run preview`) — чтобы убрать `jsxDEV` и снизить шум профилировщика.
  - ✅ Incognito/без extensions — получено (см. выше).
  - ✅ Production preview server поднят: `http://127.0.0.1:5174/` (Vite preview).
